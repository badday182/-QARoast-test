import { CheckIcon } from '@/components/ui';
import { cx } from '@/lib/cx';
import type { QuizDetailQuestion } from '@/services/quizzes';

import styles from './question-answer.module.css';

type QuestionAnswerProps = {
  question: QuizDetailQuestion;
};

const NOT_SET = '—';

function singleAnswer(question: QuizDetailQuestion): string {
  if (question.type === 'BOOLEAN') {
    if (question.correctBoolean === null) return NOT_SET;
    return question.correctBoolean ? 'True' : 'False';
  }

  return question.correctText ?? NOT_SET;
}

/**
 * Read-only рендер відповіді. Тип запитання визначає, яке поле заповнене —
 * решта приходять null/порожніми (див. модель даних у CLAUDE.md).
 */
export function QuestionAnswer({ question }: QuestionAnswerProps) {
  if (question.type === 'CHECKBOX') {
    return (
      <div className={styles.answer}>
        <p className={styles.label}>Options</p>
        <ul className={styles.options}>
          {question.options.map((option) => (
            <li
              key={option.id}
              className={cx(styles.option, option.isCorrect && styles.correct)}
            >
              <span className={styles.marker}>
                {option.isCorrect && <CheckIcon />}
              </span>
              <span className={styles.optionText}>{option.text}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.answer}>
      <p className={styles.label}>Correct answer</p>
      <p className={styles.value}>{singleAnswer(question)}</p>
    </div>
  );
}
