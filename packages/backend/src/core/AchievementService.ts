/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { FlashsRepository, UserProfilesRepository } from '@/models/_.js';
import type { MiUser } from '@/models/User.js';
import type { MiFlash } from '@/models/Flash.js';
import { DI } from '@/di-symbols.js';
import { bindThis } from '@/decorators.js';
import { NotificationService } from '@/core/NotificationService.js';
import { IdentifiableError } from '@/misc/identifiable-error.js';

export const ACHIEVEMENT_TYPES = [
	'notes1',
	'notes10',
	'notes100',
	'notes500',
	'notes1000',
	'notes5000',
	'notes10000',
	'notes20000',
	'notes30000',
	'notes40000',
	'notes50000',
	'notes60000',
	'notes70000',
	'notes80000',
	'notes90000',
	'notes100000',
	'login3',
	'login7',
	'login15',
	'login30',
	'login60',
	'login100',
	'login200',
	'login300',
	'login400',
	'login500',
	'login600',
	'login700',
	'login800',
	'login900',
	'login1000',
	'passedSinceAccountCreated1',
	'passedSinceAccountCreated2',
	'passedSinceAccountCreated3',
	'loggedInOnBirthday',
	'loggedInOnNewYearsDay',
	'noteClipped1',
	'noteFavorited1',
	'myNoteFavorited1',
	'profileFilled',
	'markedAsCat',
	'following1',
	'following10',
	'following50',
	'following100',
	'following300',
	'followers1',
	'followers10',
	'followers50',
	'followers100',
	'followers300',
	'followers500',
	'followers1000',
	'collectAchievements30',
	'viewAchievements3min',
	'iLoveMisskey',
	'foundTreasure',
	'client30min',
	'client60min',
	'noteDeletedWithin1min',
	'postedAtLateNight',
	'postedAt0min0sec',
	'selfQuote',
	'htl20npm',
	'viewInstanceChart',
	'outputHelloWorldOnScratchpad',
	'open3windows',
	'driveFolderCircularReference',
	'reactWithoutRead',
	'clickedClickHere',
	'justPlainLucky',
	'setNameToSyuilo',
	'cookieClicked',
	'brainDiver',
	'smashTestNotificationButton',
	'tutorialCompleted',
] as const;

export const ACHIEVEMENT_FRAMES = [
	'bronze',
	'silver',
	'gold',
	'platinum',
] as const;

@Injectable()
export class AchievementService {
	constructor(
		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		@Inject(DI.flashsRepository)
		private flashsRepository: FlashsRepository,

		private notificationService: NotificationService,
	) {
	}

	@bindThis
	public async create(
		userId: MiUser['id'],
		type: typeof ACHIEVEMENT_TYPES[number],
	): Promise<void> {
		if (!ACHIEVEMENT_TYPES.includes(type)) return;

		const date = Date.now();

		const profile = await this.userProfilesRepository.findOneByOrFail({ userId: userId });

		if (profile.achievements.some(a => a.name === type)) return;

		await this.userProfilesRepository.update(userId, {
			achievements: [...profile.achievements, {
				name: type,
				unlockedAt: date,
			}],
		});

		this.notificationService.createNotification(userId, 'achievementEarned', {
			achievement: type,
		});
	}

	@bindThis
	public async createFromFlash(
		userId: MiUser['id'],
		flashId: MiFlash['id'],
		achieveId: string
	) {
		const flash = await this.flashsRepository.findOneByOrFail({ id: flashId });
		const achieve = flash.achievements.find(v => v.achieveId === achieveId);
		if (achieve === undefined) {
			throw new IdentifiableError('6a27e5fc-d33e-4581-a919-b6633e2619aa', 'No such play achievement.');
		}

		const date = Date.now();

		const profile = await this.userProfilesRepository.findOneByOrFail({ userId: userId });

		if (profile.flashAchievements.some(a => a.flashId === flash.id && a.achieveId === achieve.achieveId)) return;

		await this.userProfilesRepository.update(userId, {
			flashAchievements: [...profile.flashAchievements, {
				flashId: flash.id,
				achieveId: achieve.achieveId,
				unlockedAt: date,
			}],
		});

		this.notificationService.createNotification(userId, 'achievementEarned', {
			achievement: achieve.title,
		});
	}

	@bindThis
	private async getFlashAchievement(flashId: MiFlash['id'], achieveId: string): Promise<MiFlash['achievements'][number] | undefined> {
		const flash = await this.flashsRepository.findOneBy({ id: flashId, });
		if (flash == null) return undefined;

		return flash.achievements.find(v => v.achieveId === achieveId);
	}

	@bindThis
	public async getAndRemoveNoExistsFlashAchievement(userId: MiUser['id']): Promise<(MiFlash['achievements'][number] & { unlockedAt: number })[]> {
		const profile = await this.userProfilesRepository.findOneByOrFail({ userId: userId });

		const flashAchievements = [];
		const result: (MiFlash['achievements'][number] & { unlockedAt: number })[] = [];
		for (const fa of profile.flashAchievements) {
			const achieve = await this.getFlashAchievement(fa.flashId, fa.achieveId);
			if (achieve !== undefined) {
				flashAchievements.push(fa);
				result.push({
					...achieve,
					unlockedAt: fa.unlockedAt,
				});
			}
		}

		await this.userProfilesRepository.update(userId, {
			flashAchievements,
		});

		return result;
	}
}
