import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SaveResponseDto {
  @Expose() id: string;
  @Expose() text: string;
  @Expose() sentence: string | null;
  @Expose() sourceUrl: string | null;
  @Expose() sourceTitle: string | null;
  @Expose() category: string | null;
  @Expose() createdAt: Date;

  // userId, paragraph intentionally not exposed
}
