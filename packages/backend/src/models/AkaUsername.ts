import { PrimaryColumn, Entity, Column, Index, OneToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';

@Entity('akaUsername')
export class AkaUsername {
	@PrimaryColumn(id())
	public userId: MiUser['id'];

	// 基本的にはこれはユーザーとの紐づけでのみ使用されます
	@OneToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	public user: MiUser | null;

	@Index()
	@Column('varchar', {
		length: 60,
	})
	public username: string;

	constructor(data: Partial<AkaUsername>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}

export const akaUsernameSchema = { type: 'string', minLength: 2, maxLength: 30 } as const;
export const allowAkaUsernameRegex = /^[\d\p{sc=Hiragana}\p{sc=Katakana}]{2,30}$/u;
