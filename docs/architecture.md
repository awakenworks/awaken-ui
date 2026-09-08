# Architecture

`@awaken/ui` is the single owner of product-neutral React interaction
primitives shared by Awaken products.

Engineering rules that realize these boundaries are owned by
[development-standards.md](development-standards.md).
The live cross-repository inventory is
[component-matrix.md](component-matrix.md).

## Static boundary

```text
product feature -> product adapter -> @awaken/ui -> internal headless library
product tokens  ---------------------> --ui-* semantic token contract
```

- Public components contain no product DTO, route, API, query, authorization,
  localization, or tenant vocabulary.
- Base UI is an internal implementation detail and is imported only through
  `src/internal/headless`.
- Components consume only the `--ui-*` semantic token contract.
- Each product owns its raw design tokens and maps them to `--ui-*`.

## Dynamic boundary

The shared package owns DOM semantics, focus, keyboard interaction, portals,
dismissal, controlled component state, and transient UI state. A consuming
product owns the trigger, copy, authorization hint, domain draft, mutation,
retry, cache invalidation, and terminal result.

## Duplication rule

Once a product migrates a responsibility to `@awaken/ui`, its local
implementation must be removed. Re-export shims are migration-only and must
have an explicit removal issue and expiry.

## Optional Awaken brand assets

`@awaken/ui/brand` owns the Awaken family geometry, surface palettes and SVG
serialization migrated from the website. It is framework-independent and has no
React, DOM, router or product API dependency. `@awaken/ui/brand/react` is the thin
React renderer of that same source; Astro consumes the pure export directly.
Cloud uses the Works master mark beside its own product name, not a fifth glyph.
These optional exports are separate from the product-neutral component entry.
They neither select domain icons nor inject a product theme into shared controls.
Products still own brand/theme selection and map their values to `--ui-*`.

At render/build time a caller selects a canonical mark (legacy route aliases only
normalize to existing marks) and surface. All browser, favicon and downloadable
outputs derive from the same geometry; unsupported input fails rather than
silently displaying another product. An explicit surface overrides the document
theme; automatic rendering follows document light/dark state, then system state
when the document has no selection. This introduces no persisted UI state.
