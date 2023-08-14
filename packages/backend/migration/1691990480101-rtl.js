export class Rtl1691990480101 {
    name = 'Rtl1691990480101'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "relationalDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TYPE "public"."note_visibility_enum" RENAME TO "note_visibility_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."note_visibility_enum" AS ENUM('public', 'relational', 'home', 'followers', 'specified')`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "visibility" TYPE "public"."note_visibility_enum" USING "visibility"::"text"::"public"."note_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."note_visibility_enum_old"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
        await queryRunner.query(`ALTER TYPE "public"."poll_notevisibility_enum" RENAME TO "poll_notevisibility_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."poll_notevisibility_enum" AS ENUM('public', 'relational', 'home', 'followers', 'specified')`);
        await queryRunner.query(`ALTER TABLE "poll" ALTER COLUMN "noteVisibility" TYPE "public"."poll_notevisibility_enum" USING "noteVisibility"::"text"::"public"."poll_notevisibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."poll_notevisibility_enum_old"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."poll_notevisibility_enum_old" AS ENUM('public', 'home', 'followers', 'specified')`);
        await queryRunner.query(`ALTER TABLE "poll" ALTER COLUMN "noteVisibility" TYPE "public"."poll_notevisibility_enum_old" USING "noteVisibility"::"text"::"public"."poll_notevisibility_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."poll_notevisibility_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."poll_notevisibility_enum_old" RENAME TO "poll_notevisibility_enum"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`CREATE TYPE "public"."note_visibility_enum_old" AS ENUM('public', 'home', 'followers', 'specified')`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "visibility" TYPE "public"."note_visibility_enum_old" USING "visibility"::"text"::"public"."note_visibility_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."note_visibility_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."note_visibility_enum_old" RENAME TO "note_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "relationalDate"`);
    }
}
