export class AlterEmojiSelf1722672700097 {
    name = 'AlterEmojiSelf1722672700097'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "emoji" ADD "isSelfMadeResource" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "isSelfMadeResource"`);
    }
}
