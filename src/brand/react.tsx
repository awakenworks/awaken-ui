import { useSyncExternalStore, type SelectHTMLAttributes } from "react";
import { initializeAppearance, type AppearancePreference, type AppearanceSnapshot } from "./appearance.js";
import type { CSSProperties, SVGProps } from "react";
import { brandMarkBody, brandMarkPalette, canonicalBrandMark, type BrandMarkScheme } from "./marks.js";

export type BrandMarkProps = Omit<SVGProps<SVGSVGElement>, "children" | "dangerouslySetInnerHTML"> & {
  readonly mark: string;
  readonly scheme?: BrandMarkScheme | "auto";
  readonly label?: string;
};

/** Optional Awaken identity renderer. Geometry is package-owned, never user HTML. */
export function BrandMark({ mark, scheme = "auto", label, className, style, ...props }: BrandMarkProps) {
  const canonical = canonicalBrandMark(mark);
  const light = brandMarkPalette(canonical, scheme === "auto" ? "on-light" : scheme);
  const dark = brandMarkPalette(canonical, scheme === "auto" ? "on-dark" : scheme);
  return <svg
    {...props}
    className={["aw-brand-mark", className].filter(Boolean).join(" ")}
    data-brand-mark={canonical}
    data-mark-scheme={scheme}
    viewBox="0 0 32 32"
    fill="none"
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
    style={{
      "--mark-light-primary": light.primary,
      "--mark-light-decision": light.decision,
      "--mark-dark-primary": dark.primary,
      "--mark-dark-decision": dark.decision,
      ...style,
    } as CSSProperties}
    dangerouslySetInnerHTML={{ __html: brandMarkBody(canonical) }}
  />;
}

const serverAppearance: AppearanceSnapshot = { preference: "system", mode: "light" };
const serverSnapshot = () => serverAppearance;
const noSubscribe = () => () => {};

/** React is a subscriber to the prepaint controller, never a second state owner. */
export function useAppearance() {
  const controller = typeof window === "undefined" ? undefined : initializeAppearance();
  const snapshot = useSyncExternalStore(
    controller?.subscribe ?? noSubscribe,
    controller?.getSnapshot ?? serverSnapshot,
    serverSnapshot,
  );
  return { ...snapshot, setPreference: controller?.setPreference };
}

type AppearanceSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "defaultValue" | "onChange" | "children" | "aria-label"> & {
  readonly labels: Readonly<Record<AppearancePreference | "label", string>>;
};

/** Native select keeps the three choices keyboard accessible; copy is caller-owned. */
export function AppearanceSelect({ labels, className, ...props }: AppearanceSelectProps) {
  const appearance = useAppearance();
  return <select {...props}
    className={["ui-input", "aw-appearance-select", className].filter(Boolean).join(" ")}
    aria-label={labels.label}
    value={appearance.preference}
    onChange={(event) => appearance.setPreference?.(event.target.value as AppearancePreference)}
  >
    <option value="system">{labels.system}</option>
    <option value="light">{labels.light}</option>
    <option value="dark">{labels.dark}</option>
  </select>;
}
