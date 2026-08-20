import Link from 'next/link';
import type { ComponentPropsWithRef } from 'react';

import { cx } from '@/lib/cx';

import buttonStyles from '../button/button.module.css';

type ButtonLinkProps = ComponentPropsWithRef<typeof Link> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  /** На всю ширину на мобілці, по вмісту від 768px. */
  fullWidth?: boolean;
};

/**
 * Посилання в оформленні кнопки. Потрібне, щоб не вкладати <button> в <a> —
 * це невалідна розмітка і ламає навігацію з клавіатури.
 */
export function ButtonLink({
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cx(
        buttonStyles.button,
        buttonStyles[variant],
        fullWidth && buttonStyles.fullWidth,
        className,
      )}
      {...props}
    />
  );
}
