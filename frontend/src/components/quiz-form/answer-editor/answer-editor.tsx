'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { Field, TextInput, fieldErrorId } from '@/components/ui';
import type {
  CreateQuizInput,
  QuestionType,
} from '@/lib/validation/quiz.schema';

import styles from './answer-editor.module.css';
import { CheckboxOptions } from '../checkbox-options/checkbox-options';
import { useQuestionErrors } from '../question-errors';

type AnswerEditorProps = {
  index: number;
  type: QuestionType;
};

const BOOLEAN_CHOICES = [true, false] as const;

/**
 * Поле відповіді залежить від типу запитання. Додається тип — правиться і цей
 * switch, і Prisma-enum, і Zod-схема, і рендер деталей (див. CLAUDE.md).
 */
export function AnswerEditor({ index, type }: AnswerEditorProps) {
  const { control, register } = useFormContext<CreateQuizInput>();
  const errors = useQuestionErrors(index);

  if (type === 'BOOLEAN') {
    return (
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Correct answer</legend>
        <Controller
          control={control}
          name={`questions.${index}.correctBoolean`}
          render={({ field }) => (
            <div className={styles.choices}>
              {BOOLEAN_CHOICES.map((choice) => (
                <label key={String(choice)} className={styles.choice}>
                  <input
                    type="radio"
                    className={styles.radio}
                    name={field.name}
                    checked={field.value === choice}
                    onChange={() => field.onChange(choice)}
                    onBlur={field.onBlur}
                  />
                  {choice ? 'True' : 'False'}
                </label>
              ))}
            </div>
          )}
        />
      </fieldset>
    );
  }

  if (type === 'INPUT') {
    const answerId = `question-${index}-answer`;
    const error = errors.correctText;

    return (
      <Field label="Correct answer" htmlFor={answerId} required error={error}>
        <TextInput
          id={answerId}
          placeholder="Not a Number"
          invalid={Boolean(error)}
          aria-describedby={error ? fieldErrorId(answerId) : undefined}
          {...register(`questions.${index}.correctText`)}
        />
      </Field>
    );
  }

  return <CheckboxOptions index={index} />;
}
