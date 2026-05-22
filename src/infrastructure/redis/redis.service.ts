import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { format } from 'date-fns';

/**
 * RedisService — thin wrapper around ioredis.
 * Key conventions (from architect.md):
 *   saves:count:{userId}:{YYYY-MM}     TTL 30 days   free tier counter
 *   quiz:cache:{saveId}:{level}        TTL 7 days    cached quiz
 *   ratelimit:{userId}                 TTL 1 min     rate limiting
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: true,
    });
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  // ── Free tier save counter ──────────────────────────────────────────────

  async incrementSaveCount(userId: string): Promise<number> {
    const key = `saves:count:${userId}:${format(new Date(), 'yyyy-MM')}`;
    const count = await this.client.incr(key);
    if (count === 1) {
      // First save of the month — set TTL to 30 days
      await this.client.expire(key, 60 * 60 * 24 * 30);
    }
    return count;
  }

  async getSaveCount(userId: string): Promise<number> {
    const key = `saves:count:${userId}:${format(new Date(), 'yyyy-MM')}`;
    const val = await this.client.get(key);
    return val ? parseInt(val, 10) : 0;
  }

  async decrementSaveCount(userId: string): Promise<void> {
    const key = `saves:count:${userId}:${format(new Date(), 'yyyy-MM')}`;
    await this.client.decr(key);
  }

  // ── Quiz cache ──────────────────────────────────────────────────────────

  async getCachedQuiz(saveId: string, level: string): Promise<string | null> {
    return this.client.get(`quiz:cache:${saveId}:${level}`);
  }

  async setCachedQuiz(saveId: string, level: string, data: string): Promise<void> {
    // TTL: 7 days
    await this.client.set(`quiz:cache:${saveId}:${level}`, data, 'EX', 60 * 60 * 24 * 7);
  }

  async getCachedFlashcard(saveId: string): Promise<string | null> {
    return this.client.get(`flashcard:${saveId}`);
  }

  async setCachedFlashcard(saveId: string, data: string): Promise<void> {
    // TTL: 30 days
    await this.client.set(`flashcard:${saveId}`, data, 'EX', 60 * 60 * 24 * 30);
  }

  // ── Rate limiting ───────────────────────────────────────────────────────

  async checkRateLimit(userId: string, limit = 60): Promise<boolean> {
    const key = `ratelimit:${userId}`;
    const count = await this.client.incr(key);
    if (count === 1) await this.client.expire(key, 60);
    return count <= limit;
  }
}
