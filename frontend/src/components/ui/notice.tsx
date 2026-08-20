import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import { Card } from './card';
import styles from './notice.module.css';

type NoticeProps = {
  title: string;
  tone?: 'info' | 'error';
  children?: ReactNode;
  className?: string;
};

/** Карточка-состояние: пустой список, ошибка запроса, «ничего не найдено». */
export function Notice({
  title,
  tone = 'info',
  children,
  className,
}: NoticeProps) {
  return (
    <Card
      as="section"
      className={cx(styles.notice, tone === 'error' && styles.error, className)}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <p className={styles.title}>{title}</p>
      {children && <div className={styles.text}>{children}</div>}
    </Card>
  );
}
