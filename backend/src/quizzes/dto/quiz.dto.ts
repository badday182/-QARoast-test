import { z } from 'zod';
import { createQuizSchema } from '../schemas/quiz.schema';

export type CreateQuizDto = z.infer<typeof createQuizSchema>;
export type CreateQuestionDto = CreateQuizDto['questions'][number];

/** GET /quizzes — one row of the list. */
export interface QuizSummaryDto {
  id: string;
  title: string;
  questionCount: number;
  createdAt: Date;
}

/** GET /quizzes/:id — read-only detail view. */
export interface QuizDetailDto {
  id: string;
  title: string;
  createdAt: Date;
  questions: {
    id: string;
    type: 'BOOLEAN' | 'INPUT' | 'CHECKBOX';
    text: string;
    order: number;
    correctBoolean: boolean | null;
    correctText: string | null;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      order: number;
    }[];
  }[];
}
