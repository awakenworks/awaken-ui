@/home/chaizhenhua/.codex/RTK.md

# Repository instructions

`@awaken/ui` is the single product-neutral React UI implementation shared by
Awaken products. It owns interaction behavior and the `--ui-*` semantic token
contract; consuming products own brand tokens, domain adapters, routes, API
state, permissions, and copy. Optional `brand` exports own the shared Awaken
mark geometry and palettes independently of the product-neutral component core.

Before designing or editing:

1. Read [docs/architecture.md](docs/architecture.md).
2. Read [docs/development-standards.md](docs/development-standards.md).
3. Search the package and all known consumers for an existing implementation:
   `../awaken-1.0.0-dev/web`, `../awaken-flow/web` (Workforce),
   `../oversight-next/web`, and
   `../awaken-cloud/web/awaken-cloud-console`.
4. Identify the authoritative implementation and its callers. Do not create a
   second component, state owner, token vocabulary, compatibility path, or
   headless mechanism for the same responsibility.

Hard guardrails:

- Base UI is the only headless component implementation and is private to
  `src/internal/headless/`.
- Public exports must not expose Base UI types, parts, prop names, or DOM
  assumptions.
- Source outside `src/internal/headless/` must not import `@base-ui/react`.
- Source must not import React Router, TanStack Query, product APIs, generated
  product DTOs, authorization rules, or product localization contexts.
- Components consume only `--ui-*` semantic tokens. Product token names and
  raw brand values do not belong in component CSS.
- Native HTML owns simple controls. Use the headless layer only for composite
  interactions that require focus, keyboard, portal, dismissal, collection, or
  ARIA behavior.
- A migrated product implementation must be deleted. Temporary re-export
  shims require an owner, removal issue, and expiry.
- No source file may exceed 500 lines; split by responsibility before crossing
  the limit.
- Run `pnpm check` before handoff.

Documentation ownership:

- Architecture and dependency ownership:
  [docs/architecture.md](docs/architecture.md)
- Engineering, component, styling, accessibility, test, dependency, migration,
  and release rules:
  [docs/development-standards.md](docs/development-standards.md)
- Consumer installation and minimal usage: [README.md](README.md)
