import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { AkaUsernameRepository } from '@/models/_.js';
import type { MiUser } from '@/models/User.js';
import type { MiEmoji } from '@/models/Emoji.js';
import { IdService } from '@/core/IdService.js';
import { bindThis } from '@/decorators.js';
import type { LogInfoValue, LogTypeValue } from '@/models/EmojiModerationLog.js';
import { allowAkaUsernameRegex } from '@/models/AkaUsername.js';

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
		if (!this.isPassUsername(username)) return;

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
