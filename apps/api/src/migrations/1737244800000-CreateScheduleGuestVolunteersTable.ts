import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateScheduleGuestVolunteersTable1737244800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create schedule_guest_volunteers table
    await queryRunner.createTable(
      new Table({
        name: 'schedule_guest_volunteers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'schedule_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'person_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'added_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create unique constraint
    await queryRunner.createIndex(
      'schedule_guest_volunteers',
      new TableIndex({
        name: 'UQ_schedule_guest_volunteers_schedule_person',
        columnNames: ['schedule_id', 'person_id'],
        isUnique: true,
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'schedule_guest_volunteers',
      new TableIndex({
        name: 'IDX_schedule_guest_volunteers_schedule_id',
        columnNames: ['schedule_id'],
      }),
    );

    await queryRunner.createIndex(
      'schedule_guest_volunteers',
      new TableIndex({
        name: 'IDX_schedule_guest_volunteers_person_id',
        columnNames: ['person_id'],
      }),
    );

    await queryRunner.createIndex(
      'schedule_guest_volunteers',
      new TableIndex({
        name: 'IDX_schedule_guest_volunteers_added_by',
        columnNames: ['added_by'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'schedule_guest_volunteers',
      new TableForeignKey({
        columnNames: ['schedule_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'schedules',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'schedule_guest_volunteers',
      new TableForeignKey({
        columnNames: ['person_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'persons',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'schedule_guest_volunteers',
      new TableForeignKey({
        columnNames: ['added_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('schedule_guest_volunteers');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('schedule_guest_volunteers', foreignKey);
      }
    }

    await queryRunner.dropTable('schedule_guest_volunteers', true);
  }
}
