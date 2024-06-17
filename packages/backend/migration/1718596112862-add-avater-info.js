export class AddAvaterInfo1718596112862 {
    name = 'AddAvaterInfo1718596112862'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "avatar_decoration" ADD "userId" character varying(32)`);
        await queryRunner.query(`COMMENT ON COLUMN "avatar_decoration"."userId" IS 'The owner ID.'`);
        await queryRunner.query(`ALTER TABLE "avatar_decoration" ADD "license" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "disableRegistration" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "urlPreviewRequireContentLength" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "urlPreviewUserAgent" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "IDX_f1d59968547c9c9a0a18272674" ON "avatar_decoration" ("userId") `);
        await queryRunner.query(`ALTER TABLE "avatar_decoration" ADD CONSTRAINT "FK_f1d59968547c9c9a0a182726742" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "avatar_decoration" DROP CONSTRAINT "FK_f1d59968547c9c9a0a182726742"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f1d59968547c9c9a0a18272674"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "urlPreviewUserAgent" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "urlPreviewRequireContentLength" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "disableRegistration" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "avatar_decoration" DROP COLUMN "license"`);
        await queryRunner.query(`COMMENT ON COLUMN "avatar_decoration"."userId" IS 'The owner ID.'`);
        await queryRunner.query(`ALTER TABLE "avatar_decoration" DROP COLUMN "userId"`);
    }
}
