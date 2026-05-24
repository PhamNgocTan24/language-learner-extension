import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateSaveDto {
  @ApiProperty({ example: 'ephemeral', description: 'Highlighted word or phrase' })
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiPropertyOptional({ example: 'The ephemeral nature of cherry blossoms makes them special.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  sentence?: string;

  @ApiPropertyOptional({ example: 'Japan is famous for its cherry blossoms...' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  paragraph?: string;

  @ApiPropertyOptional({ example: 'https://example.com/article' })
  @IsOptional()
  @IsUrl({ require_protocol: true, require_valid_protocol: false })
  @MaxLength(2000)
  sourceUrl?: string;

  @ApiPropertyOptional({ example: 'Japan Travel Guide' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sourceTitle?: string;

  @ApiPropertyOptional({
    enum: ['Vocabulary', 'Phrase', 'Grammar', 'Idiom'],
    example: 'Vocabulary',
  })
  @IsOptional()
  @IsIn(['Vocabulary', 'Phrase', 'Grammar', 'Idiom'])
  category?: string;
}
