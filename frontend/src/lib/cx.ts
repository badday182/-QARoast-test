/** Склейка классов CSS Modules: cx(styles.base, isActive && styles.active). */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
