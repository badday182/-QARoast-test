import { useFormContext } from 'react-hook-form';

import type { CreateQuizInput } from '@/lib/validation/quiz.schema';

/**
 * Помилки одного запитання.
 *
 * questions[] — масив discriminated union, тому RHF типізує гілку помилок
 * за спільними полями union'у: до `correctText` / `options` через неї не дістатися.
 * Звужуємо один раз тут, щоб каст не розповзався по компонентах.
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
  /** Помилка всього набору опцій: менше двох, більше десяти, жодної вірної. */
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
