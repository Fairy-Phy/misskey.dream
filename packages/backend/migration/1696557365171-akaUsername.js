export class AkaUsername1696557365171 {
    name = 'AkaUsername1696557365171'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "akaUsername" ("userId" character varying(32) NOT NULL, "username" character varying(60) NOT NULL, CONSTRAINT "PK_952dd35606cfeb8866a8cec610c" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d4dabe6de89ec45542b83cea5f" ON "akaUsername" ("username") `);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d4dabe6de89ec45542b83cea5f"`);
        await queryRunner.query(`DROP TABLE "akaUsername"`);
    }
}
