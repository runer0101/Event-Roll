import { useState, useTransition } from "react";

/** What a server action answers: an error message, or nothing worth reading. */
type ActionOutcome = { error?: string } | void;

type RunOptions = {
  /** Runs only when the action finishes without reporting an error. */
  onSuccess?: () => void;
};

/**
 * One pending flag and one error slot for the optimistic screens: the action
 * runs inside a transition, its `error` becomes the visible message, and the
 * caller's follow-up only runs after a clean answer.
 */
export function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionOutcome>, options?: RunOptions) {
    // A retry must not keep showing the message of the previous attempt.
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      options?.onSuccess?.();
    });
  }

  function reset() {
    setError(null);
  }

  return { run, pending, error, reset };
}
