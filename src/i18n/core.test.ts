import {
  directionOf,
  interpolate,
  localeFallbackChain,
  resolveLocale,
  selectPlural,
  translate,
  type LocaleDefinition,
} from "./core.js";

type Locale = "en" | "zh-Hans" | "ja" | "ar";
type Key = "greeting" | "fallback";

const locales: readonly LocaleDefinition<Locale>[] = [
  { id: "en", label: "English" },
  { id: "zh-Hans", label: "简体中文", fallback: "en" },
  { id: "ja", label: "日本語", fallback: "en" },
  { id: "ar", label: "العربية", direction: "rtl", fallback: "en" },
];

describe("i18n core", () => {
  // Cause/effect rules: exact BCP 47 input selects the exact admitted locale;
  // a regional browser tag selects the same-language locale; an unsupported or
  // malformed tag terminates at the admitted default rather than inventing an id.
  it("resolves arbitrary admitted locales without a two-language assumption", () => {
    expect(resolveLocale("ja", locales, "en")).toBe("ja");
    expect(resolveLocale("zh-SG", locales, "en")).toBe("zh-Hans");
    expect(resolveLocale(["fr-FR", "ar-EG"], locales, "en")).toBe("ar");
    expect(resolveLocale("not_a_locale", locales, "en")).toBe("en");
  });

  // Cause/effect rules: a present local message wins; a missing local message
  // traverses the declared parent once; a fallback cycle terminates; a missing
  // message everywhere exposes caller-owned default copy with interpolation.
  it("uses deterministic catalog fallbacks and terminal default copy", () => {
    expect(localeFallbackChain("ja", locales, "en")).toEqual(["ja", "en"]);
    const source: import("./core.js").TranslationSource<Locale, Key> = {
      locale: "ja" as const,
      defaultLocale: "en" as const,
      locales,
      catalogs: {
        en: { greeting: "Hello, {name}", fallback: "Available" },
        ja: { greeting: "こんにちは、{name}" },
      },
    };
    expect(translate(source, "greeting", { values: { name: "Aki" } })).toBe("こんにちは、Aki");
    expect(translate(source, "fallback")).toBe("Available");
    expect(translate(source, "missing" as Key, { defaultMessage: "Value {count}", values: { count: 2 } }))
      .toBe("Value 2");
    expect(interpolate("Keep {missing}", {})).toBe("Keep {missing}");
  });

  // Cause/effect rules: plural category comes from Intl for the active locale;
  // an absent category uses `other`; declared RTL direction projects as RTL and
  // every other admitted locale defaults to LTR.
  it("selects locale plurals and declared writing direction", () => {
    expect(selectPlural("en", 1, { one: "{count} item", other: "{count} items" })).toBe("1 item");
    expect(selectPlural("en", 2, { one: "{count} item", other: "{count} items" })).toBe("2 items");
    expect(directionOf("ar", locales)).toBe("rtl");
    expect(directionOf("ja", locales)).toBe("ltr");
  });
});
