import { appearanceBootstrap, type AppearanceOptions } from "./appearance.js";
import { renderAdaptiveFaviconSvg } from "./marks.js";

/** Build/dev adapter with Vite's structural hook contract and no runtime dependency. */
export function brandFaviconPlugin(mark: string) {
  const href = `data:image/svg+xml,${encodeURIComponent(renderAdaptiveFaviconSvg(mark))}`;
  return {
    name: "awaken-brand-favicon",
    transformIndexHtml() {
      return [{
        tag: "link",
        attrs: { rel: "icon", type: "image/svg+xml", href },
        injectTo: "head" as const,
      }];
    },
  };
}

/** Install before paint; product identity is independent of light/dark preference. */
export function brandAppearancePlugin(brand: string, options: AppearanceOptions = {}) {
  return {
    name: "awaken-brand-appearance",
    transformIndexHtml: {
      order: "pre" as const,
      handler() {
        return [{
          tag: "script",
          children: `document.documentElement.dataset.brand=${JSON.stringify(brand).replaceAll("<", "\\u003c")};${appearanceBootstrap(options)}`,
          injectTo: "head-prepend" as const,
        }];
      },
    },
  };
}
