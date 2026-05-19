import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserLevel, UserTier, UserGoal } from '../../../domain/entities/user.entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string | null;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ default: 'B1' })
  level: UserLevel;

  @Column({ nullable: true })
  goal: UserGoal | null;

  @Column({ default: 'free' })
  tier: UserTier;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
