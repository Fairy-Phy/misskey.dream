export class ComunityRole1695479010509 {
    name = 'ComunityRole1695479010509'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "role" ADD "userId" character varying(32)`);
        await queryRunner.query(`COMMENT ON COLUMN "role"."userId" IS 'The owner ID.'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
        await queryRunner.query(`ALTER TYPE "public"."role_permissiongroup_enum" RENAME TO "role_permissiongroup_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."role_permissiongroup_enum" AS ENUM('Admin', 'MainModerator', 'EmojiModerator', 'Normal', 'Community')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissionGroup" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissionGroup" TYPE "public"."role_permissiongroup_enum" USING "permissionGroup"::"text"::"public"."role_permissiongroup_enum"`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissionGroup" SET DEFAULT 'Normal'`);
        await queryRunner.query(`DROP TYPE "public"."role_permissiongroup_enum_old"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."role_permissiongroup_enum_old" AS ENUM('Admin', 'MainModerator', 'EmojiModerator', 'Normal')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissionGroup" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissionGroup" TYPE "public"."role_permissiongroup_enum_old" USING "permissionGroup"::"text"::"public"."role_permissiongroup_enum_old"`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissionGroup" SET DEFAULT 'Normal'`);
        await queryRunner.query(`DROP TYPE "public"."role_permissiongroup_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."role_permissiongroup_enum_old" RENAME TO "role_permissiongroup_enum"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`COMMENT ON COLUMN "role"."userId" IS 'The owner ID.'`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "userId"`);
    }
}
