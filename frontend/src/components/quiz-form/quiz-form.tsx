'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import {
  Button,
  Card,
  CrossIcon,
  Field,
  TextInput,
  fieldErrorId,
} from '@/components/ui';
import { QUESTION_TYPE_LABELS } from '@/lib/question-types';
import {
  QUESTION_TYPES,
  createQuizSchema,
  type CreateQuizInput,
  type QuestionInput,
  type QuestionType,
} from '@/lib/validation/quiz.schema';
import { ApiError } from '@/services/http';
import { createQuiz } from '@/services/quizzes';

import { AnswerEditor } from './answer-editor';
import styles from './quiz-form.module.css';

const MAX_QUESTIONS = 50;

/**
 * Заготовка вопроса под конкретный тип. У каждого типа своё поле ответа,
 * поэтому при смене типа объект заменяется целиком, а не патчится.
 */
function emptyQuestion(type: QuestionType, text = ''): QuestionInput {
  switch (type) {
    case 'BOOLEAN':
      return { type, text, correctBoolean: true };
    case 'INPUT':
      return { type, text, correctText: '' };
    case 'CHECKBOX':
      return {
        type,
        text,
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      };
  }
}

export function QuizForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateQuizInput>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: '',
      questions: [emptyQuestion('BOOLEAN')],
    },
  });

  const {
    register,
    control,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questions',
  });

  async function onSubmit(values: CreateQuizInput) {
    setSubmitError(null);

    try {
      const { id } = await createQuiz(values);
      router.push(`/quizzes/${id}`);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setSubmitError(
          cause.isOffline
            ? 'The API is unreachable. Start the backend on port 4000 and try again.'
            : cause.message,
        );
        return;
      }

      setSubmitError('Could not create the quiz. Please try again.');
    }
  }

  const titleError = errors.title?.message;
  // Ошибка самого массива (пусто / больше 50), а не отдельного вопроса
  const questionsError =
    errors.questions?.root?.message ?? errors.questions?.message;

  return (
    <FormProvider {...form}>
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Field
          label="Quiz title"
          htmlFor="quiz-title"
          required
          error={titleError}
        >
          <TextInput
            id="quiz-title"
            placeholder="JavaScript Fundamentals"
            invalid={Boolean(titleError)}
            aria-describedby={
              titleError ? fieldErrorId('quiz-title') : undefined
            }
            {...register('title')}
          />
        </Field>

        <section className={styles.questions}>
          <div className={styles.questionsHeader}>
            <h2 className={styles.legend}>Questions</h2>
            <span className={styles.counter}>
              {fields.length} of {MAX_QUESTIONS}
            </span>
          </div>

          {questionsError && (
            <p className={styles.arrayError} role="alert">
              {questionsError}
            </p>
          )}

          {fields.map((field, index) => {
            const textId = `question-${index}-text`;
            const typeId = `question-${index}-type`;
            const textError = errors.questions?.[index]?.text?.message;

            return (
              <Card as="article" key={field.id}>
                <div className={styles.questionHeader}>
                  <p className={styles.questionNumber}>Question {index + 1}</p>
                  <Button
                    variant="ghost"
                    iconOnly
                    aria-label={`Remove question ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <CrossIcon />
                  </Button>
                </div>

                <div className={styles.questionBody}>
                  <Field
                    label="Question text"
                    htmlFor={textId}
                    required
                    error={textError}
                  >
                    <TextInput
                      id={textId}
                      placeholder="What does NaN stand for?"
                      invalid={Boolean(textError)}
                      aria-describedby={
                        textError ? fieldErrorId(textId) : undefined
                      }
                      {...register(`questions.${index}.text`)}
                    />
                  </Field>

                  <div className={styles.answerColumn}>
                    <Field label="Answer type" htmlFor={typeId}>
                      <select
                        id={typeId}
                        className={styles.select}
                        value={field.type}
                        onChange={(event) => {
                          // Замена вопроса целиком: поля ответа у типов не
                          // пересекаются. Текст читаем через getValues: в
                          // field он остаётся тем, что был на последнем
                          // рендере useFieldArray, а не тем, что набрали.
                          update(
                            index,
                            emptyQuestion(
                              event.target.value as QuestionType,
                              getValues(`questions.${index}.text`),
                            ),
                          );
                        }}
                      >
                        {QUESTION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {QUESTION_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <AnswerEditor index={index} type={field.type} />
                  </div>
                </div>
              </Card>
            );
          })}

          <Button
            variant="secondary"
            fullWidth
            disabled={fields.length >= MAX_QUESTIONS}
            onClick={() => append(emptyQuestion('BOOLEAN'))}
          >
            Add question
          </Button>
        </section>

        {submitError && (
          <p className={styles.formError} role="alert">
            {submitError}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create quiz'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
