/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, Column, JoinColumn, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';

@Entity('emoji')
@Index(['userId', 'name', 'host'], { unique: true })
export class MiEmoji {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		nullable: true,
	})
	public updatedAt: Date | null;

	@Index()
	@Column('varchar', {
		length: 128,
	})
	public name: string;

	@Index()
	@Column('varchar', {
		length: 128, nullable: true,
	})
	public host: string | null;

	@Column('varchar', {
		length: 128, nullable: true,
	})
	public category: string | null;

	@Column('varchar', {
		length: 512,
	})
	public originalUrl: string;

	@Column('varchar', {
		length: 512,
		default: '',
	})
	public publicUrl: string;

	@Column('varchar', {
		length: 512, nullable: true,
	})
	public uri: string | null;

	// publicUrlの方のtypeが入る
	@Column('varchar', {
		length: 64, nullable: true,
	})
	public type: string | null;

	@Column('varchar', {
		array: true, length: 128, default: '{}',
	})
	public aliases: string[];

	@Column('boolean', {
		default: false,
	})
	public isSelfMadeResource: boolean;

	// 使用許諾と根拠、 自作の人はライセンス(その絵文字に対し使用許諾を付与する名目)
	@Column('varchar', {
		length: 1024, nullable: true,
	})
	public license: string | null;

	@Column('boolean', {
		default: false,
	})
	public localOnly: boolean;

	@Column('boolean', {
		default: false,
	})
	public isSensitive: boolean;

	// TODO: 定期ジョブで存在しなくなったロールIDを除去するようにする
	@Column('varchar', {
		array: true, length: 128, default: '{}',
	})
	public roleIdsThatCanBeUsedThisEmojiAsReaction: string[];

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'The owner ID.',
	})
	public userId: MiUser['id'] | null; // nullはリモートからや後方互換性のため

	@ManyToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser | null;
}
