import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../application/auth/guards/jwt-auth.guard';
import { UsersService } from '../../application/services/users.service';
import { UpdateUserDto } from '../dto/users/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.userId);
  }

  @ApiOperation({ summary: 'Update level or goal' })
  @Patch('me')
  update(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get quiz stats (total, correct, accuracy %)' })
  @Get('me/stats')
  getStats(@Req() req: any) {
    return this.usersService.getStats(req.user.userId);
  }
}
