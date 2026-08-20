import Link from 'next/link';

import { QuizForm } from '@/components/quiz-form/quiz-form/quiz-form';

import styles from './page.module.css';

export const metadata = {
  title: 'New quiz — Quiz Builder',
};

export default function CreateQuizPage() {
  return (
    <main>
      <header className={styles.header}>
        <Link href="/quizzes" className={styles.back}>
          ← Back to quizzes
        </Link>
        <h1 className={styles.title}>New quiz</h1>
        <p className={styles.subtitle}>
          Give the quiz a title and add at least one question.
        </p>
      </header>

      <QuizForm />
    </main>
  );
}
