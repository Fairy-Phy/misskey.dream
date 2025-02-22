/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ms from 'ms';
import { Inject, Injectable } from '@nestjs/common';
import type { FlashsRepository } from '@/models/_.js';
import { IdService } from '@/core/IdService.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { FlashEntityService } from '@/core/entities/FlashEntityService.js';
import { ACHIEVEMENT_FRAMES } from '@/core/AchievementService.js';

export const meta = {
	tags: ['flash'],

	requireCredential: true,

	prohibitMoved: true,

	kind: 'write:flash',

	limit: {
		duration: ms('1hour'),
		max: 10,
	},

	errors: {
	},

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'Flash',
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		summary: { type: 'string' },
		script: { type: 'string' },
		permissions: { type: 'array', items: {
			type: 'string',
		} },
		achievements: { type: 'array', items: {
			type: 'object',
			properties: {
				achieveId: { type: 'string', pattern: '^[a-zA-Z0-9_]+$' },
				img: { type: 'string' },
				bg: { type: 'string' },
				frame: { type: 'string', enum: ACHIEVEMENT_FRAMES },
				title: { type: 'string' },
				description: { type: 'string' },
				flavor: { type: 'string' },
			},
			required: ['achieveId', 'img', 'bg', 'frame', 'title', 'description', 'flavor'],
		} },
		visibility: { type: 'string', enum: ['public', 'private'], default: 'public' },
	},
	required: ['title', 'summary', 'script', 'permissions', 'achievements'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.flashsRepository)
		private flashsRepository: FlashsRepository,

		private flashEntityService: FlashEntityService,
		private idService: IdService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const flash = await this.flashsRepository.insertOne({
				id: this.idService.gen(),
				userId: me.id,
				updatedAt: new Date(),
				title: ps.title,
				summary: ps.summary,
				script: ps.script,
				permissions: ps.permissions,
				achievements: ps.achievements,
				visibility: ps.visibility,
			});

			return await this.flashEntityService.pack(flash);
		});
	}
}
