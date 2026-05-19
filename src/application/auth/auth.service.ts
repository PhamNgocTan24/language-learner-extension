import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

interface GoogleProfile {
  email: string;
  name: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY') private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async findOrCreateUser(profile: GoogleProfile): Promise<UserEntity> {
    let user = await this.userRepo.findByEmail(profile.email);
    if (!user) {
      user = await this.userRepo.create({
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        level: 'B1',
        tier: 'free',
      });
    }
    return user;
  }

  issueTokens(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, tier: user.tier };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      }),
    };
  }

  refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const newPayload = { sub: payload.sub, email: payload.email, tier: payload.tier };
      return {
        accessToken: this.jwtService.sign(newPayload, {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
        }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
