import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { createI18n } from "./react.js";

type Locale = "en" | "ja" | "ar";
type Key = "welcome";

const productI18n = createI18n<Locale, Key>({
  locales: [
    { id: "en", label: "English" },
    { id: "ja", label: "日本語", fallback: "en" },
    { id: "ar", label: "العربية", direction: "rtl", fallback: "en" },
  ],
  defaultLocale: "en",
  storageKey: "test.product.locale",
  catalogs: { en: { welcome: "Welcome" }, ja: { welcome: "ようこそ" } },
});

function Probe() {
  const i18n = productI18n.useI18n();
  return (
    <div>
      <output>{i18n.t("welcome")}</output>
      <output>{i18n.formatNumber(1234)}</output>
      <button type="button" onClick={() => i18n.setLocale("ja")}>Japanese</button>
    </div>
  );
}

describe("i18n React owner", () => {
  it("reports a failed catalog load without changing locale or losing the draft", async () => {
    // Requested locale + loader failure -> retain current locale/draft, expose
    // an accessible retryable failure; no reload or mutation of user input.
    const instance = createI18n<Locale, Key>({
      locales: [{ id: "en", label: "English" }, { id: "ja", label: "日本語" }],
      defaultLocale: "en", storageKey: "test.failure.locale", catalogs: {},
      loadCatalog: async () => { throw new Error("unavailable"); },
    });
    render(<instance.I18nProvider initialLocale="en"><instance.LanguageSelect label="Language" errorLabel="Language unavailable. Try again." /><input aria-label="Draft" defaultValue="keep" /></instance.I18nProvider>);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Language" }), "ja");
    expect(await screen.findByRole("alert")).toHaveTextContent("Language unavailable. Try again.");
    expect(screen.getByRole("combobox")).toHaveValue("en");
    expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue("keep");
  });
  it("loads one catalog before switching and fences stale language requests", async () => {
    // R1 pending locale preserves current copy/state; R2 a later selection wins;
    // R3 failed loading preserves usable copy; R4 rich placeholders stay React
    // nodes, including user content and click handlers, never parsed HTML.
    let finishJapanese!: (value: { welcome: string }) => void;
    const instance = createI18n<Locale, Key>({
      locales: [{ id: "en", label: "English" }, { id: "ja", label: "日本語" }, { id: "ar", label: "العربية" }],
      defaultLocale: "en", storageKey: "test.lazy.locale",
      catalogs: { en: { welcome: "Hello {name}" } },
      loadCatalog: (locale) => locale === "ja"
        ? new Promise((resolve) => { finishJapanese = resolve; })
        : Promise.resolve({ welcome: locale === "ar" ? "مرحبًا {name}" : "Hello {name}" }),
    });
    const clicked = vi.fn();
    let context!: ReturnType<typeof instance.useI18n>;
    function Content() {
      context = instance.useI18n();
      return <><input aria-label="Draft" defaultValue="keep draft" /><instance.RichText message="welcome" values={{ name: <button onClick={clicked}>User &lt;b&gt;</button> }} /></>;
    }
    render(<instance.I18nProvider initialLocale="en"><Content /></instance.I18nProvider>);
    await act(async () => { await context.setLocale("en"); });
    let pending!: Promise<boolean>;
    act(() => { pending = context.setLocale("ja"); });
    expect(context.locale).toBe("en");
    await act(async () => { await context.setLocale("ar"); });
    await act(async () => { finishJapanese({ welcome: "こんにちは {name}" }); await pending; });
    expect(context.locale).toBe("ar");
    expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue("keep draft");
    await userEvent.click(screen.getByRole("button", { name: "User <b>" }));
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(instance.text("welcome")).toBe("مرحبًا {name}");
  });
  afterEach(() => window.localStorage.clear());

  // Decision table: explicit locale -> render it and project lang/dir; a user
  // choice -> update copy, formatting, document and storage together; no second
  // product-local controller is involved.
  it("keeps locale-driven UI and document state consistent", async () => {
    const user = userEvent.setup();
    render(<productI18n.I18nProvider initialLocale="ar"><Probe /></productI18n.I18nProvider>);
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");

    await user.click(screen.getByRole("button", { name: "Japanese" }));
    expect(screen.getByText("ようこそ")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("ja");
    expect(document.documentElement.dir).toBe("ltr");
    expect(window.localStorage.getItem("test.product.locale")).toBe("ja");
  });

  // Decision table: storage event for this product and an admitted locale updates
  // the live provider; foreign keys or unadmitted values have no effect.
  it("accepts only admitted same-origin storage updates", () => {
    render(<productI18n.I18nProvider initialLocale="en"><Probe /></productI18n.I18nProvider>);
    act(() => window.dispatchEvent(new StorageEvent("storage", {
      key: "test.product.locale",
      newValue: "ja",
    })));
    expect(screen.getByText("ようこそ")).toBeInTheDocument();

    act(() => window.dispatchEvent(new StorageEvent("storage", {
      key: "test.product.locale",
      newValue: "fr",
    })));
    expect(screen.getByText("ようこそ")).toBeInTheDocument();
  });

  // Cause/effect rule: absence of the generated provider is a programming error
  // and fails clearly instead of silently creating a parallel default context.
  it("rejects consumers outside their product provider", () => {
    expect(() => render(<Probe />)).toThrow(/I18nProvider/);
  });
});
