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
