import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../database/orm-entities/user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const row = this.repo.create(data as any);
    const saved = (await this.repo.save(row)) as unknown as UserOrmEntity;
    return this.toDomain(saved);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    await this.repo.update(id, data as any);
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async findByStripeCustomerId(customerId: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({ where: { stripeCustomerId: customerId } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(orm: UserOrmEntity): UserEntity {
    const entity = new UserEntity();
    Object.assign(entity, orm);
    return entity;
  }
}
