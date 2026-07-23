import { useCallback, useEffect } from "react";

export type GuardedAction = (action: () => void) => boolean;

/**
 * Protects dirty browser state and returns one confirmation gate for in-app
 * dismissal/navigation actions. Products own the localized confirmation copy
 * and any router-specific blocker integration.
 */
export function useUnsavedChangesGuard(
  dirty: boolean,
  message: string,
): GuardedAction {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return useCallback(
    (action: () => void) => {
      if (dirty && !window.confirm(message)) return false;
      action();
      return true;
    },
    [dirty, message],
  );
}
