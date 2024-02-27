/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import type { Config } from '@/config.js';
import { DI } from '@/di-symbols.js';
import type Logger from '@/logger.js';
import { QueueService } from '@/core/QueueService.js';
import { bindThis } from '@/decorators.js';
import { getJobInfo } from './get-job-info.js';
import { WebhookDeliverProcessorService } from './processors/WebhookDeliverProcessorService.js';
import { EndedPollNotificationProcessorService } from './processors/EndedPollNotificationProcessorService.js';
import { DeliverProcessorService } from './processors/DeliverProcessorService.js';
import { InboxProcessorService } from './processors/InboxProcessorService.js';
import { DeleteDriveFilesProcessorService } from './processors/DeleteDriveFilesProcessorService.js';
import { ExportCustomEmojisProcessorService } from './processors/ExportCustomEmojisProcessorService.js';
import { ExportNotesProcessorService } from './processors/ExportNotesProcessorService.js';
import { ExportClipsProcessorService } from './processors/ExportClipsProcessorService.js';
import { ExportFollowingProcessorService } from './processors/ExportFollowingProcessorService.js';
import { ExportMutingProcessorService } from './processors/ExportMutingProcessorService.js';
import { ExportBlockingProcessorService } from './processors/ExportBlockingProcessorService.js';
import { ExportUserListsProcessorService } from './processors/ExportUserListsProcessorService.js';
import { ExportAntennasProcessorService } from './processors/ExportAntennasProcessorService.js';
import { ImportFollowingProcessorService } from './processors/ImportFollowingProcessorService.js';
import { ImportMutingProcessorService } from './processors/ImportMutingProcessorService.js';
import { ImportBlockingProcessorService } from './processors/ImportBlockingProcessorService.js';
import { ImportUserListsProcessorService } from './processors/ImportUserListsProcessorService.js';
import { ImportCustomEmojisProcessorService } from './processors/ImportCustomEmojisProcessorService.js';
import { ImportAntennasProcessorService } from './processors/ImportAntennasProcessorService.js';
import { DeleteAccountProcessorService } from './processors/DeleteAccountProcessorService.js';
import { ExportFavoritesProcessorService } from './processors/ExportFavoritesProcessorService.js';
import { CleanRemoteFilesProcessorService } from './processors/CleanRemoteFilesProcessorService.js';
import { DeleteFileProcessorService } from './processors/DeleteFileProcessorService.js';
import { RelationshipProcessorService } from './processors/RelationshipProcessorService.js';
import { TickChartsProcessorService } from './processors/TickChartsProcessorService.js';
import { ResyncChartsProcessorService } from './processors/ResyncChartsProcessorService.js';
import { CleanChartsProcessorService } from './processors/CleanChartsProcessorService.js';
import { CheckExpiredMutingsProcessorService } from './processors/CheckExpiredMutingsProcessorService.js';
import { CleanProcessorService } from './processors/CleanProcessorService.js';
import { AggregateRetentionProcessorService } from './processors/AggregateRetentionProcessorService.js';
import { QueueLoggerService } from './QueueLoggerService.js';

@Injectable()
export class QueueProcessorService implements OnApplicationShutdown {
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config,

