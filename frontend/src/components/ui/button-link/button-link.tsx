import Link from 'next/link';
import type { ComponentPropsWithRef } from 'react';

import { cx } from '@/lib/cx';

import buttonStyles from '../button/button.module.css';

type ButtonLinkProps = ComponentPropsWithRef<typeof Link> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Во всю ширину на мобилке, по содержимому от 768px. */
  fullWidth?: boolean;
};

/**
 * Ссылка в оформлении кнопки. Нужна, чтобы не вкладывать <button> в <a> —
 * это невалидная разметка и ломает навигацию с клавиатуры.
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
