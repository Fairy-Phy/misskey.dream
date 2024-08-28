export class AddLongIconUrl1724851448041 {
    name = 'AddLongIconUrl1724851448041'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "longIconUrl" character varying(1024)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "longIconUrl"`);
    }
}
