import { z } from 'zod';

/**
 * Single source of truth for the request shape of POST /quizzes.
 * Mirrored in frontend/src/lib/validation/quiz.schema.ts — change both together.
 */
const questionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('BOOLEAN'),
    text: z.string().min(1).max(500),
    correctBoolean: z.boolean(),
  }),
  z.object({
    type: z.literal('INPUT'),
    text: z.string().min(1).max(500),
    correctText: z.string().min(1).max(500),
  }),
  z.object({
    type: z.literal('CHECKBOX'),
    text: z.string().min(1).max(500),
    options: z
      .array(
        z.object({
          text: z.string().min(1).max(500),
          isCorrect: z.boolean(),
        }),
      )
      .min(2)
      .max(10)
      .refine(
        (options) => options.some((option) => option.isCorrect),
        'At least one option must be correct',
      ),
  }),
]);

export const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  questions: z.array(questionSchema).min(1).max(50),
});
