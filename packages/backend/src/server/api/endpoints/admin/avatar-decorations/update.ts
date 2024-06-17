/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { AvatarDecorationService } from '@/core/AvatarDecorationService.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireRolePolicy: 'canManageAvatarDecorations',
	kind: 'write:admin:avatar-decorations',

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
		id: { type: 'string', format: 'misskey:id' },
		name: { type: 'string', minLength: 1 },
		description: { type: 'string' },
		url: { type: 'string', minLength: 1 },
		roleIdsThatCanBeUsedThisDecoration: { type: 'array', items: {
			type: 'string',
		} },
		userId: { type: 'string', format: 'misskey:id' },
		license: { type: 'string', nullable: true },
	},
	required: ['id', 'userId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private avatarDecorationService: AvatarDecorationService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (!(await this.avatarDecorationService.checkOwnerOrModerator(ps.id, me))) {
				throw new ApiError(meta.errors.notOwnerOrpermissionDenied);
			}

			if (!(await this.avatarDecorationService.checkAllowLicense(ps.id, ps.license))) {
				throw new ApiError(meta.errors.requireLicense);
			}

			await this.avatarDecorationService.update(ps.id, {
				name: ps.name,
				description: ps.description,
				url: ps.url,
				roleIdsThatCanBeUsedThisDecoration: ps.roleIdsThatCanBeUsedThisDecoration,
				userId: ps.userId,
				license: ps.license ? ps.license : null,
			}, me);
		});
	}
}
