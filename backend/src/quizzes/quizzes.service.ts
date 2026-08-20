import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuestionDto,
  CreateQuizDto,
  QuizDetailDto,
  QuizSummaryDto,
} from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * One nested create — a quiz with half of its questions can never be
   * persisted, so no manual $transaction is needed.
   */
  async create(dto: CreateQuizDto): Promise<{ id: string }> {
    const quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        questions: { create: dto.questions.map(toQuestionCreateInput) },
      },
      select: { id: true },
    });

    return quiz;
  }

  async findAll(): Promise<QuizSummaryDto[]> {
    const quizzes = await this.prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map(({ _count, ...quiz }) => ({
      ...quiz,
      questionCount: _count.questions,
    }));
  }

  async findOne(id: string): Promise<QuizDetailDto> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            text: true,
            order: true,
            correctBoolean: true,
            correctText: true,
            options: {
              orderBy: { order: 'asc' },
              select: { id: true, text: true, isCorrect: true, order: true },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz ${id} not found`);
    }

    return quiz;
  }

  /** Questions and options go with it via onDelete: Cascade. */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.quiz.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Quiz ${id} not found`);
      }
      throw error;
    }
  }
}

/**
 * Fans the discriminated union out into the three answer columns: exactly one
 * of correctBoolean / correctText / options is populated per question.
 */
function toQuestionCreateInput(
  question: CreateQuestionDto,
  index: number,
): Prisma.QuestionCreateWithoutQuizInput {
  const base = { type: question.type, text: question.text, order: index };

  switch (question.type) {
    case 'BOOLEAN':
      return { ...base, correctBoolean: question.correctBoolean };
    case 'INPUT':
      return { ...base, correctText: question.correctText };
    case 'CHECKBOX':
      return {
        ...base,
        options: {
          create: question.options.map((option, optionIndex) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: optionIndex,
          })),
        },
      };
  }
}
