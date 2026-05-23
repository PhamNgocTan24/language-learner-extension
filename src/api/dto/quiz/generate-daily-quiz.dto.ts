import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class GenerateDailyQuizDto {
  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' })
  @IsString()
  @MaxLength(100)
  timezone: string;
}
