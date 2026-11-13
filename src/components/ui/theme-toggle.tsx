"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "event-roll-theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

/**
 * Switches between the ink theme and the paper theme.
 *
 * The attribute lives on `<html>` and is applied before first paint by the
 * inline script in the root layout, so the page never flashes the wrong theme.
 * The DOM is the single source of truth: this component reads it through
 * `useSyncExternalStore` and writes the next value.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the theme still applies for this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      className={
        className ??
        "inline-flex h-9 items-center rounded-sm border border-stone-800 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400 transition hover:border-stone-600 hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
      }
    >
      {theme === "dark" ? "Claro" : "Oscuro"}
    </button>
  );
}
