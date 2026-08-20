import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './field.module.css';

type FieldProps = {
  label: string;
  /** id контролу всередині. З нього ж будуються id підказки та помилки. */
  htmlFor: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

/** id описів поля — контрол має посилатися на них через aria-describedby. */
export function fieldHintId(htmlFor: string): string {
  return `${htmlFor}-hint`;
}

export function fieldErrorId(htmlFor: string): string {
  return `${htmlFor}-error`;
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
  error,
  required = false,
  className,
}: FieldProps) {
  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' *'}
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={fieldHintId(htmlFor)} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={fieldErrorId(htmlFor)} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
