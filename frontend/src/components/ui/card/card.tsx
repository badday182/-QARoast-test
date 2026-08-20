import type { ElementType, HTMLAttributes } from 'react';

import { cx } from '@/lib/cx';

import styles from './card.module.css';

/** Усі допустимі теги розділяють один і той самий набір HTML-атрибутів. */
type CardTag = 'div' | 'article' | 'section' | 'li';

type CardProps = HTMLAttributes<HTMLElement> & {
  /** Семантичний тег: article для картки у списку, section — для блока. */
  as?: CardTag;
  /** Підсвічування на hover — для карток, що ведуть на іншу сторінку. */
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
