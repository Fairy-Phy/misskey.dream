export class FlashAchieve1704300025214 {
    name = 'FlashAchieve1704300025214';

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "flashAchievements" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "flash" ADD "achievements" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
        await queryRunner.query(`ALTER TYPE "public"."user_profile_followersVisibility_enum" RENAME TO "user_profile_followersVisibility_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_profile_followersvisibility_enum" AS ENUM('public', 'followers', 'private')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" TYPE "public"."user_profile_followersvisibility_enum" USING "followersVisibility"::"text"::"public"."user_profile_followersvisibility_enum"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" SET DEFAULT 'public'`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_followersVisibility_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_58699f75b9cf904f5f007909cb" ON "user_profile" ("birthday") `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_58699f75b9cf904f5f007909cb"`);
        await queryRunner.query(`CREATE TYPE "public"."user_profile_followersVisibility_enum_old" AS ENUM('followers', 'private', 'public')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" TYPE "public"."user_profile_followersVisibility_enum_old" USING "followersVisibility"::"text"::"public"."user_profile_followersVisibility_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" SET DEFAULT 'public'`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_followersvisibility_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_profile_followersVisibility_enum_old" RENAME TO "user_profile_followersVisibility_enum"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`ALTER TABLE "flash" DROP COLUMN "achievements"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "flashAchievements"`);
    }
}
