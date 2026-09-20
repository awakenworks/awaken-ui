import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  directionOf,
  htmlLanguageOf,
  resolveLocale,
  selectPlural,
  translate,
  type LocaleDefinition,
  type PluralForms,
  type TranslateOptions,
  type TranslationCatalogs,
} from "./core.js";

export interface I18nConfig<Locale extends string, Key extends string> {
  locales: readonly LocaleDefinition<Locale>[];
  defaultLocale: Locale;
  catalogs: TranslationCatalogs<Locale, Key>;
  storageKey: string;
}

export interface I18nProviderProps<Locale extends string> {
  children: ReactNode;
  initialLocale?: Locale;
}

export interface I18nContextValue<Locale extends string, Key extends string> {
  locale: Locale;
  localeDefinition: LocaleDefinition<Locale>;
  locales: readonly LocaleDefinition<Locale>[];
  setLocale: (locale: Locale) => void;
  t: (key: Key, options?: TranslateOptions) => string;
  plural: (count: number, forms: PluralForms, options?: Intl.PluralRulesOptions) => string;
  formatNumber: (value: number | bigint, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string;
  formatList: (value: Iterable<string>, options?: Intl.ListFormatOptions) => string;
  formatRelativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ) => string;
}

function storedLocale(storageKey: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(storageKey) ?? undefined;
  } catch {
    return undefined;
  }
}

function browserLocales(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  return navigator.languages.length > 0 ? navigator.languages : [navigator.language];
}

export function createI18n<Locale extends string, Key extends string>(
  config: I18nConfig<Locale, Key>,
) {
  if (config.locales.length === 0) throw new Error("createI18n requires at least one locale");
  if (!config.locales.some(({ id }) => id === config.defaultLocale)) {
    throw new Error("createI18n defaultLocale must be present in locales");
  }
  const duplicate = config.locales.find(
    ({ id }, index) => config.locales.findIndex((candidate) => candidate.id === id) !== index,
  );
  if (duplicate) throw new Error(`createI18n locale ids must be unique: ${duplicate.id}`);

  const Context = createContext<I18nContextValue<Locale, Key> | undefined>(undefined);

  function I18nProvider({ children, initialLocale }: I18nProviderProps<Locale>) {
    const [locale, updateLocale] = useState<Locale>(() =>
      resolveLocale(
        initialLocale ?? storedLocale(config.storageKey) ?? browserLocales(),
        config.locales,
        config.defaultLocale,
      ),
    );

    const setLocale = useCallback((next: Locale) => {
      const admitted = resolveLocale(next, config.locales, config.defaultLocale);
      if (admitted !== next) return;
      updateLocale(next);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(config.storageKey, next);
        } catch {
          // The live selection remains authoritative when browser storage is blocked.
        }
      }
    }, []);

    useEffect(() => {
      if (typeof document === "undefined") return;
      document.documentElement.lang = htmlLanguageOf(locale, config.locales);
      document.documentElement.dir = directionOf(locale, config.locales);
    }, [locale]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const onStorage = (event: StorageEvent) => {
        if (event.key !== config.storageKey || event.newValue === null) return;
        const next = resolveLocale(event.newValue, config.locales, config.defaultLocale);
        if (next === event.newValue) updateLocale(next);
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }, []);

    const htmlLocale = htmlLanguageOf(locale, config.locales);
    const value = useMemo<I18nContextValue<Locale, Key>>(() => ({
      locale,
      localeDefinition: config.locales.find(({ id }) => id === locale) ?? config.locales[0]!,
      locales: config.locales,
      setLocale,
      t: (key, options) => translate(
        { locale, defaultLocale: config.defaultLocale, locales: config.locales, catalogs: config.catalogs },
        key,
        options,
      ),
      plural: (count, forms, options) => selectPlural(htmlLocale, count, forms, options),
      formatNumber: (input, options) => new Intl.NumberFormat(htmlLocale, options).format(input),
      formatDate: (input, options) => new Intl.DateTimeFormat(htmlLocale, options).format(input),
      formatList: (input, options) => new Intl.ListFormat(htmlLocale, options).format(input),
      formatRelativeTime: (input, unit, options) =>
        new Intl.RelativeTimeFormat(htmlLocale, options).format(input, unit),
    }), [htmlLocale, locale, setLocale]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useI18n(): I18nContextValue<Locale, Key> {
    const value = useContext(Context);
    if (!value) throw new Error("useI18n must be used inside its product I18nProvider");
    return value;
  }

  return { I18nProvider, useI18n } as const;
}
