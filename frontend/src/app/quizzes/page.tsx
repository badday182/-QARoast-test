import { QuizList } from "@/components/quiz-list/quiz-list";
import { ButtonLink, Card } from "@/components/ui";
import { ApiError } from "@/services/http";
import { fetchQuizzes, type QuizListItem } from "@/services/quizzes";

import styles from "./page.module.css";

export const metadata = {
  title: "Quizzes — Quiz Builder",
};

export default async function QuizzesPage() {
  let quizzes: QuizListItem[] | null = null;
  let error: string | null = null;

  try {
    quizzes = await fetchQuizzes();
  } catch (cause) {
    error =
      cause instanceof ApiError && cause.isOffline
        ? "The API is unreachable. Start the backend on port 4000 and reload the page."
        : "Could not load the quizzes. Please try again.";
  }

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quizzes</h1>
          <p className={styles.subtitle}>Browse the quizzes you have created.</p>
        </div>
        <ButtonLink href="/create" fullWidth>
          New quiz
        </ButtonLink>
      </header>

      {error ? (
        <Card as="section" className={styles.error}>
          <p className={styles.errorTitle}>Something went wrong</p>
          <p className={styles.errorText}>{error}</p>
        </Card>
      ) : (
        <QuizList quizzes={quizzes ?? []} />
      )}
    </main>
  );
}
