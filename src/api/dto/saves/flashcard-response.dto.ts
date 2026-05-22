import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FlashcardResponseDto {
  @Expose() id: string;
  @Expose() text: string;
  @Expose() category: string;
  @Expose() pronunciation: string | null;
  @Expose() meaning: string;
  @Expose() usage: string;
  @Expose() example: string;
  @Expose() source_title: string;
  @Expose() source_url: string;
}
