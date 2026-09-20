export type TextDirection = "ltr" | "rtl";

export interface LocaleDefinition<Id extends string = string> {
  id: Id;
  label: string;
  htmlLang?: string;
  direction?: TextDirection;
  fallback?: Id | readonly Id[];
}

export type TranslationPrimitive = string | number | boolean | Date | null | undefined;
export type TranslationValues = Readonly<Record<string, TranslationPrimitive>>;
export type TranslationMessage = string | ((values: TranslationValues) => string);
export type TranslationCatalog<Key extends string> = Partial<Record<Key, TranslationMessage>>;
export type TranslationCatalogs<Locale extends string, Key extends string> = Partial<
  Record<Locale, TranslationCatalog<Key>>
>;

export interface TranslateOptions {
  values?: TranslationValues;
  defaultMessage?: string;
}

export interface TranslationSource<Locale extends string, Key extends string> {
  locale: Locale;
  defaultLocale: Locale;
  locales: readonly LocaleDefinition<Locale>[];
  catalogs: TranslationCatalogs<Locale, Key>;
}

function canonicalLocale(locale: string): string | undefined {
  try {
    return Intl.getCanonicalLocales(locale)[0]?.toLowerCase();
  } catch {
    return undefined;
  }
}

function localeLanguage(locale: string): string | undefined {
  try {
    return new Intl.Locale(locale).language.toLowerCase();
  } catch {
    return undefined;
  }
}

export function resolveLocale<Locale extends string>(
  preferences: string | readonly string[] | null | undefined,
  locales: readonly LocaleDefinition<Locale>[],
  defaultLocale: Locale,
): Locale {
  const preferred = typeof preferences === "string" ? [preferences] : preferences ?? [];
  const canonicalDefinitions = locales.map((definition) => ({
    definition,
    canonical: canonicalLocale(definition.id),
    htmlCanonical: canonicalLocale(definition.htmlLang ?? definition.id),
    language: localeLanguage(definition.htmlLang ?? definition.id),
  }));

  for (const preference of preferred) {
    const canonical = canonicalLocale(preference);
    if (!canonical) continue;
    const exact = canonicalDefinitions.find(
      ({ canonical: id, htmlCanonical }) => id === canonical || htmlCanonical === canonical,
    );
    if (exact) return exact.definition.id;

    const language = localeLanguage(preference);
    const sameLanguage = canonicalDefinitions.find((candidate) => candidate.language === language);
    if (sameLanguage) return sameLanguage.definition.id;
  }

  return locales.some(({ id }) => id === defaultLocale)
    ? defaultLocale
    : (locales[0]?.id ?? defaultLocale);
}

export function localeFallbackChain<Locale extends string>(
  locale: Locale,
  locales: readonly LocaleDefinition<Locale>[],
  defaultLocale: Locale,
): readonly Locale[] {
  const definitions = new Map(locales.map((definition) => [definition.id, definition]));
  const result: Locale[] = [];
  const visiting = new Set<Locale>();

  const visit = (id: Locale) => {
    if (visiting.has(id) || result.includes(id) || !definitions.has(id)) return;
    visiting.add(id);
    result.push(id);
    const fallback = definitions.get(id)?.fallback;
    const next = typeof fallback === "string" ? [fallback] : fallback ?? [];
    for (const candidate of next) visit(candidate);
    visiting.delete(id);
  };

  visit(locale);
  visit(defaultLocale);
  return result;
}

export function interpolate(message: string, values: TranslationValues = {}): string {
  return message.replace(/\{([A-Za-z0-9_.-]+)\}/g, (placeholder, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return placeholder;
    return value instanceof Date ? value.toISOString() : String(value);
  });
}

export function translate<Locale extends string, Key extends string>(
  source: TranslationSource<Locale, Key>,
  key: Key,
  options: TranslateOptions = {},
): string {
  for (const locale of localeFallbackChain(source.locale, source.locales, source.defaultLocale)) {
    const message = source.catalogs[locale]?.[key];
    if (typeof message === "function") return message(options.values ?? {});
    if (typeof message === "string") return interpolate(message, options.values);
  }
  return interpolate(options.defaultMessage ?? key, options.values);
}

export type PluralForms = Readonly<
  Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }
>;

export function selectPlural(
  locale: string,
  count: number,
  forms: PluralForms,
  options?: Intl.PluralRulesOptions,
): string {
  const category = new Intl.PluralRules(locale, options).select(count);
  return interpolate(forms[category] ?? forms.other, { count });
}

export function htmlLanguageOf<Locale extends string>(
  locale: Locale,
  locales: readonly LocaleDefinition<Locale>[],
): string {
  const definition = locales.find(({ id }) => id === locale);
  return definition?.htmlLang ?? definition?.id ?? locale;
}

export function directionOf<Locale extends string>(
  locale: Locale,
  locales: readonly LocaleDefinition<Locale>[],
): TextDirection {
  return locales.find(({ id }) => id === locale)?.direction ?? "ltr";
}
