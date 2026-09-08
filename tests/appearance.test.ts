import { describe, expect, it, vi } from "vitest";
import { appearanceBootstrap, initializeAppearance } from "../src/brand/appearance.js";
import { brandAppearancePlugin } from "../src/brand/vite.js";

function browser({ dark = false, values = {}, blocked = false, quota = false }:
  { dark?: boolean; values?: Record<string, string>; blocked?: boolean; quota?: boolean } = {}) {
  const entries = new Map(Object.entries(values));
  const storage = {
    getItem: vi.fn((key: string) => { if (blocked) throw new Error("blocked"); return entries.get(key) ?? null; }),
    setItem: vi.fn((key: string, value: string) => { if (blocked || quota) throw new Error("quota"); entries.set(key, value); }),
    removeItem: vi.fn((key: string) => entries.delete(key)),
  };
  const media = Object.assign(new EventTarget(), { matches: dark });
  const host = Object.assign(new EventTarget(), {
    document: document.implementation.createHTMLDocument(),
    localStorage: storage,
    matchMedia: () => media,
  }) as unknown as Window;
  const system = (value: boolean) => { media.matches = value; media.dispatchEvent(new Event("change")); };
  const storageEvent = (key: string | null, value: string | null, area: unknown = storage) => {
    host.dispatchEvent(Object.assign(new Event("storage"), { key, newValue: value, storageArea: area }));
  };
  return { host, entries, storage, system, storageEvent };
}

