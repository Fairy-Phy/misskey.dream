import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { EmojiModerationLog, EmojiModerationLogsRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { ApiError } from '@/server/api/error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireRolePolicy: 'canManageCustomEmojis',
	kind: 'read:admin:emoji-log',

	cacheSec: 3600,

	errors: {
		limitExceedEmojiIds: {
			message: 'The number of elements in the id array passed exceeds the limit.',
			code: 'LIMIT_EXCEED_EMOJI_IDS',
			id: '1d39dbf5-774e-4886-8f1c-300985228386',
		},
	},

	res: {
		type: 'array',
		items: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'misskey:id',
				},
				logs: {
					type: 'array',
					optional: false, nullable: false,
					ref: 'EmojiChangeLogs',
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		ids: {
			type: 'array',
			items: {
				type: 'string',
				format: 'misskey:id',
			},
		},
	},
	required: ['ids'],
} as const;

const MAXIMUM_EMOJI_GET_COUNT = 100;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.emojiModerationLogsRepository)
		private emojiModerationLogsRepository: EmojiModerationLogsRepository,

		private userEntityService: UserEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.ids.length > MAXIMUM_EMOJI_GET_COUNT) {
				throw new ApiError(meta.errors.limitExceedEmojiIds);
			}

			const logs = await this.emojiModerationLogsRepository.find({
				where: {
					emojiId: In(ps.ids),
				},
				order: {
					createdAt: 'ASC',
				},
			});

			// Object.groupByと同じようなもの
			const dictedLogs = logs.reduce((obj, log) => {
				const key = log.emojiId;
				if (!(key in obj)) {
					obj[key] = [];
				}
				obj[key].push(log);
				return obj;
			}, {} as Record<string, EmojiModerationLog[]>);

			const promisedResponseList = Object.entries(dictedLogs).map(async (e) => ({
				id: e[0],
				logs: await Promise.all(
					e[1].map(async (v) => ({
						id: v.id,
						createDate: v.createdAt.toISOString(),
						userId: v.userId,
						user: await this.userEntityService.pack(v.user ?? v.userId),
						type: v.type,
						changesProperties: v.info,
					})),
				),
			}));

			return await Promise.all(promisedResponseList);
		});
	}
}
