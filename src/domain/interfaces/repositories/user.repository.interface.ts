import { UserEntity } from '../../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: Partial<UserEntity>): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  findByStripeCustomerId(customerId: string): Promise<UserEntity | null>;
}
