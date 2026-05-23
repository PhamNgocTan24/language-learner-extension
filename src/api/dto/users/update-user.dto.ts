import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: ['A2', 'B1', 'B2', 'C1'], example: 'B2' })
  @IsOptional()
  @IsIn(['A2', 'B1', 'B2', 'C1'])
  level?: 'A2' | 'B1' | 'B2' | 'C1';

  @ApiPropertyOptional({ enum: ['read_news', 'work', 'ielts'], example: 'ielts' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({
    enum: ['Vietnamese', 'Indonesian', 'Thai', 'Other'],
    example: 'Vietnamese',
  })
  @IsOptional()
  @IsString()
  nativeLanguage?: string;
}
