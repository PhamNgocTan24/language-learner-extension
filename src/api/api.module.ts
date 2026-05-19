import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { AuthController } from './controllers/auth.controller';
import { SavesController } from './controllers/saves.controller';
import { QuizController } from './controllers/quiz.controller';
import { UsersController } from './controllers/users.controller';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    SavesController,
    QuizController,
    UsersController,
    PaymentsController,
  ],
})
export class ApiModule {}
