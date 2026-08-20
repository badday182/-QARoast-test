import Link from 'next/link';
import { notFound } from 'next/navigation';

import { QuestionAnswer } from '@/components/quiz-detail/question-answer/question-answer';
import { Card, Notice } from '@/components/ui';
import { QUESTION_TYPE_LABELS } from '@/lib/question-types';
import { ApiError } from '@/services/http';
import { fetchQuiz, type QuizDetail } from '@/services/quizzes';

import styles from './page.module.css';

export const metadata = {
  title: 'Quiz — Quiz Builder',
};

type QuizDetailPageProps = {
  params: Promise<{ id: string }>;
};

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

/** notFound() бросает, поэтому наружу выходит либо квиз, либо текст ошибки. */
async function loadQuiz(
  id: string,
): Promise<{ quiz: QuizDetail } | { error: string }> {
  try {
    return { quiz: await fetchQuiz(id) };
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) {
      notFound();
    }

    return {
      error:
        cause instanceof ApiError && cause.isOffline
          ? 'The API is unreachable. Start the backend on port 4000 and reload the page.'
          : 'Could not load this quiz. Please try again.',
    };
  }
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { id } = await params;
  const result = await loadQuiz(id);

  if ('error' in result) {
    return (
      <main>
        <Link href="/quizzes" className={styles.back}>
          ← Back to quizzes
        </Link>
        <Notice title="Something went wrong" tone="error">
          {result.error}
        </Notice>
      </main>
    );
  }

  const { quiz } = result;
  const questionCount = quiz.questions.length;

  return (
    <main>
      <header className={styles.header}>
        <Link href="/quizzes" className={styles.back}>
          ← Back to quizzes
        </Link>
        <h1 className={styles.title}>{quiz.title}</h1>
        <p className={styles.meta}>
          {questionCount} {questionCount === 1 ? 'question' : 'questions'} ·
          Created {dateFormat.format(new Date(quiz.createdAt))}
        </p>
      </header>

      <ol className={styles.questions}>
        {quiz.questions.map((question, index) => (
          <Card as="li" key={question.id}>
            <div className={styles.questionHeader}>
              <p className={styles.number}>Question {index + 1}</p>
              <span className={styles.badge}>
                {QUESTION_TYPE_LABELS[question.type]}
              </span>
            </div>
            <p className={styles.text}>{question.text}</p>
            <QuestionAnswer question={question} />
          </Card>
        ))}
      </ol>
    </main>
  );
}
