import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IISaveRepository } from '../../domain/interfaces/repositories/save.repository.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { SaveLimitDomainService } from '../../domain/services/save-limit.domain.service';
import { SaveCategory, SaveEntity } from '../../domain/entities/save.entity';
import { LlmService } from '../../infrastructure/llm/llm.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { FlashcardResponse, SuggestResponse } from '../../domain/services/llm/llm.interface';

interface CreateSaveDto {
  text: string;
  sentence?: string;
  paragraph?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  category?: string;
}

interface FlashcardDto extends FlashcardResponse {
  id: string;
  text: string;
  category: string;
  source_title: string;
  source_url: string;
}

@Injectable()
export class SavesService {
  private readonly saveLimitService = new SaveLimitDomainService();

  constructor(
    @Inject('SAVE_REPOSITORY') private readonly saveRepo: IISaveRepository,
    @Inject('USER_REPOSITORY') private readonly userRepo: IUserRepository,
    private readonly llmService: LlmService,
    private readonly redisService: RedisService,
  ) {}

  async create(userId: string, dto: CreateSaveDto): Promise<SaveEntity> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Check free tier monthly limit via Redis counter
    const count = await this.redisService.getSaveCount(userId);
    if (!this.saveLimitService.canSave(user.tier, count)) {
      throw new ForbiddenException(
        `Free tier limit reached (${count}/20 saves this month). Upgrade to Pro for unlimited saves.`,
      );
    }

    const save = await this.saveRepo.create({
      userId,
      text: dto.text,
      sentence: dto.sentence ?? null,
      paragraph: dto.paragraph ?? null,
      sourceUrl: dto.sourceUrl ?? null,
      sourceTitle: dto.sourceTitle ?? null,
      category: (dto.category as any) ?? null,
    });

    // Increment Redis counter after successful save
    await this.redisService.incrementSaveCount(userId);

    return save;
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<SaveEntity[]> {
    return this.saveRepo.findByUserId(userId, { page, limit });
  }

  async delete(userId: string, saveId: string): Promise<void> {
    const save = await this.saveRepo.findById(saveId);
    if (!save) throw new NotFoundException('Save not found');
    if (save.userId !== userId) throw new ForbiddenException('Access denied');

    await this.saveRepo.deleteById(saveId);
    await this.redisService.decrementSaveCount(userId);
  }

  async suggestCategory(text: string): Promise<string> {
    return this.llmService.suggestCategory(text);
  }

  async suggest(text: string, sentence: string, paragraph: string): Promise<SuggestResponse> {
    return this.llmService.suggest(text, sentence, paragraph);
  }

  async getFlashcard(userId: string, saveId: string): Promise<FlashcardDto> {
    const save = await this.saveRepo.findById(saveId);
    if (!save) throw new NotFoundException('Save not found');
    if (save.userId !== userId) throw new ForbiddenException('Access denied');

    const cached = await this.redisService.getCachedFlashcard(saveId);
    const category = this.normalizeCategory(save.category);
    let content = cached
      ? (JSON.parse(cached) as FlashcardResponse)
      : await this.buildFlashcard(save);
    const shouldRefreshCachedPronunciation =
      Boolean(cached) && this.needsPronunciation(category) && !content.pronunciation;

    if (shouldRefreshCachedPronunciation) {
      content = await this.buildFlashcard(save);
    }

    if (!cached || shouldRefreshCachedPronunciation) {
      await this.redisService.setCachedFlashcard(saveId, JSON.stringify(content));
    }

    return {
      id: save.id,
      text: save.text,
      category,
      pronunciation: content.pronunciation,
      meaning: content.meaning,
      usage: content.usage,
      example: content.example,
      source_title: save.sourceTitle ?? '',
      source_url: save.sourceUrl ?? '',
    };
  }

  private async buildFlashcard(save: SaveEntity): Promise<FlashcardResponse> {
    const user = await this.userRepo.findById(save.userId);
    if (!user) throw new NotFoundException('User not found');

    return this.llmService.generateFlashcard({
      text: save.text,
      sentence: save.sentence ?? '',
      paragraph: save.paragraph ?? '',
      category: (save.category ?? 'Vocabulary') as SaveCategory,
      userLevel: user.level,
      userNativeLanguage: user.nativeLanguage ?? 'Vietnamese',
    });
  }

  private normalizeCategory(category: SaveCategory | string | null): SaveCategory {
    if (category === 'Phrase' || category === 'Grammar' || category === 'Idiom') {
      return category;
    }

    return 'Vocabulary';
  }

  private needsPronunciation(category: SaveCategory): boolean {
    return category !== 'Grammar';
  }
}
