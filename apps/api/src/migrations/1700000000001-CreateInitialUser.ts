import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialUser1700000000001 implements MigrationInterface {
  name = 'CreateInitialUser1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert initial admin user
    // Email: rafaeljfec2@gmail.com
    // Password: 20402678 (hashed with bcrypt, salt rounds: 10)
    await queryRunner.query(`
      INSERT INTO users (
        id,
        email,
        password_hash,
        name,
        role,
        is_active,
        person_id,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        'rafaeljfec2@gmail.com',
        '$2b$10$uF75KGrxsStH3nPzjlNFZe4ybIdMz01eZds.r7WbrmTxMob/fSNMy',
        'Rafael',
        'admin',
        true,
        NULL,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove initial user
    await queryRunner.query(`
      DELETE FROM users 
      WHERE email = 'rafaeljfec2@gmail.com';
    `);
  }
}
