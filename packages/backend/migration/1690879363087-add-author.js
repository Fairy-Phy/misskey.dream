/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class Fix1690417561187 {
    name = 'Fix1690417561187'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "drive_file" DROP CONSTRAINT "FK_860fa6f6c7df5bb887249fba22e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4f4d35e1256c84ae3d1f0eab10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cd3b2a6b4cf0b910b260afe08"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_createdAt"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muteeId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muterId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "emojiCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."emojiCount" IS 'The count of create emojis.'`);
        await queryRunner.query(`ALTER TABLE "emoji" ADD "userId" character varying(32)`);
        await queryRunner.query(`COMMENT ON COLUMN "emoji"."userId" IS 'The owner ID.'`);
        await queryRunner.query(`CREATE TYPE "public"."role_permissiongroup_enum" AS ENUM('Admin', 'MainModerator', 'EmojiModerator', 'Normal')`);
        await queryRunner.query(`ALTER TABLE "role" ADD "permissionGroup" "public"."role_permissiongroup_enum" NOT NULL DEFAULT 'Normal'`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."isRoot" IS 'Whether the User is the root.'`);
        await queryRunner.query(`COMMENT ON COLUMN "ad"."startsAt" IS 'The expired date of the Ad.'`);
        await queryRunner.query(`ALTER TABLE "antenna" ALTER COLUMN "lastUsedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "mascotImageUrl" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."createdAt" IS 'The created date of the Muting.'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS 'The mutee user ID.'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS 'The muter user ID.'`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "UQ_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "UQ_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "UQ_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "UQ_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`CREATE INDEX "IDX_3fcc2c589eaefc205e0714b99c" ON "ad" ("startsAt") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c71faf11f0a28a5c0bb506203c" ON "channel_favorite" ("userId", "channelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_22b8b4a740632c01e7c5b4c482" ON "emoji" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cb09449fad9c73907ee73ac976" ON "emoji" ("userId", "name", "host") `);
        await queryRunner.query(`CREATE INDEX "IDX_f7b9d338207e40e768e4a5265a" ON "instance" ("firstRetrievedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_d1259a2c2b7bb413ff449e8711" ON "renote_muting" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_7eac97594bcac5ffcf2068089b" ON "renote_muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7aa72a5fe76019bfe8e5e0e8b7" ON "renote_muting" ("muterId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d801c609cec4e9eb4b6b4490c" ON "renote_muting" ("muterId", "muteeId") `);
        await queryRunner.query(`ALTER TABLE "drive_file" ADD CONSTRAINT "FK_860fa6f6c7df5bb887249fba22e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emoji" ADD CONSTRAINT "FK_22b8b4a740632c01e7c5b4c4820" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`);
        await queryRunner.query(`ALTER TABLE "emoji" DROP CONSTRAINT "FK_22b8b4a740632c01e7c5b4c4820"`);
        await queryRunner.query(`ALTER TABLE "drive_file" DROP CONSTRAINT "FK_860fa6f6c7df5bb887249fba22e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d801c609cec4e9eb4b6b4490c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7aa72a5fe76019bfe8e5e0e8b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7eac97594bcac5ffcf2068089b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1259a2c2b7bb413ff449e8711"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7b9d338207e40e768e4a5265a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb09449fad9c73907ee73ac976"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_22b8b4a740632c01e7c5b4c482"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c71faf11f0a28a5c0bb506203c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3fcc2c589eaefc205e0714b99c"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "UQ_10c146e4b39b443ede016f6736d" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "UQ_f4853eb41ab722fe05f81cedeb6" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "UQ_e263909ca4fe5d57f8d4230dd5c" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "UQ_da851e06d0dfe2ef397d8b1bf1b" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "mascotImageUrl" SET DEFAULT '/assets/ai.png'`);
        await queryRunner.query(`ALTER TABLE "antenna" ALTER COLUMN "lastUsedAt" SET DEFAULT '2023-07-24 13:10:44.95783+00'`);
        await queryRunner.query(`COMMENT ON COLUMN "ad"."startsAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."isRoot" IS 'Whether the User is the admin.'`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "permissionGroup"`);
        await queryRunner.query(`DROP TYPE "public"."role_permissiongroup_enum"`);
        await queryRunner.query(`COMMENT ON COLUMN "emoji"."userId" IS 'The owner ID.'`);
        await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "userId"`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."emojiCount" IS 'The count of create emojis.'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emojiCount"`);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muterId" ON "muting" ("muterId") `);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muteeId" ON "muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_createdAt" ON "muting" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cd3b2a6b4cf0b910b260afe08" ON "instance" ("firstRetrievedAt") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4f4d35e1256c84ae3d1f0eab10" ON "emoji" ("name", "host") `);
        await queryRunner.query(`ALTER TABLE "drive_file" ADD CONSTRAINT "FK_860fa6f6c7df5bb887249fba22e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
