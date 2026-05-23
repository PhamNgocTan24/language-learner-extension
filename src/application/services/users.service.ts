import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { IQuizRepository } from '../../domain/interfaces/repositories/quiz.repository.interface';
import { NativeLanguage, UserEntity, UserGoal, UserLevel } from '../../domain/entities/user.entity';
import { DifficultyDomainService } from '../../domain/services/difficulty.domain.service';

interface UpdateUserDto {
  level?: UserLevel;
  goal?: UserGoal;
  nativeLanguage?: NativeLanguage;
}

@Injectable()
export class UsersService {
  private readonly difficultyService = new DifficultyDomainService();

  constructor(
    @Inject('USER_REPOSITORY') private readonly userRepo: IUserRepository,
    @Inject('QUIZ_REPOSITORY') private readonly quizRepo: IQuizRepository,
  ) {}

  async getMe(userId: string): Promise<UserEntity> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepo.update(userId, dto);
  }

  async getStats(userId: string) {
    const total = await this.quizRepo.countTotalByUserId(userId);
    const correct = await this.quizRepo.countCorrectByUserId(userId);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, accuracy };
  }
}
