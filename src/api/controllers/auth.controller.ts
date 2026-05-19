import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../../application/auth/auth.service';
import { GoogleAuthGuard } from '../../application/auth/guards/google-auth.guard';
import { JwtAuthGuard } from '../../application/auth/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Redirect to Google login */
  @ApiOperation({ summary: 'Redirect to Google OAuth login' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Guard handles the redirect
  }

  /** Google OAuth callback */
  @ApiOperation({ summary: 'Google OAuth callback — issues JWT tokens' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;
    const user = await this.authService.findOrCreateUser({
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.avatarUrl,
    });
    const tokens = this.authService.issueTokens(user);
    // Redirect to frontend with tokens in query params (or set cookies)
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  /** Refresh JWT access token */
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  /** Logout — client should discard tokens */
  @ApiOperation({ summary: 'Logout (client discards tokens)' })
  @ApiBearerAuth('access-token')
  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return { message: 'Logged out' };
  }
}
