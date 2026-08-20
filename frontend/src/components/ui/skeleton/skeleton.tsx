import { cx } from '@/lib/cx';

import styles from './skeleton.module.css';

type SkeletonProps = {
  /** Любая CSS-длина: 100%, 12ch, clamp(...). */
  width?: string;
  height?: string;
  className?: string;
};

/** Заглушка контента на время загрузки. Скрыта от скринридеров — статус даёт родитель. */
export function Skeleton({
  width = '100%',
  height = '1rem',
  className,
}: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, className)}
      style={{ display: 'block', width, height }}
      aria-hidden="true"
    />
  );
}
