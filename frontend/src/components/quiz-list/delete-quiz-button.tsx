"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui";
import { ApiError } from "@/services/http";
import { deleteQuiz } from "@/services/quizzes";

import styles from "./delete-quiz-button.module.css";

type DeleteQuizButtonProps = {
  quizId: string;
  quizTitle: string;
};

export function DeleteQuizButton({ quizId, quizTitle }: DeleteQuizButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Delete quiz "${quizTitle}"? This cannot be undone.`)) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteQuiz(quizId);
      // refresh перерисовывает Server Component списка без полной перезагрузки
      startTransition(() => router.refresh());
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Failed to delete the quiz");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        iconOnly
        className={styles.button}
        aria-label={`Delete quiz "${quizTitle}"`}
        disabled={isDeleting || isPending}
        onClick={handleDelete}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      </Button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
