import type {
  CreateQuizInput,
  QuestionType,
} from '@/lib/validation/quiz.schema';

import { http } from './http';

export type QuizListItem = {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
};

export type QuizDetailOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
};

export type QuizDetailQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  order: number;
  correctBoolean: boolean | null;
  correctText: string | null;
  options: QuizDetailOption[];
};

export type QuizDetail = {
  id: string;
  title: string;
  createdAt: string;
  questions: QuizDetailQuestion[];
};

/** GET /quizzes */
export function fetchQuizzes(): Promise<QuizListItem[]> {
  return http.get<QuizListItem[]>('/quizzes', { cache: 'no-store' });
}

/** GET /quizzes/:id — кидає ApiError зі status 404, якщо квізу немає. */
export function fetchQuiz(id: string): Promise<QuizDetail> {
  return http.get<QuizDetail>(`/quizzes/${id}`, { cache: 'no-store' });
}

/** POST /quizzes */
export function createQuiz(input: CreateQuizInput): Promise<{ id: string }> {
  return http.post<{ id: string }>('/quizzes', input);
}

/** DELETE /quizzes/:id */
export function deleteQuiz(id: string): Promise<void> {
  return http.delete(`/quizzes/${id}`);
}
