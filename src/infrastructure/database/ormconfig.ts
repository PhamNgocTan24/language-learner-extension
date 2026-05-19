import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserOrmEntity } from './orm-entities/user.orm-entity';
import { SaveOrmEntity } from './orm-entities/save.orm-entity';
import { QuizOrmEntity } from './orm-entities/quiz.orm-entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserOrmEntity, SaveOrmEntity, QuizOrmEntity],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Never use synchronize: true in production
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV !== 'development' ? { rejectUnauthorized: false } : false,
});
