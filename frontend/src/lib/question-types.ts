import type { QuestionType } from './validation/quiz.schema';

/** Человекочитаемые названия типов — одни и те же в форме и на странице деталей. */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  BOOLEAN: 'True / False',
  INPUT: 'Short answer',
  CHECKBOX: 'Multiple choice',
};
