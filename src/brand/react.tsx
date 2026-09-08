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
