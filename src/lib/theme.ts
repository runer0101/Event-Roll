export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "event-roll-theme";

/**
 * Decides which theme a browser gets: the stored choice wins, then the system
 * preference, then ink. Kept pure and outside the component so the rule can be
 * tested without a DOM.
 */
export function resolveTheme(
  stored: string | null | undefined,
  prefersLight: boolean,
): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersLight ? "light" : "dark";
}
