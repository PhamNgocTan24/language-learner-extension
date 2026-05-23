import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { SaveOrmEntity } from './save.orm-entity';

@Entity('quizzes')
@Index('idx_quizzes_user_id', ['userId'])
export class QuizOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ name: 'save_id' })
  saveId: string;

  @ManyToOne(() => SaveOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'save_id' })
  save: SaveOrmEntity;

  @Column('text')
  question: string;

  @Column({ type: 'jsonb' })
  options: string[];

  @Column()
  correct: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ name: 'user_answer', nullable: true })
  userAnswer: string | null;

  @Column({ name: 'is_correct', nullable: true })
  isCorrect: boolean | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
