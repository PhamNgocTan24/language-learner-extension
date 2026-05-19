import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class AnswerQuizDto {
  @ApiProperty({ enum: ['A', 'B', 'C', 'D'], example: 'A' })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  answer: string;
}
