/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { UserProfilesRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { AchievementService } from '@/core/AchievementService.js';

export const meta = {
	requireCredential: true,

	res: {
		type: 'array',
		items: {
			type: 'object',
			properties: {
				name: {
					optional: true,
					type: 'string',
				},
				unlockedAt: {
					type: 'number',
				},
				img: { optional: true, type: 'string' },
				bg: { optional: true, type: 'string' },
				frame: { optional: true, type: 'string' },
				title: { optional: true, type: 'string' },
				description: { optional: true, type: 'string' },
				flavor: { optional: true, type: 'string' },
			},
		},
	}
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
		isFlash: { type: 'boolean' },
	},
	required: ['userId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private achievementService: AchievementService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.isFlash) {
				const achieves = await this.achievementService.getAndRemoveNoExistsFlashAchievement(ps.userId);
				return achieves.map(v => ({
					unlockedAt: v.unlockedAt,
					img: v.img,
					bg: v.bg,
					frame: v.frame,
					title: v.title,
					description: me.id === ps.userId ? v.description : '???',
					flavor: me.id === ps.userId ? v.flavor : ''
				}));
			}
			const profile = await this.userProfilesRepository.findOneByOrFail({ userId: ps.userId });

			return profile.achievements;
		});
	}
}
