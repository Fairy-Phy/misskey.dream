/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { CustomEmojiService } from '@/core/CustomEmojiService.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireRolePolicy: 'canManageCustomEmojis',
	kind: 'write:admin:emoji',

	errors: {
		notOwnerOrpermissionDenied: {
			message: 'You are not this emoji owner or not assigned to a required role.',
			code: 'NOT_OWNER_OR_PERMISSION_DENIED',
			id: '73952b00-d3e3-4038-b2c6-f4b4532e3906'
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		ids: { type: 'array', items: {
			type: 'string', format: 'misskey:id',
		} },
	},
	required: ['ids'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private customEmojiService: CustomEmojiService,

		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			// 一度すべての所収者を調べる
			const isOwn = await this.customEmojiService.isOwnerCheckBulk(ps.ids, me.id);
			if (!await this.roleService.isEmojiModerator(me) && !isOwn) {
				throw new ApiError(meta.errors.notOwnerOrpermissionDenied);
			}

			if (isOwn) await this.customEmojiService.deleteBulk(ps.ids);
			else await this.customEmojiService.deleteBulk(ps.ids, me);
		});
	}
}
