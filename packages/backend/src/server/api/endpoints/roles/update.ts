import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { RolesRepository } from '@/models/index.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '@/server/api/error.js';

export const meta = {
	tags: ['role'],

	requireCredential: true,

	errors: {
		noSuchRole: {
			message: 'No such role.',
			code: 'NO_SUCH_ROLE',
			id: 'cd23ef55-09ad-428a-ac61-95a45e124b32',
		},
		accessDenied: {
			message: 'Only administrators can edit of the role.',
			code: 'ACCESS_DENIED',
			id: '4266f6c5-8745-44e9-8fb8-7d464085c724',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		roleId: { type: 'string', format: 'misskey:id' },
		name: { type: 'string' },
		description: { type: 'string' },
		color: { type: 'string', nullable: true },
		iconUrl: { type: 'string', nullable: true },
		isPublic: { type: 'boolean' },
	},
	required: [
		'roleId',
		'name',
		'description',
		'color',
		'iconUrl',
		'isPublic',
	],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.rolesRepository)
		private rolesRepository: RolesRepository,

		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps) => {
			const roleExist = await this.rolesRepository.exist({ where: { id: ps.roleId } });
			if (!roleExist) {
				throw new ApiError(meta.errors.noSuchRole);
			}

			const date = new Date();
			await this.rolesRepository.update(ps.roleId, {
				updatedAt: date,
				name: ps.name,
				description: ps.description,
				color: ps.color,
				iconUrl: ps.iconUrl,
				isPublic: ps.isPublic,
				asBadge: ps.iconUrl != null,
			});
			const updated = await this.rolesRepository.findOneByOrFail({ id: ps.roleId });
			this.globalEventService.publishInternalEvent('roleUpdated', updated);
		});
	}
}
