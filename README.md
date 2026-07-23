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
