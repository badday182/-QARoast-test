import type { ComponentPropsWithRef } from "react";

import { cx } from "@/lib/cx";

import styles from "./text-input.module.css";

type TextInputProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  /** Подсвечивает поле и проставляет aria-invalid. */
  invalid?: boolean;
};

export function TextInput({ invalid = false, className, ...props }: TextInputProps) {
  return (
    <input
      type="text"
      aria-invalid={invalid || undefined}
      className={cx(styles.input, invalid && styles.invalid, className)}
      {...props}
    />
  );
}
