import { ButtonLink, Notice } from '@/components/ui';

export const metadata = {
  title: 'Quiz not found — Quiz Builder',
};

export default function QuizNotFound() {
  return (
    <main>
      <Notice title="Quiz not found">
        <p>This quiz does not exist any more — it may have been deleted.</p>
        <ButtonLink href="/quizzes" variant="secondary">
          Back to quizzes
        </ButtonLink>
      </Notice>
    </main>
  );
}
