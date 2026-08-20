import { cx } from '@/lib/cx';

import styles from './skeleton.module.css';

type SkeletonProps = {
  /** Будь-яка CSS-довжина: 100%, 12ch, clamp(...). */
  width?: string;
  height?: string;
  className?: string;
};

/** Заглушка контенту на час завантаження. Приховано від скринрідерів — статус дає батько. */
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
