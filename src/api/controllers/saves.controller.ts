import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../application/auth/guards/jwt-auth.guard';
import { SavesService } from '../../application/services/saves.service';
import { CreateSaveDto } from '../dto/saves/create-save.dto';
import { SaveResponseDto } from '../dto/saves/save-response.dto';

@ApiTags('Saves')
@ApiBearerAuth('access-token')
@Controller('saves')
@UseGuards(JwtAuthGuard)
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @ApiOperation({ summary: 'Create a new saved highlight' })
  @Post()
  async create(@Req() req: any, @Body() dto: CreateSaveDto) {
    const save = await this.savesService.create(req.user.userId, dto);
    return plainToInstance(SaveResponseDto, save, { excludeExtraneousValues: true });
  }

  @ApiOperation({ summary: 'List all saves for current user (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @Get()
  async findAll(@Req() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    const saves = await this.savesService.findByUser(
      req.user.userId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return saves.map((s) => plainToInstance(SaveResponseDto, s, { excludeExtraneousValues: true }));
  }

  @ApiOperation({ summary: 'Delete a save by ID' })
  @Delete(':id')
  async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.savesService.delete(req.user.userId, id);
    return { message: 'Deleted' };
  }

  @ApiOperation({ summary: 'Ask LLM to suggest a category for a text snippet' })
  @Post('suggest-category')
  async suggestCategory(@Body('text') text: string) {
    const category = await this.savesService.suggestCategory(text);
    return { category };
  }
}
