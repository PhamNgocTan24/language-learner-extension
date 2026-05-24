import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNativeLanguageToUsers1760000000001 implements MigrationInterface {
  name = 'AddNativeLanguageToUsers1760000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'native_language',
        type: 'varchar',
        length: '50',
        default: "'Vietnamese'",
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'native_language');
  }
}
