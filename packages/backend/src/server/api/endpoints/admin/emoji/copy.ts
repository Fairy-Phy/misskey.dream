/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { EmojisRepository } from '@/models/_.js';
import type { MiDriveFile } from '@/models/DriveFile.js';
import { DI } from '@/di-symbols.js';
import { DriveService } from '@/core/DriveService.js';
import { CustomEmojiService } from '@/core/CustomEmojiService.js';
import { EmojiEntityService } from '@/core/entities/EmojiEntityService.js';
import { ApiError } from '../../../error.js';
import { RoleService } from '@/core/RoleService.js';

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireRolePolicy: 'canManageCustomEmojis',
	kind: 'write:admin:emoji',

	errors: {
		noSuchEmoji: {
			message: "No such emoji.",
			code: "NO_SUCH_EMOJI",
			id: "e2785b66-dca3-4087-9cac-b93c541cc425",
		},
		duplicateName: {
			message: 'Duplicate name.',
			code: 'DUPLICATE_NAME',
			id: 'f7a3462c-4e6e-4069-8421-b9bd4f4c3975',
		},
		unavailable: {
			message: 'emoji import unavailable.',
			code: 'UNAVAILABLE',
			id: '01897589-3bb2-4a6c-81dd-9d0ebac13ca9',
		},
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			id: {
				type: "string",
				optional: false,
				nullable: false,
				format: "id",
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		emojiId: { type: 'string', format: 'misskey:id' },
	},
	required: ['emojiId'],
} as const;

// TODO: ロジックをサービスに切り出す

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,
		private emojiEntityService: EmojiEntityService,
		private customEmojiService: CustomEmojiService,
		private driveService: DriveService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const policies = await this.roleService.getUserPolicies(me ? me.id : null);
			if (!policies.canImportEmojis) {
				throw new ApiError(meta.errors.unavailable);
			}

			const emoji = await this.emojisRepository.findOneBy({ id: ps.emojiId });
			if (emoji == null) {
				throw new ApiError(meta.errors.noSuchEmoji);
			}

			// Duplication Check
			const isDuplicate = await this.customEmojiService.checkDuplicate(emoji.name);
			if (isDuplicate) throw new ApiError(meta.errors.duplicateName);

			let driveFile: MiDriveFile;

			try {
				// Create file
				driveFile = await this.driveService.uploadFromUrl({ url: emoji.originalUrl, user: me, force: true });
			} catch (e) {
				// TODO: need to return Drive Error
				throw new ApiError();
			}

			let emojiLicense = '';
			if (emoji.license != null && emoji.license.trim().length !== 0) {
				emojiLicense = emoji.license;
			} else {
				emojiLicense = `Import by ${emoji.host}`;
			}

			const addedEmoji = await this.customEmojiService.add({
				driveFile,
				name: emoji.name,
				category: emoji.category,
				aliases: emoji.aliases,
				host: null,
				isSensitive: emoji.isSensitive,
				localOnly: emoji.localOnly,
				roleIdsThatCanBeUsedThisEmojiAsReaction: emoji.roleIdsThatCanBeUsedThisEmojiAsReaction,
				license: emojiLicense,
				userId: me.id,
			}, me);

			return this.emojiEntityService.packDetailed(addedEmoji);
		});
	}
}