// Cause/effect decision table (all persistence is origin-local):
// R1 valid stored explicit mode + either OS -> stored wins; OS change no effect.
// R2 absent/invalid/system + OS light/dark -> follow OS without writing a default.
// R3 explicit user choice -> DOM + subscribers + one canonical write; refresh retains.
// R4 legacy only -> migrate once; canonical wins if both exist; failed write retains legacy.
// R5 storage blocked/quota -> UI and system fallback work, preference stays in memory.
// R6 matching storage event -> update without echo write; unrelated area/key -> ignore.
// R7 prepaint then React/second initializer -> one controller, no duplicate listeners.
// R8 Astro native select + parsed/changed controls -> same controller, synced selection.
// Constraints: no API/account state; clear/invalid storage event restores system mode.
describe("single appearance owner", () => {
  it.each(["light", "dark"] as const)("R1/R2 resolves all stored values with OS %s", (mode) => {
    for (const stored of [undefined, "unknown", "system", "light", "dark"]) {
      const fixture = browser({ dark: mode === "dark", values: stored ? { "awaken.theme": stored } : {} });
      const owner = initializeAppearance({}, fixture.host);
      const explicit = stored === "light" || stored === "dark";
      expect(owner.getSnapshot()).toEqual({ preference: explicit ? stored : "system", mode: explicit ? stored : mode });
      fixture.system(mode !== "dark");
      expect(owner.getSnapshot().mode).toBe(explicit ? stored : mode === "dark" ? "light" : "dark");
      expect(fixture.storage.setItem).not.toHaveBeenCalled();
      expect(fixture.host.document.documentElement.style.colorScheme).toBe(owner.getSnapshot().mode);
    }
  });

  it("R3 changes once, notifies, persists, refreshes, and unsubscribes", () => {
    const fixture = browser();
    const owner = initializeAppearance({}, fixture.host);
    const listener = vi.fn();
    const stop = owner.subscribe(listener);
    owner.setPreference("dark");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(fixture.storage.setItem).toHaveBeenCalledExactlyOnceWith("awaken.theme", "dark");
    expect(fixture.host.document.documentElement.dataset).toMatchObject({ theme: "dark", appearance: "dark" });
    const refreshed = browser({ values: Object.fromEntries(fixture.entries) });
    expect(initializeAppearance({}, refreshed.host).getSnapshot().mode).toBe("dark");
    stop();
    owner.setPreference("light");
    expect(listener).toHaveBeenCalledTimes(1);
    // JS consumers receive the same closed input validation as typed callers.
    // @ts-expect-error deliberate invalid boundary input
    expect(() => owner.setPreference("invalid")).toThrow("Unknown appearance preference");
  });

  it("R4 migrates a legacy value once and never replaces a canonical preference", () => {
    const fixture = browser({ values: { old: "dark" } });
    const owner = initializeAppearance({ legacyStorageKeys: ["old"] }, fixture.host);
    expect(owner.getSnapshot().mode).toBe("dark");
    expect(Object.fromEntries(fixture.entries)).toEqual({ "awaken.theme": "dark" });
    fixture.entries.set("old", "light");
    expect(initializeAppearance({ legacyStorageKeys: ["old"] }, fixture.host)).toBe(owner);
    expect(owner.getSnapshot().mode).toBe("dark");
    const canonical = browser({ values: { "awaken.theme": "system", old: "dark" } });
    expect(initializeAppearance({ legacyStorageKeys: ["old"] }, canonical.host).getSnapshot().preference).toBe("system");
    expect(canonical.storage.setItem).not.toHaveBeenCalled();
  });

  it("R4/R5 retains legacy on quota failure and supports blocked storage", () => {
    const quota = browser({ quota: true, values: { old: "dark" } });
    expect(initializeAppearance({ legacyStorageKeys: ["old"] }, quota.host).getSnapshot().mode).toBe("dark");
    expect(quota.entries.get("old")).toBe("dark");
    const blocked = browser({ blocked: true, dark: true });
    const owner = initializeAppearance({}, blocked.host);
    expect(owner.getSnapshot().mode).toBe("dark");
    owner.setPreference("light");
    expect(owner.getSnapshot()).toEqual({ preference: "light", mode: "light" });
    blocked.system(true);
    expect(owner.getSnapshot().mode).toBe("light");
  });

  it("R6 consumes only matching storage events without echo writes", () => {
    const fixture = browser({ dark: true });
    const owner = initializeAppearance({}, fixture.host);
    fixture.storageEvent("awaken.theme", "light");
    expect(owner.getSnapshot().mode).toBe("light");
    fixture.storageEvent("old", "dark");
    fixture.storageEvent("awaken.theme", "dark", {});
    expect(owner.getSnapshot().mode).toBe("light");
    fixture.storageEvent(null, null);
    expect(owner.getSnapshot()).toEqual({ preference: "system", mode: "dark" });
    expect(fixture.storage.setItem).not.toHaveBeenCalled();
  });

  it("R7 executes the exact serialized prepaint policy without external closures", () => {
    const fixture = browser({ dark: true });
    const script = brandAppearancePlugin("agents").transformIndexHtml.handler()[0]!;
    expect(script.injectTo).toBe("head-prepend");
    new Function("window", "document", script.children)(fixture.host, fixture.host.document);
    expect(fixture.host.document.documentElement.dataset).toMatchObject({ brand: "agents", theme: "dark" });
    const owner = initializeAppearance({}, fixture.host);
    expect(initializeAppearance({}, fixture.host)).toBe(owner);
    expect(appearanceBootstrap({ legacyStorageKeys: ["</script>"] })).not.toContain("</script>");
  });

  it("R8 synchronizes native controls after parsing and after a user changes one", () => {
    const fixture = browser({ values: { "awaken.theme": "dark" } });
    const owner = initializeAppearance({}, fixture.host);
    fixture.host.document.body.innerHTML = Array.from({ length: 2 }, () => `<select data-appearance-select><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>`).join("");
    fixture.host.document.dispatchEvent(new Event("DOMContentLoaded"));
    const controls = fixture.host.document.querySelectorAll("select");
    expect([...controls].map((control) => control.value)).toEqual(["dark", "dark"]);
    controls[0]!.value = "light";
    controls[0]!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(owner.getSnapshot().mode).toBe("light");
    expect(controls[1]!.value).toBe("light");
  });
});
