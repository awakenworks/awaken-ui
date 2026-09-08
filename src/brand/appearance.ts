export type AppearancePreference = "system" | "light" | "dark";
export interface AppearanceSnapshot {
  readonly preference: AppearancePreference;
  readonly mode: "light" | "dark";
}
export interface AppearanceOptions {
  /** Read only during first initialization; removed after successful migration. */
  readonly legacyStorageKeys?: readonly string[];
}
export interface AppearanceController {
  readonly getSnapshot: () => AppearanceSnapshot;
  readonly subscribe: (listener: () => void) => () => void;
  readonly setPreference: (preference: AppearancePreference) => void;
}

/** One document-lifetime owner. Self-contained so the prepaint script executes
 * exactly this implementation, without a second handwritten bootstrap policy. */
export function initializeAppearance(
  options: AppearanceOptions = {},
  host: Window = window,
): AppearanceController {
  const owner = host as Window & { __awakenAppearance?: AppearanceController };
  if (owner.__awakenAppearance) return owner.__awakenAppearance;
  const key = "awaken.theme";
  const root = host.document.documentElement;
  const media = host.matchMedia?.("(prefers-color-scheme: dark)");
  const listeners = new Set<() => void>();
  const valid = (value: unknown): value is AppearancePreference =>
    value === "system" || value === "light" || value === "dark";
  const read = (): AppearancePreference => {
    try {
      const value = host.localStorage.getItem(key);
      if (valid(value)) return value;
      for (const legacy of options.legacyStorageKeys ?? []) {
        const previous = host.localStorage.getItem(legacy);
        if (!valid(previous)) continue;
        // Preserve an existing preference even if quota blocks migration.
        try {
          host.localStorage.setItem(key, previous);
          host.localStorage.removeItem(legacy);
        } catch { /* The old value remains recoverable on the next load. */ }
        return previous;
      }
    } catch { /* Storage may be disabled; system mode still works. */ }
    return "system";
  };
  const resolve = (preference: AppearancePreference): AppearanceSnapshot => ({
    preference,
    mode: preference === "system" ? (media?.matches ? "dark" : "light") : preference,
  });
  let snapshot = resolve(read());
  const apply = () => {
    root.dataset.theme = snapshot.mode;
    root.dataset.appearance = snapshot.preference;
    root.style.colorScheme = snapshot.mode;
    for (const control of host.document.querySelectorAll<HTMLSelectElement>("select[data-appearance-select]")) {
      control.value = snapshot.preference;
    }
  };
  const update = (preference: AppearancePreference) => {
    const next = resolve(preference);
    if (next.preference === snapshot.preference && next.mode === snapshot.mode) return;
    snapshot = next;
    apply();
    for (const listener of listeners) listener();
  };
  const controller: AppearanceController = {
    getSnapshot: () => snapshot,
    subscribe: (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    setPreference: (preference) => {
      if (!valid(preference)) throw new Error("Unknown appearance preference");
      try { host.localStorage.setItem(key, preference); } catch { /* Keep the live selection. */ }
      update(preference);
    },
  };
  owner.__awakenAppearance = controller;
  media?.addEventListener("change", () => {
    if (snapshot.preference === "system") update("system");
  });
  host.addEventListener("storage", (event) => {
    // Only the canonical preference is live. Legacy keys never become a second store.
    let local: Storage;
    try { local = host.localStorage; } catch { return; }
    if (event.storageArea !== local || (event.key !== key && event.key !== null)) return;
    update(valid(event.newValue) ? event.newValue : "system");
  });
  host.document.addEventListener("change", (event) => {
    const control = event.target as HTMLSelectElement | null;
    if (control?.matches?.("select[data-appearance-select]") && valid(control.value)) {
      controller.setPreference(control.value);
    }
  });
  host.document.addEventListener("DOMContentLoaded", apply, { once: true });
  apply();
  return controller;
}

/** Safe inline source for Astro or a build adapter. No domain or React dependency. */
export function appearanceBootstrap(options: AppearanceOptions = {}): string {
  return `(${initializeAppearance.toString()})(${JSON.stringify(options).replaceAll("<", "\\u003c")});`;
}
