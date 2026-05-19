import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { ApplicationModule } from './application/application.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { LlmModule } from './infrastructure/llm/llm.module';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [
    // Load .env globally — must be first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Infrastructure
    DatabaseModule,
    LlmModule,
    RedisModule,
    // Application logic
    ApplicationModule,
    // HTTP layer
    ApiModule,
  ],
})
export class AppModule {}
