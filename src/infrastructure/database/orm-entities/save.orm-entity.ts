import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SaveCategory } from '../../../domain/entities/save.entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('saves')
@Index('idx_saves_user_id', ['userId'])
@Index('idx_saves_created_at', ['createdAt'])
export class SaveOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column('text')
  text: string;

  @Column({ type: 'text', nullable: true })
  sentence: string | null;

  @Column({ type: 'text', nullable: true })
  paragraph: string | null;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;

  @Column({ name: 'source_title', type: 'text', nullable: true })
  sourceTitle: string | null;

  @Column({ nullable: true })
  category: SaveCategory | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
