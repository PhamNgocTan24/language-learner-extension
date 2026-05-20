/**
 * DataSource for TypeORM CLI (migration:generate / migration:run).
 * ts-node reads this file directly — it must be self-contained.
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { UserOrmEntity } from './orm-entities/user.orm-entity';
import { SaveOrmEntity } from './orm-entities/save.orm-entity';
import { QuizOrmEntity } from './orm-entities/quiz.orm-entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserOrmEntity, SaveOrmEntity, QuizOrmEntity],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});
