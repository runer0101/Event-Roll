"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One presentational modal shell: overlay, panel, title, optional description
 * and close button. It owns the shared a11y contract (dialog role, labelled by
 * the title, focus moved into the panel and restored on close) so call sites
 * only decide their content, their width and whether they can be dismissed.
 *
 * `dismissible={false}` disables Escape, the backdrop and the close button, so
 * a dialog that must survive a pending action cannot be dismissed by accident.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  eyebrow,
  children,
  dismissible = true,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Small label rendered above the title. */
  eyebrow?: ReactNode;
  children: ReactNode;
  dismissible?: boolean;
  /** Panel max-width utility, e.g. "max-w-2xl". */
  maxWidth?: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const panel = panelRef.current;
    // A child with `autoFocus` wins over the panel itself, which is still focus
    // inside the dialog, so only focus the panel when nothing else did.
    if (panel && !panel.contains(document.activeElement)) panel.focus();
    return () => {
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dismissible) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "modal-in max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl focus:outline-none",
          maxWidth,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow != null && <p className="eyebrow">{eyebrow}</p>}
            <h2
              id={titleId}
              className={cn(
                "font-display text-2xl font-medium text-stone-50",
                eyebrow != null && "mt-2",
              )}
            >
              {title}
            </h2>
            {description != null && (
              <p className="mt-1 text-sm text-stone-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            className="rounded-lg p-1 text-stone-500 transition hover:bg-stone-800 hover:text-stone-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
