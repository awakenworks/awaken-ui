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
