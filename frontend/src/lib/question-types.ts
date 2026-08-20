import type { QuestionType } from './validation/quiz.schema';

/** Людиночитні назви типів — ті самі у формі та на сторінці деталей. */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  BOOLEAN: 'True / False',
  INPUT: 'Short answer',
  CHECKBOX: 'Multiple choice',
};
