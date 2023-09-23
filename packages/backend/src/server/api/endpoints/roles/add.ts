import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { DriveFilesRepository, RolesRepository } from '@/models/index.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { DI } from '@/di-symbols.js';
import { IdService } from '@/core/IdService.js';
import { RoleEntityService } from '@/core/entities/RoleEntityService.js';
import { ApiError } from '../../error.js';
import { RoleService } from '@/core/RoleService.js';

export const meta = {
	tags: ['role'],

	requireCredential: true,

	errors: {
		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "fc46b5a4-6b92-4c33-ac66-b806659bb5cf",
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		description: { type: 'string' },
		color: { type: 'string', nullable: true },
		iconUrl: { type: 'string', nullable: true },
		isPublic: { type: 'boolean' },
	},
	required: [
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
		private idService: IdService,
		private roleEntityService: RoleEntityService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const date = new Date();
			const created = await this.rolesRepository.insert({
				id: this.idService.genId(),
				createdAt: date,
				updatedAt: date,
				lastUsedAt: date,
				name: ps.name,
				description: ps.description,
				color: ps.color,
				iconUrl: ps.iconUrl,
				target: 'manual',
				condFormula: {},
				isPublic: ps.isPublic,
				permissionGroup: 'Community',
				isExplorable: true,
				asBadge: ps.iconUrl != null,
				canEditMembersByModerator: true,
				displayOrder: 0,
				policies: {},
				userId: me.id
			}).then(x => this.rolesRepository.findOneByOrFail(x.identifiers[0]));

			this.globalEventService.publishInternalEvent('roleCreated', created);

			// 自動アサイン
			await this.roleService.assign(me.id, created.id, null);

			return await this.roleEntityService.pack(created, me);
		});
	}
}
