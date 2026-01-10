import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGroupChatEntities1768050018986 implements MigrationInterface {
  name = 'UpdateGroupChatEntities1768050018986';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "team_members_person_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "team_members_team_id_fkey"`,
    );
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "teams_leader_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "teams_ministry_id_fkey"`);
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" DROP CONSTRAINT "schedule_teams_schedule_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" DROP CONSTRAINT "schedule_teams_team_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "attendances_checked_in_by_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "attendances_person_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "attendances_schedule_id_fkey"`,
    );
    await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "schedules_service_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "services_church_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "ministries" DROP CONSTRAINT "ministries_church_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "persons" DROP CONSTRAINT "fk_person_team"`);
    await queryRunner.query(`ALTER TABLE "persons" DROP CONSTRAINT "persons_ministry_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_person_id_fkey"`);
    await queryRunner.query(
      `ALTER TABLE "team_planning_configs" DROP CONSTRAINT "team_planning_configs_team_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_templates" DROP CONSTRAINT "schedule_planning_templates_created_by_church_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_configs" DROP CONSTRAINT "schedule_planning_configs_church_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_user_id_fkey"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_team_members_team_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_members_person_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_members_member_type"`);
    await queryRunner.query(`DROP INDEX "public"."idx_teams_ministry_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_teams_leader_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_teams_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_teams_is_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_teams_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_teams_ministry_active_deleted"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedule_teams_schedule_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedule_teams_team_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_attendances_schedule_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_attendances_person_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_attendances_checked_in_by"`);
    await queryRunner.query(`DROP INDEX "public"."idx_attendances_checked_in_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_attendances_method"`);
    await queryRunner.query(`DROP INDEX "public"."idx_attendances_schedule_checked_in"`);
    await queryRunner.query(`DROP INDEX "public"."idx_attendances_person_checked_in"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedules_service_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedules_date"`);
    await queryRunner.query(`DROP INDEX "public"."uk_schedule_service_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedules_service_date_deleted"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedules_date_deleted"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedules_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_services_church_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_services_type"`);
    await queryRunner.query(`DROP INDEX "public"."idx_services_day_of_week"`);
    await queryRunner.query(`DROP INDEX "public"."idx_services_is_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_services_church_day_time_deleted"`);
    await queryRunner.query(`DROP INDEX "public"."idx_services_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_churches_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_churches_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_ministries_church_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_ministries_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_ministries_is_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_ministries_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_ministries_church_active_deleted"`);
    await queryRunner.query(`DROP INDEX "public"."idx_persons_ministry_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_persons_team_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_persons_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_persons_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_persons_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_person_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_role"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_email_deleted"`);
    await queryRunner.query(`DROP INDEX "public"."uk_team_planning_config_team"`);
    await queryRunner.query(`DROP INDEX "public"."idx_team_planning_configs_team_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_schedule_planning_templates_is_system_template"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_schedule_planning_templates_created_by_church_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."uk_schedule_planning_config_church"`);
    await queryRunner.query(`DROP INDEX "public"."idx_schedule_planning_configs_church_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_token"`);
    await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_user_revoked_expires"`);
    await queryRunner.query(`DROP INDEX "public"."idx_password_reset_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_password_reset_tokens_token"`);
    await queryRunner.query(`DROP INDEX "public"."idx_password_reset_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_password_reset_user_used_expires"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "services_day_of_week_check"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_role_check"`);
    await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "uk_team_member"`);
    await queryRunner.query(`ALTER TABLE "schedule_teams" DROP CONSTRAINT "uk_schedule_team"`);
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "uk_attendance_schedule_person"`,
    );
    await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "avatar"`);
    await queryRunner.query(
      `CREATE TYPE "public"."conversation_participants_role_enum" AS ENUM('admin', 'member')`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" ADD "role" "public"."conversation_participants_role_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."conversations_type_enum" AS ENUM('private', 'group')`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD "type" "public"."conversations_type_enum" NOT NULL DEFAULT 'private'`,
    );
    await queryRunner.query(`ALTER TABLE "conversations" ADD "name" character varying`);
    await queryRunner.query(`ALTER TABLE "conversations" ADD "created_by" character varying`);
    await queryRunner.query(`ALTER TYPE "public"."member_type" RENAME TO "member_type_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."team_members_member_type_enum" AS ENUM('fixed', 'eventual')`,
    );
    await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "member_type" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "team_members" ALTER COLUMN "member_type" TYPE "public"."team_members_member_type_enum" USING "member_type"::"text"::"public"."team_members_member_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ALTER COLUMN "member_type" SET DEFAULT 'fixed'`,
    );
    await queryRunner.query(`DROP TYPE "public"."member_type_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."attendance_method" RENAME TO "attendance_method_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attendances_method_enum" AS ENUM('qr_code', 'manual')`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ALTER COLUMN "method" TYPE "public"."attendances_method_enum" USING "method"::"text"::"public"."attendances_method_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."attendance_method_old"`);
    await queryRunner.query(`ALTER TYPE "public"."service_type" RENAME TO "service_type_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."services_type_enum" AS ENUM('sunday_morning', 'sunday_evening', 'wednesday', 'friday', 'special')`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "type" TYPE "public"."services_type_enum" USING "type"::"text"::"public"."services_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."service_type_old"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'servo'`);
    await queryRunner.query(
      `ALTER TABLE "team_planning_configs" ADD CONSTRAINT "UQ_061a0e1e3c46b608fc51c63358a" UNIQUE ("team_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_configs" ADD CONSTRAINT "UQ_3bbdb58b24e3e70b470fdb9ecd8" UNIQUE ("church_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_129dcd6a86987858b88eecb604" ON "team_members" ("member_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be3e9ab9446f56d176fabf1974" ON "team_members" ("person_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fdad7d5768277e60c40e01cdce" ON "team_members" ("team_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87e434c1989ccd68e6fd401fd9" ON "teams" ("is_active") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9ea4a37e4c14365dba1ac4719" ON "teams" ("name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e61b4492d17168b3409c62520" ON "teams" ("leader_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_01d2da8dd529361baeb23fa82a" ON "teams" ("ministry_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c6459b726bcf78895d89435875" ON "schedule_teams" ("team_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b05d8fd845ae6363698f008b3e" ON "schedule_teams" ("schedule_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a379c73eb8efc5841f0301ef5" ON "attendances" ("method") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c5817fff93f448624ddd8b6075" ON "attendances" ("checked_in_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_545e81e8b34d64527f2d8decee" ON "attendances" ("checked_in_by") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ce1cf71d39103688bc6125f588" ON "attendances" ("person_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a21efbbf3c29eadb54bb46e484" ON "attendances" ("schedule_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7ca1607e58fc5cef9d51ada3e" ON "schedules" ("date") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f1d0bca4c0cc4dfaa98482b9a7" ON "schedules" ("service_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2141b2abd4ffc15f0470228bc" ON "services" ("is_active") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_489aad548c5fedaa1e09f5c1d7" ON "services" ("day_of_week") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db94ac0af09acec014ec16e55d" ON "services" ("type") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eca7866aa9a01768b0edae16d3" ON "services" ("church_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c47f082743da490cb978d5f0fb" ON "churches" ("name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_322b0a9bcd9f735fa48d2c9139" ON "ministries" ("is_active") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_499c36ed1e68431b472efdd686" ON "ministries" ("name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9015c26b32444f3a47440fd7aa" ON "ministries" ("church_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a8dba4e9cd542cdf7b54301a3" ON "persons" ("email") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4c082403833891027db1523fc" ON "persons" ("name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f1ae535a598bca847efeaf366f" ON "persons" ("team_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61e24e92ff298e28f913550c7c" ON "persons" ("ministry_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e5f95cd7dbe2f8d57e37c58dca" ON "users" ("role") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_543fe85db0eed2a5bde2c304ec" ON "users" ("person_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fdbf1baeb91b6f822b5d57e19" ON "users" ("email") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2345d67a9b17ae511196a77202" ON "team_planning_configs" ("team_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b862c304de38e07d7c88c27c91" ON "schedule_planning_templates" ("created_by_church_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f8061a94df7af175ddf414ec94" ON "schedule_planning_templates" ("is_system_template") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ff86751ccadec4d624d6f2292" ON "schedule_planning_configs" ("church_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba3bd69c8ad1e799c0256e9e50" ON "refresh_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7c038e5a589b06cbe4320cc88b" ON "password_reset_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab673f0e63eac966762155508e" ON "password_reset_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52ac39dd8a28730c63aeb428c9" ON "password_reset_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "UQ_f65d7a762b8875d5f37d1c16123" UNIQUE ("team_id", "person_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" ADD CONSTRAINT "UQ_359dbd29fb2ce1392927a408d73" UNIQUE ("schedule_id", "team_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "UQ_91ce08be97a7c57a16bd2446d06" UNIQUE ("schedule_id", "person_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_be3e9ab9446f56d176fabf19741" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_ab7fe7569e2fba5c65c60050633" FOREIGN KEY ("ministry_id") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_10c8e335dc32010ef90abe65cec" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" ADD CONSTRAINT "FK_b05d8fd845ae6363698f008b3e6" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" ADD CONSTRAINT "FK_c6459b726bcf78895d894358751" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "FK_a21efbbf3c29eadb54bb46e484c" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "FK_ce1cf71d39103688bc6125f5889" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "FK_545e81e8b34d64527f2d8decee0" FOREIGN KEY ("checked_in_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_ddd03cb28bed3c395141ecc05b3" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_48a71bb94be52e2c2e3ebef3615" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ministries" ADD CONSTRAINT "FK_0ecfba282a72e384bab878c1a65" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "persons" ADD CONSTRAINT "FK_21240ec6c57a36367f3f3bf48c7" FOREIGN KEY ("ministry_id") REFERENCES "ministries"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "persons" ADD CONSTRAINT "FK_cae0ab5099afdd918e514fabdd2" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_5ed72dcd00d6e5a88c6a6ba3d18" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_planning_configs" ADD CONSTRAINT "FK_061a0e1e3c46b608fc51c63358a" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_templates" ADD CONSTRAINT "FK_10d47b8303b1ee76f1ad5f2613c" FOREIGN KEY ("created_by_church_id") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_configs" ADD CONSTRAINT "FK_3bbdb58b24e3e70b470fdb9ecd8" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_configs" DROP CONSTRAINT "FK_3bbdb58b24e3e70b470fdb9ecd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_templates" DROP CONSTRAINT "FK_10d47b8303b1ee76f1ad5f2613c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_planning_configs" DROP CONSTRAINT "FK_061a0e1e3c46b608fc51c63358a"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5ed72dcd00d6e5a88c6a6ba3d18"`);
    await queryRunner.query(
      `ALTER TABLE "persons" DROP CONSTRAINT "FK_cae0ab5099afdd918e514fabdd2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "persons" DROP CONSTRAINT "FK_21240ec6c57a36367f3f3bf48c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ministries" DROP CONSTRAINT "FK_0ecfba282a72e384bab878c1a65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_48a71bb94be52e2c2e3ebef3615"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_ddd03cb28bed3c395141ecc05b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "FK_545e81e8b34d64527f2d8decee0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "FK_ce1cf71d39103688bc6125f5889"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "FK_a21efbbf3c29eadb54bb46e484c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" DROP CONSTRAINT "FK_c6459b726bcf78895d894358751"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" DROP CONSTRAINT "FK_b05d8fd845ae6363698f008b3e6"`,
    );
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_10c8e335dc32010ef90abe65cec"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_ab7fe7569e2fba5c65c60050633"`);
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_be3e9ab9446f56d176fabf19741"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "UQ_91ce08be97a7c57a16bd2446d06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" DROP CONSTRAINT "UQ_359dbd29fb2ce1392927a408d73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "UQ_f65d7a762b8875d5f37d1c16123"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_52ac39dd8a28730c63aeb428c9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ab673f0e63eac966762155508e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7c038e5a589b06cbe4320cc88b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ba3bd69c8ad1e799c0256e9e50"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9ff86751ccadec4d624d6f2292"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f8061a94df7af175ddf414ec94"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b862c304de38e07d7c88c27c91"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2345d67a9b17ae511196a77202"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7fdbf1baeb91b6f822b5d57e19"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_543fe85db0eed2a5bde2c304ec"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e5f95cd7dbe2f8d57e37c58dca"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_61e24e92ff298e28f913550c7c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f1ae535a598bca847efeaf366f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b4c082403833891027db1523fc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4a8dba4e9cd542cdf7b54301a3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9015c26b32444f3a47440fd7aa"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_499c36ed1e68431b472efdd686"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_322b0a9bcd9f735fa48d2c9139"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c47f082743da490cb978d5f0fb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_eca7866aa9a01768b0edae16d3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_db94ac0af09acec014ec16e55d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_489aad548c5fedaa1e09f5c1d7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b2141b2abd4ffc15f0470228bc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f1d0bca4c0cc4dfaa98482b9a7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c7ca1607e58fc5cef9d51ada3e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a21efbbf3c29eadb54bb46e484"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ce1cf71d39103688bc6125f588"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_545e81e8b34d64527f2d8decee"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c5817fff93f448624ddd8b6075"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4a379c73eb8efc5841f0301ef5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b05d8fd845ae6363698f008b3e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c6459b726bcf78895d89435875"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_01d2da8dd529361baeb23fa82a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0e61b4492d17168b3409c62520"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d9ea4a37e4c14365dba1ac4719"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_87e434c1989ccd68e6fd401fd9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fdad7d5768277e60c40e01cdce"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_be3e9ab9446f56d176fabf1974"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_129dcd6a86987858b88eecb604"`);
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_configs" DROP CONSTRAINT "UQ_3bbdb58b24e3e70b470fdb9ecd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_planning_configs" DROP CONSTRAINT "UQ_061a0e1e3c46b608fc51c63358a"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(
      `CREATE TYPE "public"."service_type_old" AS ENUM('sunday_morning', 'sunday_evening', 'wednesday', 'friday', 'special')`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "type" TYPE "public"."service_type_old" USING "type"::"text"::"public"."service_type_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."services_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."service_type_old" RENAME TO "service_type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."attendance_method_old" AS ENUM('qr_code', 'manual')`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ALTER COLUMN "method" TYPE "public"."attendance_method_old" USING "method"::"text"::"public"."attendance_method_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."attendances_method_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."attendance_method_old" RENAME TO "attendance_method"`,
    );
    await queryRunner.query(`CREATE TYPE "public"."member_type_old" AS ENUM('fixed', 'eventual')`);
    await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "member_type" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "team_members" ALTER COLUMN "member_type" TYPE "public"."member_type_old" USING "member_type"::"text"::"public"."member_type_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ALTER COLUMN "member_type" SET DEFAULT 'fixed'`,
    );
    await queryRunner.query(`DROP TYPE "public"."team_members_member_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."member_type_old" RENAME TO "member_type"`);
    await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."conversations_type_enum"`);
    await queryRunner.query(`ALTER TABLE "conversation_participants" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."conversation_participants_role_enum"`);
    await queryRunner.query(`ALTER TABLE "persons" ADD "avatar" text`);
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "uk_attendance_schedule_person" UNIQUE ("schedule_id", "person_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" ADD CONSTRAINT "uk_schedule_team" UNIQUE ("schedule_id", "team_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "uk_team_member" UNIQUE ("team_id", "person_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'pastor'::character varying, 'lider_de_time'::character varying, 'lider_de_equipe'::character varying, 'servo'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "services_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_password_reset_user_used_expires" ON "password_reset_tokens" ("expires_at", "used_at", "user_id") WHERE (used_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_user_revoked_expires" ON "refresh_tokens" ("expires_at", "is_revoked", "user_id") WHERE (is_revoked = false)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_token" ON "refresh_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedule_planning_configs_church_id" ON "schedule_planning_configs" ("church_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uk_schedule_planning_config_church" ON "schedule_planning_configs" ("church_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedule_planning_templates_created_by_church_id" ON "schedule_planning_templates" ("created_by_church_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedule_planning_templates_is_system_template" ON "schedule_planning_templates" ("is_system_template") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_team_planning_configs_team_id" ON "team_planning_configs" ("team_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uk_team_planning_config_team" ON "team_planning_configs" ("team_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_email_deleted" ON "users" ("deleted_at", "email") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_deleted_at" ON "users" ("deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_role" ON "users" ("role") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_person_id" ON "users" ("person_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_email" ON "users" ("email") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_persons_deleted_at" ON "persons" ("deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_persons_email" ON "persons" ("email") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_persons_name" ON "persons" ("name") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_persons_team_id" ON "persons" ("team_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_persons_ministry_id" ON "persons" ("ministry_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ministries_church_active_deleted" ON "ministries" ("church_id", "deleted_at", "is_active") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ministries_deleted_at" ON "ministries" ("deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ministries_is_active" ON "ministries" ("is_active") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ministries_name" ON "ministries" ("name") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ministries_church_id" ON "ministries" ("church_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_churches_deleted_at" ON "churches" ("deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_churches_name" ON "churches" ("name") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_services_deleted_at" ON "services" ("deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_services_church_day_time_deleted" ON "services" ("church_id", "day_of_week", "deleted_at", "time") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_services_is_active" ON "services" ("is_active") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_services_day_of_week" ON "services" ("day_of_week") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_services_type" ON "services" ("type") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_services_church_id" ON "services" ("church_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedules_deleted_at" ON "schedules" ("deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedules_date_deleted" ON "schedules" ("date", "deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedules_service_date_deleted" ON "schedules" ("date", "deleted_at", "service_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uk_schedule_service_date" ON "schedules" ("date", "service_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedules_date" ON "schedules" ("date") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedules_service_id" ON "schedules" ("service_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_attendances_person_checked_in" ON "attendances" ("checked_in_at", "person_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_attendances_schedule_checked_in" ON "attendances" ("checked_in_at", "schedule_id") `,
    );
    await queryRunner.query(`CREATE INDEX "idx_attendances_method" ON "attendances" ("method") `);
    await queryRunner.query(
      `CREATE INDEX "idx_attendances_checked_in_at" ON "attendances" ("checked_in_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_attendances_checked_in_by" ON "attendances" ("checked_in_by") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_attendances_person_id" ON "attendances" ("person_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_attendances_schedule_id" ON "attendances" ("schedule_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedule_teams_team_id" ON "schedule_teams" ("team_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_schedule_teams_schedule_id" ON "schedule_teams" ("schedule_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_teams_ministry_active_deleted" ON "teams" ("deleted_at", "is_active", "ministry_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_teams_deleted_at" ON "teams" ("deleted_at") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_teams_is_active" ON "teams" ("is_active") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_teams_name" ON "teams" ("name") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_teams_leader_id" ON "teams" ("leader_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_teams_ministry_id" ON "teams" ("ministry_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_team_members_member_type" ON "team_members" ("member_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_team_members_person_id" ON "team_members" ("person_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_team_members_team_id" ON "team_members" ("team_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_configs" ADD CONSTRAINT "schedule_planning_configs_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_planning_templates" ADD CONSTRAINT "schedule_planning_templates_created_by_church_id_fkey" FOREIGN KEY ("created_by_church_id") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_planning_configs" ADD CONSTRAINT "team_planning_configs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "persons" ADD CONSTRAINT "persons_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "ministries"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "persons" ADD CONSTRAINT "fk_person_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ministries" ADD CONSTRAINT "ministries_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "services_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "schedules_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "attendances_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "attendances_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "attendances_checked_in_by_fkey" FOREIGN KEY ("checked_in_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" ADD CONSTRAINT "schedule_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_teams" ADD CONSTRAINT "schedule_teams_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "teams_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "team_members_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
