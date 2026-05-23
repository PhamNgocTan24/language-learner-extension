import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  NativeLanguage,
  UserGoal,
  UserLevel,
  UserTier,
} from '../../../domain/entities/user.entity';

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

  @Column({ name: 'native_language', length: 50, default: 'Vietnamese' })
  nativeLanguage: NativeLanguage;

  @Column({ default: 'free' })
  tier: UserTier;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
