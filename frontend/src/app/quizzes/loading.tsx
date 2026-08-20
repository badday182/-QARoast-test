import { Card, Skeleton } from '@/components/ui';

import styles from './loading.module.css';

const PLACEHOLDER_CARDS = [0, 1, 2];

export default function QuizzesLoading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading quizzes…</span>

      <div className={styles.header}>
        <Skeleton width="min(14ch, 60%)" height="2rem" />
        <Skeleton width="min(32ch, 90%)" />
      </div>

      <div className={styles.grid}>
        {PLACEHOLDER_CARDS.map((index) => (
          <Card key={index} className={styles.card}>
            <Skeleton width="70%" height="1.25rem" />
            <Skeleton width="40%" />
            <Skeleton width="30%" />
          </Card>
        ))}
      </div>
    </main>
  );
}
