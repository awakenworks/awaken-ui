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
- Products choose their visual identity and map it to `--ui-*`. Awaken family
  products reuse the optional family palette; other consumers keep their own tokens.

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

## Family appearance

The optional `brand/family.css` owns the shared Awaken light/dark palette, local
font stacks, radii, status colors and density. It exposes `--aw-*` values and the
`--ui-*` mapping; product CSS owns page placement and domain-specific aliases.
The website maps the same values to its Tailwind vocabulary. Brand marks retain
their own identity palettes; action and status colors serve different purposes.

`brand/appearance` consolidates the former website and Agents theme decisions.
One controller per browser window owns the resolved mode and explicit preference.
A blocking head script initializes that same controller before paint; React
subscribes with `useSyncExternalStore`, and Astro uses native delegated controls.
System preference changes apply only in system mode. Explicit changes persist to
`awaken.theme`; storage events update other tabs on the same origin. Browser
storage cannot synchronize unrelated origins. Existing product keys migrate once
on initialization, only after the canonical write succeeds. Blocked storage
keeps a working in-memory preference and never prevents rendering.

No API, account, route, or authentication state enters this controller. Products
supply translated labels and choose where the native appearance control lives.

## Functional icons

Lucide 0.468.0 SVG nodes are the single functional geometry source, preserving
the icon set already used by Workforce. `icons/data` exports the admitted nodes
plus shared SVG attributes without React or DOM execution. `icons` exposes thin
React renderers of those same nodes. Astro renders the data directly. No local
path copies, icon font, emoji-based control, or second icon dependency is needed.

The package owns 16px defaults, 24-unit viewBox, 2-unit round strokes, decoration
semantics and ref forwarding. Consumers own icon choices, labels, placement and
state. A named icon is an image; an unnamed icon is hidden from assistive
technology. Icon-only controls still need a name on the control. Rendering is
pure: no requests, durable state, retries or command side effects occur.
