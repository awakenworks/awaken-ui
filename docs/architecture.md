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
product catalog -> @awaken/ui/i18n ----> Intl + document lang/direction
```

- Public components contain no product DTO, route, API, query, authorization,
  translated copy, or tenant vocabulary.
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

## Optional internationalization engine

`@awaken/ui/i18n` is the one product-neutral owner of locale resolution,
fallback traversal, parameter interpolation, plural-category selection and
explicit `Intl` formatting. `@awaken/ui/i18n/react` adds the one React provider
contract for preference persistence, browser-language initialization,
cross-tab updates, and document `lang`/`dir` projection.

Products own the admitted locale registry, translation keys and catalogs,
default locale, storage-key namespace, domain terminology, and the placement of
the language selector. No product string ships in `@awaken/ui`. Catalogs are
passed to the engine as immutable product inputs; the engine does not fetch or
merge remote translation state and is not a second copy source.

Static ownership is therefore:

```text
product locale registry + catalogs + copy
                 |
                 v
@awaken/ui/i18n (resolution, fallback, plural, formatting)
                 |
                 v
React context + document lang/dir + Intl output
```

At startup, the provider resolves an explicit initial locale, then a persisted
preference, then browser preferences, and finally the product default. A locale
change validates against the product registry, updates in-memory state, applies
`lang` and `dir`, and best-effort persists the preference. A same-origin storage
event revalidates and applies the external value. Blocked storage never blocks
rendering. A missing message follows the declared locale fallback chain and then
the default catalog; the caller-owned default message or key is the terminal
result. Formatting always receives the resolved locale explicitly.

## Optional frontend artifact build tool

`@awaken/ui/build/console-artifact` owns the Node build-time manifest writer
shared by product frontends. It accepts product/profile labels and a generated
API contract path from the consuming build; no product defaults are embedded.
It has no browser export, fetch, mounting decision, release provenance or UI
dependency-version policy. The frontend repository also owns the small
`awaken-ui-artifact` Rust reader in `crates/awaken-ui-artifact`, consumed by Rust
hosts as a pinned library. Foundation has no Console artifact responsibility.
Cross-language tests build real assets through the Node writer and load them
through this reader, including filenames whose locale and byte order differ.

The build enumerates regular assets, rejects symlinks and unsafe paths, hashes
paths in UTF-8 byte order, and writes the manifest only after all inputs have
validated. Products supply their API contract and profile admission policy.
The format contains version, opaque product/profile labels, asset digest and
API contract digest only. Source revision and dependency provenance belong to
release evidence. Version 2 rejects the retired version 1 format explicitly.

Digest encoding is SHA-256 over each sorted entry: unsigned 64-bit big-endian
UTF-8 path length, path bytes, unsigned 64-bit big-endian content length, then
content bytes. The manifest is excluded. Relative paths forbid backslashes,
colon, NUL, empty and dot components. This proves byte integrity at validation
time; it does not authenticate a publisher or prove API behavioral equivalence.
External asset directories must be deployed immutably for the serving process
lifetime. Browser startup and recovery remain with each product's frontend.

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
