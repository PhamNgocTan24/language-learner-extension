import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  IISaveRepository,
  PaginationOptions,
} from '../../domain/interfaces/repositories/save.repository.interface';
import { SaveEntity } from '../../domain/entities/save.entity';
import { SaveOrmEntity } from '../database/orm-entities/save.orm-entity';

@Injectable()
export class SaveRepository implements IISaveRepository {
  constructor(
    @InjectRepository(SaveOrmEntity)
    private readonly repo: Repository<SaveOrmEntity>,
  ) {}

  async create(data: Partial<SaveEntity>): Promise<SaveEntity> {
    const row = this.repo.create(data as any);
    const saved = (await this.repo.save(row)) as unknown as SaveOrmEntity;
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<SaveEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: string, options?: PaginationOptions): Promise<SaveEntity[]> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async countByUserAndMonth(userId: string, year: number, month: number): Promise<number> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return this.repo.count({
      where: {
        userId,
        createdAt: Between(start, end),
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(orm: SaveOrmEntity): SaveEntity {
    const entity = new SaveEntity();
    Object.assign(entity, orm);
    return entity;
  }
}
