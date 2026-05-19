import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SavesService } from './services/saves.service';
import { QuizService } from './services/quiz.service';
import { UsersService } from './services/users.service';
import { PaymentsService } from './services/payments.service';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { LlmModule } from '../infrastructure/llm/llm.module';
import { StripeService } from '../infrastructure/payments/stripe.service';

@Module({
  imports: [AuthModule, DatabaseModule, LlmModule],
  providers: [SavesService, QuizService, UsersService, PaymentsService, StripeService],
  exports: [SavesService, QuizService, UsersService, PaymentsService, AuthModule],
})
export class ApplicationModule {}
