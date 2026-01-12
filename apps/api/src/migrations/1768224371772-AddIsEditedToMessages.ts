import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsEditedToMessages1768224371772 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'messages',
      new TableColumn({
        name: 'is_edited',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('messages', 'is_edited');
  }
}
