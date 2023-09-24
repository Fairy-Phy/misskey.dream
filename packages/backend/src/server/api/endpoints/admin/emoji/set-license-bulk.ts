/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
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

	errors: {
		notOwnerOrpermissionDenied: {
			message: 'You are not this emoji owner or not assigned to a required role.',
			code: 'NOT_OWNER_OR_PERMISSION_DENIED',
			id: '73952b00-d3e3-4038-b2c6-f4b4532e3906'
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
		ids: { type: 'array', items: {
			type: 'string', format: 'misskey:id',
		} },
		license: {
			type: 'string',
			nullable: true,
			description: 'Use `null` to reset the license.',
		},
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
			if (ps.license == null || ps.license.trim().length === 0) {
				throw new ApiError(meta.errors.requireLicense);
			}

			// 一度すべての所収者を調べる
			if (!await this.roleService.isEmojiModerator(me) && !await this.customEmojiService.isOwnerCheckBulk(ps.ids, me.id)) {
				throw new ApiError(meta.errors.notOwnerOrpermissionDenied);
			}

			await this.customEmojiService.setLicenseBulk(ps.ids, ps.license ?? null);
		});
	}
}
