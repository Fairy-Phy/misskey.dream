import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { AkaUsernameRepository } from '@/models/_.js';
import type { MiUser } from '@/models/User.js';
import { bindThis } from '@/decorators.js';
import { allowAkaUsernameRegex } from '@/models/AkaUsername.js';
import { IdentifiableError } from '@/misc/identifiable-error.js';

@Injectable()
export class AkaUsernameService {
	constructor(
		@Inject(DI.akaUsernameRepository)
		private akaUsernameRepository: AkaUsernameRepository,
	) {
	}

	@bindThis
	public async isPassUsername(username: string): Promise<boolean> {
		if (!allowAkaUsernameRegex.test(username)) return false;

		return !(await this.akaUsernameRepository.exist({
			where: {
				username
			},
		}));
	}

	@bindThis
	public async upsertUsername(user: { id: MiUser['id'] }, username: string) {
		if (!this.isPassUsername(username)) throw new IdentifiableError('f75642ff-6a1b-4cd3-91c7-13465cdb6008', 'This id has already been used.');

		const userAka = await this.akaUsernameRepository.findOneBy({ userId: user.id });
		if (userAka == null) {
			await this.akaUsernameRepository.insert({
				userId: user.id,
				username
			});
		}
		else {
			await this.akaUsernameRepository.update(user.id, {
				username
			});
		}
	}

	@bindThis
	public async deleteAkaUsername(user: { id: MiUser['id'] }) {
		const userAka = await this.akaUsernameRepository.findOneBy({ userId: user.id });
		if (userAka != null) {
			await this.akaUsernameRepository.delete(user.id);
		}
	}
}
