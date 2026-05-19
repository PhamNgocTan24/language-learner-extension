import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // secrets passed per-call in AuthService
    DatabaseModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
