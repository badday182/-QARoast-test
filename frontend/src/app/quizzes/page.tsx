import { QuizList } from '@/components/quiz-list/quiz-list/quiz-list';
import { ButtonLink, Notice } from '@/components/ui';
import { ApiError } from '@/services/http';
import { fetchQuizzes, type QuizListItem } from '@/services/quizzes';

import styles from './page.module.css';

export const metadata = {
  title: 'Quizzes — Quiz Builder',
};

export default async function QuizzesPage() {
  let quizzes: QuizListItem[] = [];
  let error: string | null = null;

  try {
    quizzes = await fetchQuizzes();
  } catch (cause) {
    error =
      cause instanceof ApiError && cause.isOffline
        ? 'The API is unreachable. Start the backend on port 4000 and reload the page.'
        : 'Could not load the quizzes. Please try again.';
  }

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quizzes</h1>
          <p className={styles.subtitle}>
            Browse the quizzes you have created.
          </p>
        </div>
        <ButtonLink href="/create" fullWidth>
          New quiz
        </ButtonLink>
      </header>

      {error ? (
        <Notice title="Something went wrong" tone="error">
          {error}
        </Notice>
      ) : (
        <QuizList quizzes={quizzes} />
      )}
    </main>
  );
}
