import Link from "next/link";

import { Card } from "@/components/ui";
import type { QuizListItem } from "@/services/quizzes";

import { QuizCard } from "./quiz-card";
import styles from "./quiz-list.module.css";

type QuizListProps = {
  quizzes: QuizListItem[];
};

export function QuizList({ quizzes }: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <Card as="section" className={styles.empty}>
        <p className={styles.emptyTitle}>No quizzes yet</p>
        <p className={styles.emptyText}>
          Create your first quiz — add a title and as many questions as you need.
        </p>
        <Link href="/create">Create a quiz</Link>
      </Card>
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
