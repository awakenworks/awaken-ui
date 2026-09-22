# @awaken/ui

Product-neutral React UI primitives for Awaken products. The package owns
interaction behavior and a semantic CSS contract; consuming products retain
their own design tokens, themes, domain adapters, routes, and API state.

## Install

```sh
pnpm add @awaken/ui
```

Load the shared structural recipes once:

```ts
import "@awaken/ui/styles.css";
```

Then map product tokens to the required semantic contract:

```css
:root {
  --ui-color-canvas: var(--product-canvas);
  --ui-color-surface: var(--product-surface);
  --ui-color-text: var(--product-text);
  --ui-color-text-muted: var(--product-text-muted);
  --ui-color-border: var(--product-border);
  --ui-color-accent: var(--product-accent);
}
```

See [docs/architecture.md](docs/architecture.md) for ownership and dependency
rules and [docs/development-standards.md](docs/development-standards.md) for
the authoritative engineering standards.

## Internationalization (optional)

Use `createI18n` from `@awaken/ui/i18n/react` once per product. The product
supplies BCP 47 locale definitions and its single typed catalog; the shared
engine owns resolution, fallback, persistence, plural rules, explicit `Intl`
formatting and document `lang`/`dir`. It contains no Awaken product copy and is
not limited to English and Chinese.

```tsx
const i18n = createI18n({
  locales: [
    { id: "en", label: "English", htmlLang: "en" },
    { id: "ja", label: "日本語", htmlLang: "ja" },
    { id: "ar", label: "العربية", htmlLang: "ar", direction: "rtl" },
  ] as const,
  defaultLocale: "en",
  storageKey: "example.locale",
  catalogs: {
    en: { greeting: "Hello, {name}" },
    ja: { greeting: "こんにちは、{name}" },
    ar: { greeting: "مرحبًا، {name}" },
  },
});

<i18n.I18nProvider>
  <ProductApp />
</i18n.I18nProvider>
```

The product renders the language selector from `useI18n().locales`, owns every
label and fallback decision, and may add any admitted locale without changing
the shared package.

## Console artifact builds (optional)

Node build scripts can import `writeConsoleArtifact` from
`@awaken/ui/build/console-artifact` and pass `dist`, `apiContract`, `product`,
and `profiles`. Rust delivery adapters consume `awaken-ui-artifact` from this
repository at the same reviewed revision as the npm archive. The optional build
entry is never imported by browser code. See [artifact ownership](docs/architecture.md#optional-frontend-artifact-build-tool).

Repository checks require Node 22+, pnpm 11+, and Rust 1.88+; CI pins Rust
1.96.0 for the Node-to-Rust artifact tests.

## Shared information and navigation primitives

Use `InlineNotice` for contextual feedback; the product decides its copy,
actions, visibility, and live-region policy. `DescriptionList` and `EventList`
provide native, product-neutral structure without accepting domain DTOs.

Use `Tabs` for in-page panels and `TabNav` for addressable navigation. Products
own route matching and may supply their router link through `render` on a
`TabNavItem` or `BreadcrumbItem`. `SegmentedControl` is only a mutually
exclusive value selector and is not a tab implementation.

```tsx
<Tabs value={section} onValueChange={setSection}>
  <TabList aria-label="Editor sections">
    <Tab value="overview">Overview</Tab>
    <Tab value="tools">Tools</Tab>
  </TabList>
  <TabPanel value="overview">...</TabPanel>
  <TabPanel value="tools">...</TabPanel>
</Tabs>
```

An operational announcement may compose `InlineNotice`, but announcement
delivery, audience filtering, expiry, priority, and dismissal persistence stay
in the consuming product.

The icon and event-marker slots are decorative; repeat their meaning in text.
Before releasing or migrating these primitives, follow the automated and
manual gates in [docs/accessibility-validation.md](docs/accessibility-validation.md).

`DataGrid` keeps its native table at wider viewports. Consumers may opt into a
mobile label-value card view with `mobileCards`; when rows navigate, provide a
localized `mobileRowActionLabel` so the card uses a real accessible button.

`SuiteSwitcher` accepts caller-authorized destinations, current product labels,
icons and exact hrefs; it owns menu keyboard behavior and dismissal only.
`DataTable layout="auto"` aligns intrinsic columns across rows; omit `layout`
to retain explicit grid columns. DataGrid, SchemaForm, SecretField and
JsonInspector no longer require consumer control-class adapters.

For an unpublished local integration, build one immutable package using
`pnpm pack --out /absolute/path/awaken-ui-0.8.0.tgz` from the committed UI tree.
Consumers pin that built archive with lockfile integrity (or unpack it unchanged
into an existing offline workspace dependency). Record the source commit and
archive hash alongside the dependency. Never patch distribution files or pack
individual modules from multiple revisions. Registry publication remains a
separate release step; a local archive is not a published release.

## Awaken brand assets (optional)

Use `@awaken/ui/brand` from Astro or build scripts for the canonical family SVG
body, palette and favicon. In React:

```tsx
import { BrandMark } from "@awaken/ui/brand/react";
import "@awaken/ui/brand/styles.css";

<BrandMark mark="workforce" />
<BrandMark mark="works" label="Awaken Cloud" scheme="on-dark" />
```

Automatic marks follow `data-theme="light|dark"`, then the system preference.
Supply `scheme` for a surface with a fixed background. Omit `label` when visible
adjacent text already supplies the name. Never copy geometry into a component.
Vite consumers add `brandFaviconPlugin("agents")` from `@awaken/ui/brand/vite`
to their existing plugins and remove local favicon links/files. The plugin
inlines the canonical adaptive SVG in development and production HTML.

Family products import `@awaken/ui/brand/family.css` after core styles. Select
`data-brand="works|agents|objects|workforce"`; map any existing product vocabulary
to its `--aw-*` values instead of copying palettes. Vite can set the identity and
install the shared prepaint policy with `brandAppearancePlugin("agents",
{ legacyStorageKeys: ["awaken.console.theme"] })`. Astro emits
`appearanceBootstrap()` from `@awaken/ui/brand/appearance` in an inline head script.

React callers use `AppearanceSelect` from `@awaken/ui/brand/react` with a `labels`
object containing `label`, `system`, `light`, and `dark` strings. Astro supplies a
native `select[data-appearance-select]` with those three values. Both project the
same controller. Only the canonical `awaken.theme` key is live; default system
mode is not persisted on mount. Preferences are shared by tabs on one origin,
not by unrelated product domains. See [architecture](docs/architecture.md) for
ownership and blocked-storage behavior.

## Functional icons

Import named React icons from `@awaken/ui/icons`, for example `Search` or `X`.
They use Lucide geometry with 16px defaults and 2-unit strokes; `size` and native
SVG props control presentation. Unnamed icons are decorative. Name icon-only
buttons on the button; use `label` only for a standalone meaningful image.
Astro uses the same named nodes and `iconAttributes` from `@awaken/ui/icons/data`.
Do not install a second icon package or copy paths into product components.
