import { z } from 'zod';

/**
 * Дзеркало backend/src/quizzes/schemas/quiz.schema.ts.
 * Копія навмисна — спільний пакет тут не окупається.
 * Змінюєш одну сторону — зміни й другу тим самим комітом.
 */

export const QUESTION_TYPES = ['BOOLEAN', 'INPUT', 'CHECKBOX'] as const;

export const questionTypeSchema = z.enum(QUESTION_TYPES);

export const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required').max(500),
  isCorrect: z.boolean(),
});

export const questionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('BOOLEAN'),
    text: z.string().min(1, 'Question text is required').max(500),
    correctBoolean: z.boolean(),
  }),
  z.object({
    type: z.literal('INPUT'),
    text: z.string().min(1, 'Question text is required').max(500),
    correctText: z.string().min(1, 'Correct answer is required').max(500),
  }),
  z.object({
    type: z.literal('CHECKBOX'),
    text: z.string().min(1, 'Question text is required').max(500),
    options: z
      .array(optionSchema)
      .min(2, 'Add at least 2 options')
      .max(10, 'No more than 10 options')
      .refine((options) => options.some((option) => option.isCorrect), {
        message: 'At least one option must be correct',
      }),
  }),
]);

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  questions: z
    .array(questionSchema)
    .min(1, 'Add at least one question')
    .max(50, 'No more than 50 questions'),
});

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type OptionInput = z.infer<typeof optionSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
