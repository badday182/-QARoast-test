import type { ElementType, HTMLAttributes } from 'react';

import { cx } from '@/lib/cx';

import styles from './card.module.css';

/** Все допустимые теги делят один и тот же набор HTML-атрибутов. */
type CardTag = 'div' | 'article' | 'section' | 'li';

type CardProps = HTMLAttributes<HTMLElement> & {
  /** Семантический тег: article для карточки в списке, section — для блока. */
  as?: CardTag;
  /** Подсветка на hover — для карточек, ведущих на другую страницу. */
  interactive?: boolean;
};

export function Card({
  as = 'div',
  interactive = false,
  className,
  ...props
}: CardProps) {
  const Tag: ElementType = as;

  return (
    <Tag
      className={cx(styles.card, interactive && styles.interactive, className)}
      {...props}
    />
  );
}
