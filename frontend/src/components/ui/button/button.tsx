import type { ComponentPropsWithRef } from 'react';

import { cx } from '@/lib/cx';

import styles from './button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  /** Во всю ширину на мобилке, по содержимому от 768px. */
  fullWidth?: boolean;
  /** Квадратная кнопка под одну иконку — требует aria-label. */
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
