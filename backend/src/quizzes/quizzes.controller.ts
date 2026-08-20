import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type {
  CreateQuizDto,
  QuizDetailDto,
  QuizSummaryDto,
} from './dto/quiz.dto';
import { createQuizSchema } from './schemas/quiz.schema';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createQuizSchema)) dto: CreateQuizDto,
  ): Promise<{ id: string }> {
    return this.quizzesService.create(dto);
  }

  @Get()
  findAll(): Promise<QuizSummaryDto[]> {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<QuizDetailDto> {
    return this.quizzesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.quizzesService.remove(id);
  }
}
