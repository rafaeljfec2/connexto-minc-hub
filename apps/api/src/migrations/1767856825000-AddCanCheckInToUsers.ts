import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCanCheckInToUsers1767856825000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'can_check_in',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'can_check_in');
  }
}
