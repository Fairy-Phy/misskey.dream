import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiEmoji } from './Emoji.js';

export type LogTypeValue = 'Add' | 'Update' | 'Other';
export type LogInfoValue = { type: keyof MiEmoji, changeInfo: { [K in 'before' | 'after']: any } };

@Entity()
export class EmojiModerationLog {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		comment: 'The created date of the ModerationLog.',
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: MiUser['id'];

	@ManyToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser | null;

	@Index()
	@Column(id())
	public emojiId: MiEmoji['id'];

	@ManyToOne(type => MiEmoji, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public emoji: MiEmoji | null;

	@Column('enum', {
		enum: ['Add', 'Update', 'Other'],
		default: 'Other',
	})
	public type: LogTypeValue;

	// もっと他にいい方法がないかなぁ...
	@Column('jsonb', {
		default: {},
	})
	public info: LogInfoValue[];
}
