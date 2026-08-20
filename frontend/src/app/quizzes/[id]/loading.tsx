import { Card, Skeleton } from '@/components/ui';

import styles from './loading.module.css';

const PLACEHOLDER_QUESTIONS = [0, 1, 2];

export default function QuizDetailLoading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the quiz…</span>

      <div className={styles.header}>
        <Skeleton width="min(20ch, 80%)" height="2rem" />
        <Skeleton width="min(24ch, 60%)" />
      </div>

      <div className={styles.questions}>
        {PLACEHOLDER_QUESTIONS.map((index) => (
          <Card key={index} className={styles.card}>
            <Skeleton width="30%" />
            <Skeleton width="85%" height="1.25rem" />
            <Skeleton width="50%" />
          </Card>
        ))}
      </div>
    </main>
  );
}
