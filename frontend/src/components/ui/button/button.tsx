import type { ComponentPropsWithRef } from 'react';

import { cx } from '@/lib/cx';

import styles from './button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  /** На всю ширину на мобілці, по вмісту від 768px. */
  fullWidth?: boolean;
  /** Квадратна кнопка під одну іконку — вимагає aria-label. */
  iconOnly?: boolean;
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  iconOnly = false,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        iconOnly && styles.iconOnly,
        className,
      )}
      {...props}
    />
  );
}
