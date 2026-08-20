'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button, CrossIcon, TextInput } from '@/components/ui';
import type { CreateQuizInput } from '@/lib/validation/quiz.schema';

import styles from './checkbox-options.module.css';
import { useQuestionErrors } from './question-errors';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

type CheckboxOptionsProps = {
  index: number;
};

/** Вложенный useFieldArray: опции живут внутри элемента массива вопросов. */
export function CheckboxOptions({ index }: CheckboxOptionsProps) {
  const { control, register } = useFormContext<CreateQuizInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });
  const errors = useQuestionErrors(index);

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Options</legend>
      <p className={styles.hint}>Tick every option that is correct.</p>

      <ul className={styles.list}>
        {fields.map((field, optionIndex) => {
          const optionId = `question-${index}-option-${optionIndex}`;
          const error = errors.optionText(optionIndex);

          return (
            <li key={field.id}>
              <div className={styles.row}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  aria-label={`Option ${optionIndex + 1} is correct`}
                  {...register(
                    `questions.${index}.options.${optionIndex}.isCorrect`,
                  )}
                />
                <span className={styles.inputCell}>
                  <TextInput
                    id={optionId}
                    aria-label={`Option ${optionIndex + 1} text`}
                    placeholder={`Option ${optionIndex + 1}`}
                    invalid={Boolean(error)}
                    {...register(
                      `questions.${index}.options.${optionIndex}.text`,
                    )}
                  />
                </span>
                <Button
                  variant="ghost"
                  iconOnly
                  aria-label={`Remove option ${optionIndex + 1}`}
                  disabled={fields.length <= MIN_OPTIONS}
                  onClick={() => remove(optionIndex)}
                >
                  <CrossIcon />
                </Button>
              </div>
              {error && (
                <p className={styles.rowError} role="alert">
                  {error}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {errors.optionsGroup && (
        <p className={styles.groupError} role="alert">
          {errors.optionsGroup}
        </p>
      )}

      <Button
        variant="secondary"
        className={styles.addOption}
        disabled={fields.length >= MAX_OPTIONS}
        onClick={() => append({ text: '', isCorrect: false })}
      >
        Add option
      </Button>
    </fieldset>
  );
}
