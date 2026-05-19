import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from './ormconfig';
import { UserRepository } from '../repositories/user.repository';
import { SaveRepository } from '../repositories/save.repository';
import { QuizRepository } from '../repositories/quiz.repository';
import { UserOrmEntity } from './orm-entities/user.orm-entity';
import { SaveOrmEntity } from './orm-entities/save.orm-entity';
import { QuizOrmEntity } from './orm-entities/quiz.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    TypeOrmModule.forFeature([UserOrmEntity, SaveOrmEntity, QuizOrmEntity]),
  ],
  providers: [
    // Repository DI tokens — application layer injects by string token
    { provide: 'USER_REPOSITORY', useClass: UserRepository },
    { provide: 'SAVE_REPOSITORY', useClass: SaveRepository },
    { provide: 'QUIZ_REPOSITORY', useClass: QuizRepository },
  ],
  exports: ['USER_REPOSITORY', 'SAVE_REPOSITORY', 'QUIZ_REPOSITORY'],
})
export class DatabaseModule {}
