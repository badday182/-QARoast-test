import Link from 'next/link';

import { Card } from '@/components/ui/card/card';
import type { QuizListItem } from '@/services/quizzes';

import { DeleteQuizButton } from '../delete-quiz-button/delete-quiz-button';
import styles from './quiz-card.module.css';

type QuizCardProps = {
  quiz: QuizListItem;
};

function pluralizeQuestions(count: number): string {
  return `${count} ${count === 1 ? 'question' : 'questions'}`;
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card as="li" interactive className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Link href={`/quizzes/${quiz.id}`} className={styles.titleLink}>
            {quiz.title}
          </Link>
        </h2>
        <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
      </div>

      <p className={styles.meta}>{pluralizeQuestions(quiz.questionCount)}</p>

      <p className={styles.footer}>
        <Link href={`/quizzes/${quiz.id}`}>View details</Link>
      </p>
    </Card>
  );
}
