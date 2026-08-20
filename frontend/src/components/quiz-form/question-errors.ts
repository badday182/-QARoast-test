import { useFormContext } from 'react-hook-form';

import type { CreateQuizInput } from '@/lib/validation/quiz.schema';

/**
 * Ошибки одного вопроса.
 *
 * questions[] — массив discriminated union, поэтому RHF типизирует ветку ошибок
 * по общим полям union'а: до `correctText` / `options` через неё не добраться.
 * Сужаем один раз здесь, чтобы каст не расползался по компонентам.
 */
type FieldError = { message?: string };

type QuestionErrorNode = {
  text?: FieldError;
  correctBoolean?: FieldError;
  correctText?: FieldError;
  options?: FieldError & {
    root?: FieldError;
  } & Record<number, { text?: FieldError; isCorrect?: FieldError } | undefined>;
};

export type QuestionErrors = {
  text?: string;
  correctBoolean?: string;
  correctText?: string;
  /** Ошибка всего набора опций: меньше двух, больше десяти, ни одной верной. */
  optionsGroup?: string;
  optionText: (optionIndex: number) => string | undefined;
};

export function useQuestionErrors(index: number): QuestionErrors {
  const {
    formState: { errors },
  } = useFormContext<CreateQuizInput>();

  const node = errors.questions?.[index] as QuestionErrorNode | undefined;
  const options = node?.options;

  return {
    text: node?.text?.message,
    correctBoolean: node?.correctBoolean?.message,
    correctText: node?.correctText?.message,
    optionsGroup: options?.root?.message ?? options?.message,
    optionText: (optionIndex) => options?.[optionIndex]?.text?.message,
  };
}
