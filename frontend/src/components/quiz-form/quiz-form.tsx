"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button, Card, Field, TextInput, fieldErrorId } from "@/components/ui";
import {
  createQuizSchema,
  type CreateQuizInput,
  type QuestionInput,
  type QuestionType,
} from "@/lib/validation/quiz.schema";
import { ApiError } from "@/services/http";
import { createQuiz } from "@/services/quizzes";

import styles from "./quiz-form.module.css";

const MAX_QUESTIONS = 50;

const TYPE_LABELS: Record<QuestionType, string> = {
  BOOLEAN: "True / False",
  INPUT: "Short answer",
  CHECKBOX: "Multiple choice",
};

/**
 * Заготовка вопроса под конкретный тип. У каждого типа своё поле ответа,
 * поэтому при смене типа объект заменяется целиком, а не патчится.
 */
function emptyQuestion(type: QuestionType, text = ""): QuestionInput {
  switch (type) {
    case "BOOLEAN":
      return { type, text, correctBoolean: true };
    case "INPUT":
      return { type, text, correctText: "" };
    case "CHECKBOX":
      return {
        type,
        text,
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      };
  }
}

export function QuizForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuizInput>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      questions: [emptyQuestion("BOOLEAN")],
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: "questions" });

  async function onSubmit(values: CreateQuizInput) {
    setSubmitError(null);

    try {
      const { id } = await createQuiz(values);
      router.push(`/quizzes/${id}`);
    } catch (cause) {
      setSubmitError(
        cause instanceof ApiError && cause.isOffline
          ? "The API is unreachable. Start the backend on port 4000 and try again."
          : cause instanceof ApiError
            ? cause.message
            : "Could not create the quiz. Please try again.",
      );
    }
  }

  const titleError = errors.title?.message;
  // Ошибка самого массива (пусто / больше 50), а не отдельного вопроса
  const questionsError = errors.questions?.root?.message ?? errors.questions?.message;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label="Quiz title" htmlFor="quiz-title" required error={titleError}>
        <TextInput
          id="quiz-title"
          placeholder="JavaScript Fundamentals"
          invalid={Boolean(titleError)}
          aria-describedby={titleError ? fieldErrorId("quiz-title") : undefined}
          {...register("title")}
        />
      </Field>

      <fieldset className={styles.questions}>
        <div className={styles.questionsHeader}>
          <legend className={styles.legend}>Questions</legend>
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
            <Card as="section" key={field.id}>
              <div className={styles.questionHeader}>
                <p className={styles.questionNumber}>Question {index + 1}</p>
                <Button
                  variant="ghost"
                  iconOnly
                  aria-label={`Remove question ${index + 1}`}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <svg
                    className={styles.removeIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </Button>
              </div>

              <div className={styles.questionBody}>
                <Field label="Question text" htmlFor={textId} required error={textError}>
                  <TextInput
                    id={textId}
                    placeholder="What does NaN stand for?"
                    invalid={Boolean(textError)}
                    aria-describedby={textError ? fieldErrorId(textId) : undefined}
                    {...register(`questions.${index}.text` as const)}
                  />
                </Field>

                <Field label="Answer type" htmlFor={typeId}>
                  <select
                    id={typeId}
                    className={styles.select}
                    value={field.type}
                    onChange={(event) => {
                      // Замена вопроса целиком: поля ответа у типов не пересекаются
                      update(index, emptyQuestion(event.target.value as QuestionType, field.text));
                    }}
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Card>
          );
        })}

        <Button
          variant="secondary"
          fullWidth
          disabled={fields.length >= MAX_QUESTIONS}
          onClick={() => append(emptyQuestion("BOOLEAN"))}
        >
          Add question
        </Button>
      </fieldset>

      {submitError && (
        <p className={styles.formError} role="alert">
          {submitError}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create quiz"}
        </Button>
      </div>
    </form>
  );
}