		private queueLoggerService: QueueLoggerService,
		private queueService: QueueService,
		private webhookDeliverProcessorService: WebhookDeliverProcessorService,
		private endedPollNotificationProcessorService: EndedPollNotificationProcessorService,
		private deliverProcessorService: DeliverProcessorService,
		private inboxProcessorService: InboxProcessorService,
		private deleteDriveFilesProcessorService: DeleteDriveFilesProcessorService,
		private exportCustomEmojisProcessorService: ExportCustomEmojisProcessorService,
		private exportNotesProcessorService: ExportNotesProcessorService,
		private exportClipsProcessorService: ExportClipsProcessorService,
		private exportFavoritesProcessorService: ExportFavoritesProcessorService,
		private exportFollowingProcessorService: ExportFollowingProcessorService,
		private exportMutingProcessorService: ExportMutingProcessorService,
		private exportBlockingProcessorService: ExportBlockingProcessorService,
		private exportUserListsProcessorService: ExportUserListsProcessorService,
		private exportAntennasProcessorService: ExportAntennasProcessorService,
		private importFollowingProcessorService: ImportFollowingProcessorService,
		private importMutingProcessorService: ImportMutingProcessorService,
		private importBlockingProcessorService: ImportBlockingProcessorService,
		private importUserListsProcessorService: ImportUserListsProcessorService,
		private importCustomEmojisProcessorService: ImportCustomEmojisProcessorService,
		private importAntennasProcessorService: ImportAntennasProcessorService,
		private deleteAccountProcessorService: DeleteAccountProcessorService,
		private deleteFileProcessorService: DeleteFileProcessorService,
		private cleanRemoteFilesProcessorService: CleanRemoteFilesProcessorService,
		private relationshipProcessorService: RelationshipProcessorService,
		private tickChartsProcessorService: TickChartsProcessorService,
		private resyncChartsProcessorService: ResyncChartsProcessorService,
		private cleanChartsProcessorService: CleanChartsProcessorService,
		private aggregateRetentionProcessorService: AggregateRetentionProcessorService,
		private checkExpiredMutingsProcessorService: CheckExpiredMutingsProcessorService,
		private cleanProcessorService: CleanProcessorService,
	) {
		this.logger = this.queueLoggerService.logger;
	}

	@bindThis
	public start(): void {
		function renderError(e: Error): any {
			if (e) { // 何故かeがundefinedで来ることがある
				return {
					stack: e.stack,
					message: e.message,
					name: e.name,
				};
			} else {
				return {
					stack: '?',
					message: '?',
					name: '?',
				};
			}
		}

		const systemLogger = this.logger.createSubLogger('system');

		/*this.systemQueueWorker
			.on('active', (job) => systemLogger.debug(`active id=${job.id}`))
			.on('completed', (job, result) => systemLogger.debug(`completed(${result}) id=${job.id}`))
			.on('failed', (job, err) => systemLogger.warn(`failed(${err.stack}) id=${job ? job.id : '-'}`, { job, e: renderError(err) }))
			.on('error', (err: Error) => systemLogger.error(`error ${err.stack}`, { e: renderError(err) }))
			.on('stalled', (jobId) => systemLogger.warn(`stalled id=${jobId}`));
		//#endregion

		//#region db
		this.dbQueueWorker = new Bull.Worker(QUEUE.DB, (job) => {
			switch (job.name) {
				case 'deleteDriveFiles': return this.deleteDriveFilesProcessorService.process(job);
				case 'exportCustomEmojis': return this.exportCustomEmojisProcessorService.process(job);
				case 'exportNotes': return this.exportNotesProcessorService.process(job);
				case 'exportClips': return this.exportClipsProcessorService.process(job);
				case 'exportFavorites': return this.exportFavoritesProcessorService.process(job);
				case 'exportFollowing': return this.exportFollowingProcessorService.process(job);
				case 'exportMuting': return this.exportMutingProcessorService.process(job);
				case 'exportBlocking': return this.exportBlockingProcessorService.process(job);
				case 'exportUserLists': return this.exportUserListsProcessorService.process(job);
				case 'exportAntennas': return this.exportAntennasProcessorService.process(job);
				case 'importFollowing': return this.importFollowingProcessorService.process(job);
				case 'importFollowingToDb': return this.importFollowingProcessorService.processDb(job);
				case 'importMuting': return this.importMutingProcessorService.process(job);
				case 'importBlocking': return this.importBlockingProcessorService.process(job);
				case 'importBlockingToDb': return this.importBlockingProcessorService.processDb(job);
				case 'importUserLists': return this.importUserListsProcessorService.process(job);
				case 'importCustomEmojis': return this.importCustomEmojisProcessorService.process(job);
				case 'importAntennas': return this.importAntennasProcessorService.process(job);
				case 'deleteAccount': return this.deleteAccountProcessorService.process(job);
				default: throw new Error(`unrecognized job type ${job.name} for db`);
			}
		}, {
			...baseQueueOptions(this.config, QUEUE.DB),
			autorun: false,
		});

		const dbLogger = this.logger.createSubLogger('db');

		this.dbQueueWorker
			.on('active', (job) => dbLogger.debug(`active id=${job.id}`))
			.on('completed', (job, result) => dbLogger.debug(`completed(${result}) id=${job.id}`))
			.on('failed', (job, err) => dbLogger.warn(`failed(${err.stack}) id=${job ? job.id : '-'}`, { job, e: renderError(err) }))
			.on('error', (err: Error) => dbLogger.error(`error ${err.stack}`, { e: renderError(err) }))
			.on('stalled', (jobId) => dbLogger.warn(`stalled id=${jobId}`));
		//#endregion

		//#region deliver
		this.deliverQueueWorker = new Bull.Worker(QUEUE.DELIVER, (job) => this.deliverProcessorService.process(job), {
			...baseQueueOptions(this.config, QUEUE.DELIVER),
			autorun: false,
			concurrency: this.config.deliverJobConcurrency ?? 128,
			limiter: {
				max: this.config.deliverJobPerSec ?? 128,
				duration: 1000,
			},
			settings: {
				backoffStrategy: httpRelatedBackoff,
			},
		});*/

		const deliverLogger = this.logger.createSubLogger('deliver');
		const webhookLogger = this.logger.createSubLogger('webhook');
		const inboxLogger = this.logger.createSubLogger('inbox');
		const dbLogger = this.logger.createSubLogger('db');

		/*this.webhookDeliverQueueWorker
			.on('active', (job) => webhookLogger.debug(`active ${getJobInfo(job, true)} to=${job.data.to}`))
			.on('completed', (job, result) => webhookLogger.debug(`completed(${result}) ${getJobInfo(job, true)} to=${job.data.to}`))
			.on('failed', (job, err) => webhookLogger.warn(`failed(${err.stack}) ${getJobInfo(job)} to=${job ? job.data.to : '-'}`))
			.on('error', (err: Error) => webhookLogger.error(`error ${err.stack}`, { e: renderError(err) }))
			.on('stalled', (jobId) => webhookLogger.warn(`stalled id=${jobId}`));
		//#endregion

		//#region relationship
		this.relationshipQueueWorker = new Bull.Worker(QUEUE.RELATIONSHIP, (job) => {
			switch (job.name) {
				case 'follow': return this.relationshipProcessorService.processFollow(job);
				case 'unfollow': return this.relationshipProcessorService.processUnfollow(job);
				case 'block': return this.relationshipProcessorService.processBlock(job);
				case 'unblock': return this.relationshipProcessorService.processUnblock(job);
				default: throw new Error(`unrecognized job type ${job.name} for relationship`);
			}
		}, {
			...baseQueueOptions(this.config, QUEUE.RELATIONSHIP),
			autorun: false,
			concurrency: this.config.relationshipJobConcurrency ?? 16,
			limiter: {
				max: this.config.relationshipJobPerSec ?? 64,
				duration: 1000,
			},
		});*/

		const relationshipLogger = this.logger.createSubLogger('relationship');

		/*
		this.relationshipQueueWorker
			.on('active', (job) => relationshipLogger.debug(`active id=${job.id}`))
			.on('completed', (job, result) => relationshipLogger.debug(`completed(${result}) id=${job.id}`))
			.on('failed', (job, err) => relationshipLogger.warn(`failed(${err.stack}) id=${job ? job.id : '-'}`, { job, e: renderError(err) }))
			.on('error', (err: Error) => relationshipLogger.error(`error ${err.stack}`, { e: renderError(err) }))
			.on('stalled', (jobId) => relationshipLogger.warn(`stalled id=${jobId}`));
		//#endregion

		//#region object storage
		this.objectStorageQueueWorker = new Bull.Worker(QUEUE.OBJECT_STORAGE, (job) => {
			switch (job.name) {
				case 'deleteFile': return this.deleteFileProcessorService.process(job);
				case 'cleanRemoteFiles': return this.cleanRemoteFilesProcessorService.process(job);
				default: throw new Error(`unrecognized job type ${job.name} for objectStorage`);
			}
		}, {
			...baseQueueOptions(this.config, QUEUE.OBJECT_STORAGE),
			autorun: false,
			concurrency: 16,
		});*/

		const objectStorageLogger = this.logger.createSubLogger('objectStorage');

		this.queueService.systemQueue
			.on('waiting', (jobId) => systemLogger.debug(`waiting id=${jobId}`))
			.on('active', (job) => systemLogger.debug(`active id=${job.id}`))
			.on('completed', (job, result) => systemLogger.debug(`completed(${result}) id=${job.id}`))
			.on('failed', (job, err) => systemLogger.warn(`failed(${err}) id=${job.id}`, { job, e: renderError(err) }))
			.on('error', (job: any, err: Error) => systemLogger.error(`error ${err}`, { job, e: renderError(err) }))
			.on('stalled', (job) => systemLogger.warn(`stalled id=${job.id}`));

		this.queueService.deliverQueue
			.on('waiting', (jobId) => deliverLogger.debug(`waiting id=${jobId}`))
			.on('active', (job) => deliverLogger.debug(`active ${getJobInfo(job, true)} to=${job.data.to}`))
			.on('completed', (job, result) => deliverLogger.debug(`completed(${result}) ${getJobInfo(job, true)} to=${job.data.to}`))
			.on('failed', (job, err) => deliverLogger.warn(`failed(${err}) ${getJobInfo(job)} to=${job.data.to}`))
			.on('error', (job: any, err: Error) => deliverLogger.error(`error ${err}`, { job, e: renderError(err) }))
			.on('stalled', (job) => deliverLogger.warn(`stalled ${getJobInfo(job)} to=${job.data.to}`));

		this.queueService.inboxQueue
			.on('waiting', (jobId) => inboxLogger.debug(`waiting id=${jobId}`))
			.on('active', (job) => inboxLogger.debug(`active ${getJobInfo(job, true)}`))
			.on('completed', (job, result) => inboxLogger.debug(`completed(${result}) ${getJobInfo(job, true)}`))
			.on('failed', (job, err) => inboxLogger.warn(`failed(${err}) ${getJobInfo(job)} activity=${job.data.activity ? job.data.activity.id : 'none'}`, { job, e: renderError(err) }))
			.on('error', (job: any, err: Error) => inboxLogger.error(`error ${err}`, { job, e: renderError(err) }))
			.on('stalled', (job) => inboxLogger.warn(`stalled ${getJobInfo(job)} activity=${job.data.activity ? job.data.activity.id : 'none'}`));

		this.queueService.dbQueue
			.on('waiting', (jobId) => dbLogger.debug(`waiting id=${jobId}`))
			.on('active', (job) => dbLogger.debug(`active id=${job.id}`))
			.on('completed', (job, result) => dbLogger.debug(`completed(${result}) id=${job.id}`))
			.on('failed', (job, err) => dbLogger.warn(`failed(${err}) id=${job.id}`, { job, e: renderError(err) }))
			.on('error', (job: any, err: Error) => dbLogger.error(`error ${err}`, { job, e: renderError(err) }))
			.on('stalled', (job) => dbLogger.warn(`stalled id=${job.id}`));

		this.queueService.relationshipQueue
			.on('waiting', (jobId) => relationshipLogger.debug(`waiting id=${jobId}`))
			.on('active', (job) => relationshipLogger.debug(`active id=${job.id}`))
			.on('completed', (job, result) => relationshipLogger.debug(`completed(${result}) id=${job.id}`))
			.on('failed', (job, err) => relationshipLogger.warn(`failed(${err}) id=${job.id}`, { job, e: renderError(err) }))
			.on('error', (job: any, err: Error) => relationshipLogger.error(`error ${err}`, { job, e: renderError(err) }))
			.on('stalled', (job) => relationshipLogger.warn(`stalled id=${job.id}`));

		this.queueService.objectStorageQueue
			.on('waiting', (jobId) => objectStorageLogger.debug(`waiting id=${jobId}`))
			.on('active', (job) => objectStorageLogger.debug(`active id=${job.id}`))
			.on('completed', (job, result) => objectStorageLogger.debug(`completed(${result}) id=${job.id}`))
			.on('failed', (job, err) => objectStorageLogger.warn(`failed(${err}) id=${job.id}`, { job, e: renderError(err) }))
			.on('error', (job: any, err: Error) => objectStorageLogger.error(`error ${err}`, { job, e: renderError(err) }))
			.on('stalled', (job) => objectStorageLogger.warn(`stalled id=${job.id}`));

		this.queueService.webhookDeliverQueue
			.on('waiting', (jobId) => webhookLogger.debug(`waiting id=${jobId}`))
			.on('active', (job) => webhookLogger.debug(`active ${getJobInfo(job, true)} to=${job.data.to}`))
			.on('completed', (job, result) => webhookLogger.debug(`completed(${result}) ${getJobInfo(job, true)} to=${job.data.to}`))
			.on('failed', (job, err) => webhookLogger.warn(`failed(${err}) ${getJobInfo(job)} to=${job.data.to}`))
			.on('error', (job: any, err: Error) => webhookLogger.error(`error ${err}`, { job, e: renderError(err) }))
			.on('stalled', (job) => webhookLogger.warn(`stalled ${getJobInfo(job)} to=${job.data.to}`));

		this.queueService.systemQueue.add('tickCharts', {
		}, {
			repeat: { cron: '55 * * * *' },
			removeOnComplete: true,
		});

		this.queueService.systemQueue.add('resyncCharts', {
		}, {
			repeat: { cron: '0 0 * * *' },
			removeOnComplete: true,
		});

		this.queueService.systemQueue.add('cleanCharts', {
		}, {
			repeat: { cron: '0 0 * * *' },
			removeOnComplete: true,
		});

		this.queueService.systemQueue.add('aggregateRetention', {
		}, {
			repeat: { cron: '0 0 * * *' },
			removeOnComplete: true,
		});

		this.queueService.systemQueue.add('clean', {
		}, {
			repeat: { cron: '0 0 * * *' },
			removeOnComplete: true,
		});

		this.queueService.systemQueue.add('checkExpiredMutings', {
		}, {
			repeat: { cron: '*/5 * * * *' },
			removeOnComplete: true,
		});

		this.queueService.deliverQueue.process(this.config.deliverJobConcurrency ?? 128, (job) => this.deliverProcessorService.process(job));
		this.queueService.inboxQueue.process(this.config.inboxJobConcurrency ?? 16, (job) => this.inboxProcessorService.process(job));
		this.queueService.endedPollNotificationQueue.process((job, done) => this.endedPollNotificationProcessorService.process(job, done));
		this.queueService.webhookDeliverQueue.process(64, (job) => this.webhookDeliverProcessorService.process(job));

		this.queueService.dbQueue.process('deleteDriveFiles', (job, done) => this.deleteDriveFilesProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportCustomEmojis', (job, done) => this.exportCustomEmojisProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportNotes', (job, done) => this.exportNotesProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportFavorites', (job, done) => this.exportFavoritesProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportFollowing', (job, done) => this.exportFollowingProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportMuting', (job, done) => this.exportMutingProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportBlocking', (job, done) => this.exportBlockingProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportUserLists', (job, done) => this.exportUserListsProcessorService.process(job, done));
		this.queueService.dbQueue.process('exportAntennas', (job, done) => this.exportAntennasProcessorService.process(job, done));
		this.queueService.dbQueue.process('importFollowing', (job, done) => this.importFollowingProcessorService.process(job, done));
		this.queueService.dbQueue.process('importFollowingToDb', (job) => this.importFollowingProcessorService.processDb(job));
		this.queueService.dbQueue.process('importMuting', (job, done) => this.importMutingProcessorService.process(job, done));
		this.queueService.dbQueue.process('importBlocking', (job, done) => this.importBlockingProcessorService.process(job, done));
		this.queueService.dbQueue.process('importBlockingToDb', (job) => this.importBlockingProcessorService.processDb(job));
		this.queueService.dbQueue.process('importUserLists', (job, done) => this.importUserListsProcessorService.process(job, done));
		this.queueService.dbQueue.process('importCustomEmojis', (job, done) => this.importCustomEmojisProcessorService.process(job, done));
		this.queueService.dbQueue.process('importAntennas', (job, done) => this.importAntennasProcessorService.process(job, done));
		this.queueService.dbQueue.process('deleteAccount', (job) => this.deleteAccountProcessorService.process(job));

		this.queueService.objectStorageQueue.process('deleteFile', 16, (job) => this.deleteFileProcessorService.process(job));
		this.queueService.objectStorageQueue.process('cleanRemoteFiles', 16, (job, done) => this.cleanRemoteFilesProcessorService.process(job, done));
	
		{
			const maxJobs = this.config.relashionshipJobConcurrency ?? 16;
			this.queueService.relationshipQueue.process('follow', maxJobs, (job) => this.relationshipProcessorService.processFollow(job));
			this.queueService.relationshipQueue.process('unfollow', maxJobs, (job) => this.relationshipProcessorService.processUnfollow(job));
			this.queueService.relationshipQueue.process('block', maxJobs, (job) => this.relationshipProcessorService.processBlock(job));
			this.queueService.relationshipQueue.process('unblock', maxJobs, (job) => this.relationshipProcessorService.processUnblock(job));
		}

		this.queueService.systemQueue.process('tickCharts', (job, done) => this.tickChartsProcessorService.process(job, done));
		this.queueService.systemQueue.process('resyncCharts', (job, done) => this.resyncChartsProcessorService.process(job, done));
		this.queueService.systemQueue.process('cleanCharts', (job, done) => this.cleanChartsProcessorService.process(job, done));
		this.queueService.systemQueue.process('aggregateRetention', (job, done) => this.aggregateRetentionProcessorService.process(job, done));
		this.queueService.systemQueue.process('checkExpiredMutings', (job, done) => this.checkExpiredMutingsProcessorService.process(job, done));
		this.queueService.systemQueue.process('clean', (job, done) => this.cleanProcessorService.process(job, done));
	}

	@bindThis
	public async stop(): Promise<void> {
		await Promise.all([
			this.queueService.systemQueue.close(false),
			this.queueService.endedPollNotificationQueue.close(false),
			this.queueService.deliverQueue.close(false),
			this.queueService.inboxQueue.close(false),
			this.queueService.dbQueue.close(false),
			this.queueService.relationshipQueue.close(false),
			this.queueService.objectStorageQueue.close(false),
			this.queueService.webhookDeliverQueue.close(false),
		]);
	}

	@bindThis
	public async onApplicationShutdown(signal?: string | undefined): Promise<void> {
		await this.stop();
	}
}
