import { ButtonLink, Notice } from '@/components/ui';
import type { QuizListItem } from '@/services/quizzes';

import { QuizCard } from './quiz-card';
import styles from './quiz-list.module.css';

type QuizListProps = {
  quizzes: QuizListItem[];
};

export function QuizList({ quizzes }: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <Notice title="No quizzes yet">
        <p>
          Create your first quiz — add a title and as many questions as you
          need.
        </p>
        <ButtonLink href="/create" variant="secondary">
          Create a quiz
        </ButtonLink>
      </Notice>
    );
  }

  return (
    <ul className={styles.grid}>
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </ul>
  );
}
