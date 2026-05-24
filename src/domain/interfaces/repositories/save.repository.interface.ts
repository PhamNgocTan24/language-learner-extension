import { SaveEntity } from '../../entities/save.entity';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface IISaveRepository {
  create(save: Partial<SaveEntity>): Promise<SaveEntity>;
  findById(id: string): Promise<SaveEntity | null>;
  findByUserId(userId: string, options?: PaginationOptions): Promise<SaveEntity[]>;
  findByUserAndDateRange(userId: string, start: Date, end: Date): Promise<SaveEntity[]>;
  countByUserAndMonth(userId: string, year: number, month: number): Promise<number>;
  deleteById(id: string): Promise<void>;
}
