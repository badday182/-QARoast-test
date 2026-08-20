'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button, TrashIcon } from '@/components/ui';
import { ApiError } from '@/services/http';
import { deleteQuiz } from '@/services/quizzes';

import styles from './delete-quiz-button.module.css';

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
      // refresh перемальовує Server Component списку без повного перезавантаження
      startTransition(() => router.refresh());
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : 'Failed to delete the quiz',
      );
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
        <TrashIcon />
      </Button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
