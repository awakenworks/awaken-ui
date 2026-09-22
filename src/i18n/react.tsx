import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  useRef,
  useState,
  Fragment,
  type ReactNode,
} from "react";
import { SelectField } from "../forms/field.js";

import {
  directionOf,
  formatDateValue,
  htmlLanguageOf,
  resolveLocale,
  selectPlural,
  translate,
  type LocaleDefinition,
  type PluralForms,
  type TranslateOptions,
  type TranslationCatalogs,
  type TranslationCatalog,
} from "./core.js";

export interface I18nConfig<Locale extends string, Key extends string> {
  locales: readonly LocaleDefinition<Locale>[];
  defaultLocale: Locale;
  catalogs: TranslationCatalogs<Locale, Key>;
  storageKey: string;
  loadCatalog?: (locale: Locale) => Promise<TranslationCatalog<Key>>;
}

export interface I18nProviderProps<Locale extends string> {
  children: ReactNode;
  initialLocale?: Locale;
}

export interface I18nContextValue<Locale extends string, Key extends string> {
  locale: Locale;
  localeDefinition: LocaleDefinition<Locale>;
  locales: readonly LocaleDefinition<Locale>[];
  setLocale: (locale: Locale) => Promise<boolean>;
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

  // One product instance owns locale for React views and event/validation
  // helpers. Both read this store; imperative messages never read DOM/storage.
  let currentLocale = config.defaultLocale;
  const catalogs = { ...config.catalogs };
  const loaded = new Set<Locale>();
  const pending = new Map<Locale, Promise<void>>();
  let request = 0;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };
  const snapshot = () => currentLocale;
  const serverSnapshot = () => config.defaultLocale;
  function updateLocale(next: Locale) {
    if (next === currentLocale) return;
    currentLocale = next;
    listeners.forEach((listener) => listener());
  }
  async function setLocale(next: Locale, persist = true): Promise<boolean> {
    const admitted = resolveLocale(next, config.locales, config.defaultLocale);
    if (admitted !== next) return false;
    const selected = ++request;
    if (config.loadCatalog && !loaded.has(next)) {
      let load = pending.get(next);
      if (!load) {
        load = config.loadCatalog(next).then((catalog) => {
          catalogs[next] = { ...catalog, ...config.catalogs[next] };
          loaded.add(next);
        }).finally(() => { pending.delete(next); });
        pending.set(next, load);
      }
      try { await load; } catch { return false; }
    }
    if (selected !== request) return false;
    updateLocale(next);
    if (persist && typeof window !== "undefined") {
      try { window.localStorage.setItem(config.storageKey, next); }
      catch { /* In-memory locale remains usable when storage is blocked. */ }
    }
    return true;
  }
  function text(key: Key, options?: TranslateOptions): string {
    return translate({ locale: currentLocale, defaultLocale: config.defaultLocale, locales: config.locales, catalogs }, key, options);
  }
  function textForLocale(locale: Locale, key: Key, options?: TranslateOptions): string {
    return translate({ locale, defaultLocale: config.defaultLocale, locales: config.locales, catalogs }, key, options);
  }
  /** Subscribe a view that uses localized descriptors or imperative helpers. */
  function useTranslationUpdates() {
    return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  }
  /** Rich placeholders preserve React nodes, event handlers and user content.
   * Translation strings are rendered as text; no HTML parsing is involved. */
  function RichText({ message, values = {} }: { message: Key; values?: Readonly<Record<string, ReactNode>> }) {
    useTranslationUpdates();
    const scoped = useContext(Context);
    return <>{(scoped?.t(message) ?? text(message)).split(/(\{[A-Za-z0-9_.-]+\})/g).map((part, index) => {
      const key = part.startsWith("{") ? part.slice(1, -1) : "";
      return <Fragment key={index}>{Object.prototype.hasOwnProperty.call(values, key) ? values[key] : part}</Fragment>;
    })}</>;
  }

  function I18nProvider({ children, initialLocale }: I18nProviderProps<Locale>) {
    const locale = useSyncExternalStore(subscribe, snapshot, () => initialLocale ?? config.defaultLocale);
    useLayoutEffect(() => {
      void setLocale(resolveLocale(
        initialLocale ?? storedLocale(config.storageKey) ?? browserLocales(),
        config.locales,
        config.defaultLocale,
      ), false);
    }, [initialLocale]);

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
        if (next === event.newValue) void setLocale(next, false);
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
        { locale, defaultLocale: config.defaultLocale, locales: config.locales, catalogs },
        key,
        options,
      ),
      plural: (count, forms, options) => selectPlural(htmlLocale, count, forms, options),
      formatNumber: (input, options) => new Intl.NumberFormat(htmlLocale, options).format(input),
      formatDate: (input, options) => formatDateValue(htmlLocale, input, options),
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

  function LanguageSelect({ label, errorLabel }: { label: string; errorLabel: string }) {
    const i18n = useI18n();
    const generation = useRef(0);
    const [pending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);
    useEffect(() => () => { generation.current += 1; }, []);
    return <div>
      <SelectField label={label} value={i18n.locale} aria-busy={pending || undefined}
        onChange={(event) => {
          const revision = ++generation.current;
          setPending(true);
          setFailed(false);
          void i18n.setLocale(event.target.value as Locale).then((accepted) => {
            if (revision !== generation.current) return;
            setPending(false);
            setFailed(!accepted);
          });
        }}>
        {i18n.locales.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </SelectField>
      {failed ? <span role="alert">{errorLabel}</span> : null}
    </div>;
  }

  const getFormattingLocale = () => htmlLanguageOf(currentLocale, config.locales);
  return { I18nProvider, useI18n, text, textForLocale, useTranslationUpdates, RichText, LanguageSelect, getFormattingLocale } as const;
}
