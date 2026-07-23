import { useCallback, useEffect, useState } from "react";

function readDraft(key: string): string {
  try {
    return globalThis.localStorage?.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeDraft(key: string, value: string): void {
  try {
    if (value) globalThis.localStorage?.setItem(key, value);
    else globalThis.localStorage?.removeItem(key);
  } catch {
    // Draft persistence is best-effort when storage is unavailable.
  }
}

/** The product supplies a fully namespaced key, preventing cross-product collisions. */
export function useChatDraft(key: string) {
  const [value, setState] = useState(() => readDraft(key));
  useEffect(() => setState(readDraft(key)), [key]);
  const setValue = useCallback((next: string) => {
    setState(next);
    writeDraft(key, next);
  }, [key]);
  const clear = useCallback(() => {
    setState("");
    writeDraft(key, "");
  }, [key]);
  return { value, setValue, clear } as const;
}
