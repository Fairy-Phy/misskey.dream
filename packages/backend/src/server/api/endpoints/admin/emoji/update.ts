/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { CustomEmojiService } from '@/core/CustomEmojiService.js';
import type { DriveFilesRepository, EmojisRepository, MiEmoji, UsersRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../../error.js';
import { RoleService } from '@/core/RoleService.js';
import { LogInfoValue } from '@/models/EmojiModerationLog.js';
import { EmojiModerationLogService } from '@/core/EmojiModerationLogService.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireRolePolicy: 'canManageCustomEmojis',
	kind: 'write:admin:emoji',

	errors: {
		noSuchEmoji: {
			message: 'No such emoji.',
			code: 'NO_SUCH_EMOJI',
			id: '684dec9d-a8c2-4364-9aa8-456c49cb1dc8',
		},
		noSuchFile: {
			message: 'No such file.',
			code: 'NO_SUCH_FILE',
			id: '14fb9fd9-0731-4e2f-aeb9-f09e4740333d',
		},
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '2b730f78-1179-461b-88ad-d24c9af1a5ce',
		},
		sameNameEmojiExists: {
			message: 'Emoji that have same name already exists.',
			code: 'SAME_NAME_EMOJI_EXISTS',
			id: '7180fe9d-1ee3-bff9-647d-fe9896d2ffb8',
		},
		notOwnerOrpermissionDenied: {
			message: 'You are not this emoji owner or not assigned to a required role.',
			code: 'NOT_OWNER_OR_PERMISSION_DENIED',
			id: '73952b00-d3e3-4038-b2c6-f4b4532e3906'
		},
		rolePermissionDenied: {
			message: 'You are not assigned to a emoji moderator role.',
			code: 'ROLE_PERMISSION_DENIED',
			id: '43049d5b-e1c4-4b90-9c16-0e46cf06f18b',
		},
		requireLicense: {
			message: 'You must enter the license into add emoji.',
			code: 'REQUIRE_LICENSE',
			id: 'bf030fe3-0105-41a6-931b-577dda09df34',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		id: { type: 'string', format: 'misskey:id' },
		name: { type: 'string', pattern: '^[a-z0-9_]+$' },
		fileId: { type: 'string', format: 'misskey:id' },
		category: {
			type: 'string',
			nullable: true,
			description: 'Use `null` to reset the category.',
		},
		aliases: { type: 'array', items: {
			type: 'string',
		} },
		license: { type: 'string', nullable: true },
		isSensitive: { type: 'boolean' },
		localOnly: { type: 'boolean' },
		roleIdsThatCanBeUsedThisEmojiAsReaction: { type: 'array', items: {
			type: 'string',
		}
		},
		userId: { type: 'string' },
	},
	anyOf: [
		{ required: ['id'] },
		{ required: ['name'] },
	],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private roleService: RoleService,

		private customEmojiService: CustomEmojiService,

		private emojiModerationLogService: EmojiModerationLogService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let driveFile;
			if (ps.fileId) {
				driveFile = await this.driveFilesRepository.findOneBy({
					id: ps.fileId,
				});
				if (driveFile == null) throw new ApiError(meta.errors.noSuchFile);
			}

			let oldEmoji: MiEmoji;
			if (ps.id) {
				const emoji = await this.customEmojiService.getEmojiById(ps.id);
				if (!emoji) throw new ApiError(meta.errors.noSuchEmoji);
				oldEmoji = emoji;
				if (ps.name && (ps.name !== emoji.name)) {
					const isDuplicate = await this.customEmojiService.checkDuplicate(ps.name);
					if (isDuplicate) throw new ApiError(meta.errors.sameNameEmojiExists);
				}
			} else {
				if (!ps.name) throw new Error('Invalid Params unexpectedly passed. This is a BUG. Please report it to the development team.');
				const emoji = await this.customEmojiService.getEmojiByName(ps.name);
				if (!emoji) throw new ApiError(meta.errors.noSuchEmoji);
				oldEmoji = emoji;
			}

			const isEmojiModerator = await this.roleService.isEmojiModerator(me);

			if (ps.userId && oldEmoji.userId !== ps.userId) {
				if (!isEmojiModerator)
					throw new ApiError(meta.errors.rolePermissionDenied);

				if (await this.usersRepository.countBy({ id: ps.userId }) === 0)
					throw new ApiError(meta.errors.noSuchUser);
			}

			if (oldEmoji.license !== ps.license && (ps.license == null || ps.license.trim().length === 0)) {
				throw new ApiError(meta.errors.requireLicense);
			}

			if ((
				driveFile ||
				oldEmoji.name !== ps.name ||
				oldEmoji.category !== ps.category ||
				oldEmoji.license !== ps.license ||
				oldEmoji.isSensitive !== ps.isSensitive ||
				oldEmoji.localOnly !== ps.localOnly) &&
				!isEmojiModerator &&
				oldEmoji.userId !== me.id
			) {
				throw new ApiError(meta.errors.notOwnerOrpermissionDenied);
			}

			await this.customEmojiService.update(oldEmoji.id, {
				driveFile,
				name: ps.name,
				category: ps.category,
				aliases: ps.aliases,
				license: ps.license,
				isSensitive: ps.isSensitive,
				localOnly: ps.localOnly,
				roleIdsThatCanBeUsedThisEmojiAsReaction:
					ps.roleIdsThatCanBeUsedThisEmojiAsReaction,
				...(ps.userId && oldEmoji.userId !== ps.userId ? { userId: ps.userId } : {}),
			}, oldEmoji.userId !== me.id ? me : undefined);

			const changes: LogInfoValue[] = [];
			if (driveFile) {
				changes.push({
					type: 'originalUrl',
					changeInfo: {
						before: oldEmoji.originalUrl,
						after: driveFile.url,
					},
				});
			}
			if (oldEmoji.name !== ps.name) {
				changes.push({
					type: 'name',
					changeInfo: {
						before: oldEmoji.name,
						after: ps.name,
					},
				});
			}
			if (oldEmoji.category !== ps.category) {
				changes.push({
					type: 'category',
					changeInfo: {
						before: oldEmoji.category,
						after: ps.category,
					},
				});
			}
			if (oldEmoji.license !== ps.license) {
				changes.push({
					type: 'license',
					changeInfo: {
						before: oldEmoji.license,
						after: ps.license,
					},
				});
			}
			if (oldEmoji.isSensitive !== ps.isSensitive) {
				changes.push({
					type: 'isSensitive',
					changeInfo: {
						before: oldEmoji.isSensitive,
						after: ps.isSensitive,
					},
				});
			}
			if (oldEmoji.localOnly !== ps.localOnly) {
				changes.push({
					type: 'localOnly',
					changeInfo: {
						before: oldEmoji.localOnly,
						after: ps.localOnly,
					},
				});
			}
			if (ps.userId && oldEmoji.userId !== ps.userId) {
				await this.usersRepository.increment({ id: ps.userId }, 'emojiCount', 1);
				if (oldEmoji?.userId) {
					await this.usersRepository.decrement({ id: oldEmoji.userId }, 'emojiCount', 1);
				}
				changes.push({
					type: 'userId',
					changeInfo: {
						before: oldEmoji.userId,
						after: ps.userId,
					},
				});
			}

			//エイリアスはbeforeに削除されたもの、afterに追加されたものを書く
			if (
				ps.aliases &&
				(
					oldEmoji.aliases.length !== ps.aliases.length ||
					!oldEmoji.aliases.every(v => ps.aliases && ps.aliases.includes(v))
				)
			) {
				changes.push({
					type: 'aliases',
					changeInfo: {
						before: oldEmoji.aliases.filter(v => ps.aliases && !ps.aliases.includes(v)),
						after: ps.aliases.filter(v => !oldEmoji.aliases.includes(v)),
					},
				});
			}

			await this.emojiModerationLogService.insertEmojiModerationLog(me, { id: oldEmoji.id }, 'Update', changes);
		});
	}
}
