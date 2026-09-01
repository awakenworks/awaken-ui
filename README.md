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
## Suite navigation

`SuiteSwitcher` provides the shared accessible product/destination menu. The
consumer supplies its product labels, current Workspace description,
Cloud-projected URLs, icons, and authorized destination list; `@awaken/ui`
does not construct routes or infer access.
