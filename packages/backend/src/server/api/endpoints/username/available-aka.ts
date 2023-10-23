import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { AkaUsernameService } from '@/core/akaUsernameService.js';
import { akaUsernameSchema } from '@/models/AkaUsername.js';

export const meta = {
	tags: ['users'],

	requireCredential: true,

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			available: {
				type: 'boolean',
				optional: false, nullable: false,
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		username: akaUsernameSchema,
	},
	required: ['username'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private akaUsernameService: AkaUsernameService
	) {
		super(meta, paramDef, async (ps, me) => {
			return {
				available: await this.akaUsernameService.isPassUsername(ps.username)
			};
		});
	}
}
