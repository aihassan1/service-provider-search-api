import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceProvider1760759761951 implements MigrationInterface {
  name = 'CreateServiceProvider1760759761951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "providerName" character varying(500) NOT NULL, "providerType" character varying(200) NOT NULL, "servicesProvided" character varying(500) NOT NULL, "specialization" character varying(300) NOT NULL, "address" text NOT NULL, "city" character varying(200) NOT NULL, "province" character varying(200) NOT NULL, "phoneNumber" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7610a92ca242cb29d96009caa19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_name" ON "service_provider" ("providerName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_services_provided" ON "service_provider" ("servicesProvided") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_specialization" ON "service_provider" ("specialization") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_address" ON "service_provider" ("address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_city" ON "service_provider" ("city") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_province" ON "service_provider" ("province") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_province"`);
    await queryRunner.query(`DROP INDEX "public"."idx_city"`);
    await queryRunner.query(`DROP INDEX "public"."idx_address"`);
    await queryRunner.query(`DROP INDEX "public"."idx_specialization"`);
    await queryRunner.query(`DROP INDEX "public"."idx_services_provided"`);
    await queryRunner.query(`DROP INDEX "public"."idx_provider_name"`);
    await queryRunner.query(`DROP TABLE "service_provider"`);
  }
}
