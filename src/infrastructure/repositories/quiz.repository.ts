import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IQuizRepository } from '../../domain/interfaces/repositories/quiz.repository.interface';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { QuizOrmEntity } from '../database/orm-entities/quiz.orm-entity';

@Injectable()
export class QuizRepository implements IQuizRepository {
  constructor(
    @InjectRepository(QuizOrmEntity)
    private readonly repo: Repository<QuizOrmEntity>,
  ) {}

  async create(data: Partial<QuizEntity>): Promise<QuizEntity> {
    const row = this.repo.create(data as any);
    const saved = (await this.repo.save(row)) as unknown as QuizOrmEntity;
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<QuizEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<QuizEntity[]> {
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findBySaveId(saveId: string): Promise<QuizEntity | null> {
    const row = await this.repo.findOne({ where: { saveId }, order: { createdAt: 'DESC' } });
    return row ? this.toDomain(row) : null;
  }

  async updateAnswer(id: string, userAnswer: string, isCorrect: boolean): Promise<QuizEntity> {
    await this.repo.update(id, { userAnswer, isCorrect });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async countCorrectByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, isCorrect: true } });
  }

  async countTotalByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  private toDomain(orm: QuizOrmEntity): QuizEntity {
    const entity = new QuizEntity();
    Object.assign(entity, orm);
    return entity;
  }
}
