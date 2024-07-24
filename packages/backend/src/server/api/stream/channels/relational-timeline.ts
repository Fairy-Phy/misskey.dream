import { Injectable } from '@nestjs/common';
import { checkWordMute } from '@/misc/check-word-mute.js';
import { isUserRelated } from '@/misc/is-user-related.js';
import type { Packed } from '@/misc/json-schema.js';
import { MetaService } from '@/core/MetaService.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { bindThis } from '@/decorators.js';
import { RoleService } from '@/core/RoleService.js';
import Channel, { MiChannelService } from '../channel.js';
import { IdService } from '@/core/IdService.js';

class RelationalTimelineChannel extends Channel {
	public readonly chName = 'relationalTimeline';
	public static shouldShare = true;
	private withReplies: boolean;

	constructor(
		private metaService: MetaService,
		private roleService: RoleService,
		private noteEntityService: NoteEntityService,

		private idService: IdService,

		id: string,
		connection: Channel['connection'],
	) {
		super(id, connection);
		//this.onNote = this.onNote.bind(this);
	}

	@bindThis
	public async init(params: any) {
		const policies = await this.roleService.getUserPolicies(this.user ? this.user.id : null);
		if (!policies.ltlAvailable) return;

		this.withReplies = params.withReplies as boolean;

		// Subscribe events
		this.subscriber.on('notesStream', this.onNote);
	}

	@bindThis
	private async onNote(note: Packed<'Note'>) {
		const serverMeta = await this.metaService.fetch();
		// そもそも登録日を満たしてない人は見れないようにする
		const createAt = this.user ? this.idService.parse(this.user.id) : { date: new Date() };
		if (createAt.date > serverMeta.relationalDate) return;

		if (note.user.host !== null) return;
		if (note.visibility !== 'public' && !note.isRelational) return;
		if (note.channelId != null && !this.followingChannels.has(note.channelId)) return;
		if (new Date(note.user.createdAt) > serverMeta.relationalDate) return;

		// リプライなら再pack
		if (note.replyId != null) {
			note.reply = await this.noteEntityService.pack(note.replyId, this.user, {
				detail: true,
			});
		}
		// Renoteなら再pack
		if (note.renoteId != null) {
			note.renote = await this.noteEntityService.pack(note.renoteId, this.user, {
				detail: true,
			});
		}

		// 関係ない返信は除外
		if (note.reply && this.user && !this.withReplies) {
			const reply = note.reply;
			// 「チャンネル接続主への返信」でもなければ、「チャンネル接続主が行った返信」でもなければ、「投稿者の投稿者自身への返信」でもない場合
			if (reply.userId !== this.user.id && note.userId !== this.user.id && reply.userId !== note.userId) return;
		}

		// 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
		if (isUserRelated(note, this.userIdsWhoMeMuting)) return;
		// 流れてきたNoteがブロックされているユーザーが関わるものだったら無視する
		if (isUserRelated(note, this.userIdsWhoBlockingMe)) return;

		if (note.renote && !note.text && isUserRelated(note, this.userIdsWhoMeMutingRenotes)) return;

		// 流れてきたNoteがミュートすべきNoteだったら無視する
		// TODO: 将来的には、単にMutedNoteテーブルにレコードがあるかどうかで判定したい(以下の理由により難しそうではある)
		// 現状では、ワードミュートにおけるMutedNoteレコードの追加処理はストリーミングに流す処理と並列で行われるため、
		// レコードが追加されるNoteでも追加されるより先にここのストリーミングの処理に到達することが起こる。
		// そのためレコードが存在するかのチェックでは不十分なので、改めてcheckWordMuteを呼んでいる
		if (this.userProfile && await checkWordMute(note, this.user, this.userProfile.mutedWords)) return;

		this.connection.cacheNote(note);

		this.send('note', note);
	}

	@bindThis
	public dispose() {
		// Unsubscribe events
		this.subscriber.off('notesStream', this.onNote);
	}
}

@Injectable()
export class RelationalTimelineChannelService implements MiChannelService<false> {
	public readonly shouldShare = RelationalTimelineChannel.shouldShare;

	constructor(
		private metaService: MetaService,
		private roleService: RoleService,
		private noteEntityService: NoteEntityService,
		private idService: IdService,
	) {
	}

	requireCredential: false;
	kind: string | null | undefined;

	@bindThis
	public create(id: string, connection: Channel['connection']): RelationalTimelineChannel {
		return new RelationalTimelineChannel(
			this.metaService,
			this.roleService,
			this.noteEntityService,
			this.idService,
			id,
			connection,
		);
	}
}
