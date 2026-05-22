import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class SuggestSaveDto {
  @ApiProperty({ example: 'subscri' })
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiProperty({ example: 'Realtime subscriptions make updates instant.' })
  @IsString()
  @MaxLength(2000)
  sentence: string;

  @ApiProperty({ example: 'Start your project with a Postgres database...' })
  @IsString()
  @MaxLength(5000)
  paragraph: string;
}
