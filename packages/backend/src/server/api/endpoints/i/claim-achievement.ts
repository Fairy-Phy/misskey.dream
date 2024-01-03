/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { AchievementService, ACHIEVEMENT_TYPES } from '@/core/AchievementService.js';
import { ApiError } from '../../error.js';

export const meta = {
	requireCredential: true,
	prohibitMoved: true,

	errors: {
		noSuchAchieve: {
			message: 'No such default achievement type.',
			code: 'NO_SUCH_ACHIEVE',
			id: 'add62dca-0f5c-4ef9-a8c8-024cf44c1d8d',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		flashId: { type: 'string' },
		name: { type: 'string' },
	},
	required: ['name'],
} as const;

function checkDefaultAchievement(type: string): type is typeof ACHIEVEMENT_TYPES[number] {
	return ACHIEVEMENT_TYPES.some(v => v === type);
}

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private achievementService: AchievementService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.flashId !== undefined) {
				await achievementService.createFromFlash(me.id, ps.flashId, ps.name);
			} else {
				if (!checkDefaultAchievement(ps.name)) {
					throw new ApiError(meta.errors.noSuchAchieve);
				}
				await this.achievementService.create(me.id, ps.name);
			}
		});
	}
}
