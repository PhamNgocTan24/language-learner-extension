import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../application/auth/guards/jwt-auth.guard';
import { QuizService } from '../../application/services/quiz.service';
import { AnswerQuizDto } from '../dto/quiz/answer-quiz.dto';
import { GenerateDailyQuizDto } from '../dto/quiz/generate-daily-quiz.dto';
import { QuizResponseDto } from '../dto/quiz/quiz-response.dto';

@ApiTags('Quiz')
@ApiBearerAuth('access-token')
@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @ApiOperation({ summary: 'Generate a quiz question for a saved highlight (cached 7 days)' })
  @Post('generate/:saveId')
  async generate(@Req() req: any, @Param('saveId', ParseUUIDPipe) saveId: string) {
    const quiz = await this.quizService.generate(req.user.userId, saveId);
    return this.toHiddenQuizDto(quiz);
  }

  @ApiOperation({ summary: 'Generate quizzes for all saves created today in the user timezone' })
  @Post('generate-daily')
  async generateDaily(@Req() req: any, @Body() dto: GenerateDailyQuizDto) {
    const quizzes = await this.quizService.generateDaily(req.user.userId, dto.timezone);
    return {
      total: quizzes.length,
      quizzes: quizzes.map((quiz) => this.toHiddenQuizDto(quiz)),
    };
  }

  @ApiOperation({ summary: 'Submit answer - returns correct answer and explanation' })
  @Post(':quizId/answer')
  async answer(
    @Req() req: any,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: AnswerQuizDto,
  ) {
    const quiz = await this.quizService.submitAnswer(req.user.userId, quizId, dto.answer);
    return plainToInstance(QuizResponseDto, quiz, { excludeExtraneousValues: true });
  }

  @ApiOperation({ summary: "Get current user's quiz history" })
  @Get('history')
  async history(@Req() req: any) {
    const quizzes = await this.quizService.getHistory(req.user.userId);
    return quizzes.map((q) =>
      plainToInstance(QuizResponseDto, q, { excludeExtraneousValues: true }),
    );
  }

  private toHiddenQuizDto(quiz: any) {
    return plainToInstance(
      QuizResponseDto,
      { ...quiz, correct: undefined, explanation: undefined },
      { excludeExtraneousValues: true },
    );
  }
}
