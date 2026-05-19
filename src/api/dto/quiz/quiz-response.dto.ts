import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class QuizResponseDto {
  @Expose() id: string;
  @Expose() saveId: string;
  @Expose() question: string;
  @Expose() options: string[];
  @Expose() userAnswer: string | null;
  @Expose() isCorrect: boolean | null;
  @Expose() createdAt: Date;

  // correct + explanation exposed only after answering — handled in controller
  @Expose() correct?: string;
  @Expose() explanation?: string;
}
