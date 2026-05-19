import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Global Redis module — injected anywhere without re-importing.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
