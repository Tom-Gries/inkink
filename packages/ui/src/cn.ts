/**
 * Klassen-Utility (ohne Zusatzpaket).
 * Akzeptiert optionale Werte sowie fn(state) => string, wie es
 * Base UI in `className` anbietet.
 */
/**
 * Klassen-Utility (ohne Zusatzpaket).
 * Base UI bietet `className` teils als Callback (`(state) => string`) an;
 * solche Werte werden bewusst verworfen und nur echte Strings übernommen.
 */
export function cn(...classes: Array<unknown>): string {
  return classes
    .filter(
      (value): value is string => typeof value === 'string' && Boolean(value),
    )
    .join(' ')
}
