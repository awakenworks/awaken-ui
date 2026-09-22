# Development standards

This document is the single owner of engineering rules for `@awaken/ui`.
`AGENTS.md` is a navigation and guardrail layer; consumer documentation belongs
in `README.md`; architecture ownership belongs in `architecture.md`.

## 1. Decision order

Every change follows this order:

1. **Eliminate duplication.** Search this package and known consumers for the
   same responsibility, including partial implementations, helpers, CSS
   recipes, tests, compatibility paths, and call sites.
2. **Confirm ownership.** Select one authoritative implementation. Prefer
   extending it over introducing another component or abstraction.
3. **Preserve native semantics.** Prefer native HTML when it fully supplies the
   required semantics and behavior.
4. **Place at the lowest valid layer.** Product-specific behavior stays in the
   product. Only product-neutral behavior enters this package.
5. **Make the smallest coherent change.** A vertical slice includes behavior,
   styles, tests, exports, documentation, and removal of the superseded path.

If duplicate implementations are discovered, pause feature work, consolidate
them, migrate callers, remove the redundant path, validate behavior, and only
then resume.

## 2. Ownership boundaries

### Shared package owns

- DOM semantics and accessible names;
- focus entry, containment, restoration, and visible focus hooks;
- keyboard, pointer, dismissal, portal, and collision behavior;
- controlled and uncontrolled UI-state contracts;
- transient presentation state such as a toast queue;
- product-neutral layout recipes;
- the `--ui-*` semantic token contract;
- product-neutral view models and pure presentation algorithms.
- product-neutral locale resolution, catalog fallback, interpolation, plural
  selection, explicit `Intl` formatting, and document language/direction
  projection through the optional i18n exports;

### Consuming products own

- generated endpoint and domain types;
- API calls, TanStack Query keys, mutations, invalidation, retry, and streaming;
- routing and URL state;
- authentication, authorization, and capability decisions;
- Workspace, Project, Issue, Session, Agent, Workflow, and other domain terms;
- admitted locale lists, translation keys/catalogs, product copy, domain
  formatting policy, and icon choices;
- brand selection and token-to-`--ui-*` mappings (Awaken family raw values
  and appearance persistence come from the optional shared brand exports);
- domain DTO-to-view-model adapters.

Shared components may display a permission or error state supplied by a
consumer. They must never infer permission, retry policy, workflow meaning, or
domain state.

## 3. Dependency policy

### Runtime dependencies

- React and React DOM are peer dependencies.
- Base UI is the one headless implementation dependency.
- Lucide SVG nodes are the one functional-icon geometry dependency. Use the
  package icon exports; do not add another renderer package or copy SVG paths.
- Add a runtime dependency only when it removes a substantial, difficult,
  product-neutral responsibility and is safer than maintaining it here.
- Do not add a second headless, positioning, focus-management, toast, form, or
  styling framework for a responsibility already covered.

### Headless boundary

Only modules under `src/internal/headless/` import `@base-ui/react`. Those
modules normalize third-party behavior into package-owned contracts.

Public modules must not expose:

- Base UI component or prop types;
- Base UI part names;
- Base UI event detail types;
- library-specific `render`, `slot`, or state conventions;
- assumptions about Base UI's generated DOM.

This is implementation isolation, not a pluggable-engine framework. Do not
create runtime adapters for hypothetical alternative headless libraries.

### Forbidden product dependencies

Production source must not import:

- `react-router` or another application router;
- `@tanstack/react-query` or another server-state library;
- consumer API clients or generated DTOs;
- product app state, permission, product localization catalogs, or telemetry
  modules.

## 4. Component API design

### Naming

- Use domain-neutral names: `Dialog`, `StatusPill`, `DataTable`.
- Avoid product nouns: `AgentDialog`, `IssueStatus`, `WorkspaceMenu`.
- Name callbacks for the state transition they report:
  `onOpenChange`, `onValueChange`, `onSelectionChange`.
- Boolean props use `is`, `has`, `allows`, or native names where appropriate:
  `disabled`, `required`, `readOnly`.

### State

- Prefer controlled state for application-significant UI:
  `open` + `onOpenChange`, `value` + `onValueChange`.
- An uncontrolled form may additionally expose `defaultValue`; it must not
  silently switch between controlled and uncontrolled.
- Never mirror props into state unless the component explicitly models a draft.
- Derive presentation state during render instead of synchronizing it in an
  effect.
- Reducers and collection algorithms must be pure and deterministic.

### Props

- Extend native element attributes where the component renders one stable
  native control.
- Use explicit unions for meaningful variants and sizes.
- Use `ReactNode` for caller-owned content.
- Prefer composition over boolean matrices.
- Do not accept arbitrary domain objects. Accept product-neutral view models or
  render callbacks.
- Do not add a prop for a one-off consumer override until another real use
  demonstrates the shared contract.
- Preserve caller event handlers; internal behavior must compose rather than
  overwrite them.

### Refs and DOM

- Forward refs when the public contract represents a focusable or measurable
  element.
- Do not expose refs to incidental wrapper nodes.
- Public behavior must not depend on consumers querying internal class names or
  DOM nesting.
- Stable styling hooks are package-owned classes, `data-*` state, and semantic
  tokens.

### Exports

- `src/index.ts` is the public surface.
- Internal helpers and third-party wrappers are never exported.
- Every export must be intentional, documented by its type, and covered by a
  reachability test.
- Avoid default exports so refactors and automated imports remain unambiguous.

## 5. React practices

- Components and hooks must be pure during render.
- Effects synchronize with external systems only; they are not a general state
  derivation mechanism.
- Clean up timers, observers, subscriptions, and global listeners.
- Do not use array indexes as keys for mutable collections.
- Avoid premature `useMemo` and `useCallback`; use them when identity is part
  of a child/effect contract or measurement shows a material benefit.
- Do not mutate props, caller collections, or shared module state.
- Context providers expose stable, minimal values and fail clearly when a hook
  is used outside its provider.
- Development Strict Mode behavior must not duplicate durable effects or leave
  pending promises.
- Transient services such as Confirm and Toast must settle or clean up queued
  work exactly once.

## 6. Accessibility

Accessibility behavior is required functionality, not optional polish.

- Prefer native `button`, `input`, `select`, `textarea`, `table`, and `label`.
- Every interactive control is keyboard reachable and has an accessible name.
- Do not attach button behavior to a `div` or `span`.
- Composite widgets follow the relevant WAI-ARIA Authoring Practice.
- Dialogs provide a title, manage initial focus, contain focus when modal,
  restore focus on close, and make background content inert.
- Destructive confirmations initially focus the safe action unless a documented
  interaction requirement says otherwise.
- Focus must remain visibly styled by consumer recipes.
- Icon-only buttons require a caller-supplied accessible label.
- Dynamic status messages use the appropriate live-region politeness.
- Color must not be the only status signal.
- Disabled and read-only are distinct; do not use one as a visual substitute for
  the other.
- Reduced motion and forced-colors modes must remain usable.

Automated assertions are necessary but do not replace keyboard and screen
reader-oriented behavior tests.

## 7. Styling and token contract

The optional `brand` exports own Awaken marks and their palettes. Brand constants
are permitted only there, including the optional family token stylesheet;
product-neutral component recipes never consume brand tokens directly.

### Token ownership

Component CSS consumes only semantic variables prefixed `--ui-`. Consumers map
their product tokens to this contract.

Allowed:

```css
.ui-dialog {
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
}
```

Forbidden:

```css
.ui-dialog {
  color: var(--fg);
  background: var(--brand-color-surface);
}
```

- Do not use fallback chains to understand multiple product vocabularies.
- Raw color values belong only in documented fallback/demo token definitions,
  never in component recipes.
- Token names describe semantic purpose, not a product or a literal color.
- A new required token is a public contract change and must be documented,
  tested, and versioned.

### CSS structure

- `contract.css` declares the semantic contract and safe development fallbacks.
- `components.css` owns shared structural recipes.
- Consumers may override semantic token values, not depend on internal DOM.
- Use a stable `ui-` class prefix.
- Use `data-*` attributes for component states and variants.
- Avoid element-wide resets and broad descendant selectors.
- Keep specificity low; do not use `!important` except for a documented
  accessibility or platform interoperability requirement.
- Respect `prefers-reduced-motion`.

### Layout

- Shared components own their internal layout, not page placement or external
  margins.
- Use logical properties where direction may vary.
- Content must tolerate translated text, zoom, and long unbroken identifiers.
- Overlay dimensions must remain bounded by the viewport.

## 8. Localization and content

- Shared components contain no user-facing product copy.
- Accessible labels, button labels, empty-state text, and errors are passed by
  the consumer.
- Use `@awaken/ui/i18n` for the shared locale/fallback/plural/formatting
  mechanism instead of adding a product-local language controller. Keep exactly
  one catalog owner in each consuming product.
- Locale identifiers are BCP 47 strings. Do not encode a two-language union or
  infer that every non-English locale is Chinese.
- Catalog lookup falls back through explicitly declared locale parents and the
  product default; untranslated messages remain visible through a caller-owned
  default message or stable key.
- Apply the resolved locale to `document.documentElement.lang` and its declared
  writing direction. Layout and CSS use logical properties so RTL is usable.
- Punctuation and sentence construction belong to the consumer; do not build
  translated sentences by concatenating fragments.
- Shared components may provide development-only invariant error messages in
  English when they are not user-facing.
- Dates, numbers, currencies, durations, and relative time arrive formatted or
  use the i18n context's explicit resolved locale; never depend on a host default.

## 9. Errors and asynchronous behavior

- Shared components display typed presentation state; they do not classify
  server errors or decide retry.
- An asynchronous action exposes pending state and prevents accidental duplicate
  activation where appropriate.
- Rejections must not strand focus or leave an overlay permanently inert.
- Promise-returning services settle once on confirm, cancel, provider unmount,
  or request replacement according to their documented contract.
- Timers are cleaned up on dismissal and unmount.
- Never log secrets, hidden form values, authorization material, or raw product
  error envelopes.

## 10. Testing

### Required test levels

1. **Contract tests:** public props, exports, controlled state, event composition.
2. **Behavior tests:** keyboard, focus, dismissal, selection, queueing, cleanup.
3. **Accessibility assertions:** roles, names, descriptions, live regions.
4. **Boundary tests:** no product dependencies, headless imports, or product
   tokens.
5. **Build/package tests:** emitted declarations, CSS exports, and consumer
   importability.

### Test style

- Test through roles, names, visible state, focus, and public callbacks.
- Use `user-event` for user interaction.
- Avoid snapshots of large DOM trees.
- Do not assert Base UI implementation details.
- Every fixed defect gets a regression test at the lowest authoritative layer.
- Timers use fake timers only when the timer itself is the contract.
- Tests must be deterministic and independent of execution order.

### Consumer responsibility

Consumers test token mapping, themes, domain adapters, API behavior, routing,
permissions, localization, and feature integration. Do not copy shared behavior
tests into every consumer.

### Product replacement acceptance

A route/export inventory is a useful loss detector, not proof of feature parity.
Before replacing an existing UI, freeze its product revision and use the existing
product journey tests as the capability authority. Every original user task must
retain its reads, commands, permission boundaries, validation, cancellation,
retry, draft preservation, deep links and terminal evidence. Attach missing
cause/effect rules to those tests; do not create a second feature registry here.

Product catalogs may be partitioned along existing feature boundaries, but each
message has one owner and every admitted locale has the same key set. Validate
placeholder multiplicity and preserve executable examples, identifiers and
user-supplied values. A fallback prevents disappearance; it is not translation
completion. Key equality and automated translation do not establish semantic
quality. Review security, destructive-action and recovery instructions before
release. Never form another language's sentence with English plural suffixes.

Run representative journeys against old and new builds with the same fixtures,
roles, locale and viewport. Record task steps, completion/failure recovery,
keyboard/focus behavior, overflow, accessibility findings and loading budgets in
the product's release evidence. A claimed improvement names a measured result;
it cannot rest on screenshots, component reuse, or a green build. Do not claim
overall superiority while original capabilities regress or the comparison has
not been performed. Local/hosted parity uses the same frontend artifact and
owner APIs; a frontend profile does not create a commercial product or grant.

## 11. Documentation

- Public components use TSDoc for non-obvious behavior and invariants.
- Examples use only public imports.
- Architecture decisions are recorded before introducing a second mechanism or
  changing an ownership boundary.
- README contains installation and minimal consumption, not internal design
  truth.
- Do not copy token matrices or API tables across documents; link to the owner.
- Temporary migration state is explicitly labeled with owner and removal
  condition.

## 12. Migration and duplicate removal

A component migration is complete only when:

1. the existing implementations and callers were inventoried;
2. the authoritative behavior was captured by tests;
3. the shared implementation and semantic recipe exist;
4. each consumer maps its tokens without shared knowledge of product names;
5. callers use `@awaken/ui`;
6. local implementation and obsolete CSS are deleted;
7. temporary re-exports are deleted or carry owner, issue, and expiry;
8. both consumer builds and relevant interaction tests pass.

Do not copy a product component into this repository and call that reuse.
Remove product dependencies first and migrate every caller to the one owner.

## 13. Versioning and release

Use semantic versioning:

- **patch:** compatible defect or recipe correction;
- **minor:** backward-compatible component, prop, state hook, or optional token;
- **major:** removed/renamed API, changed event semantics, required token,
  behavior contract, or stable DOM/styling hook.

Release requirements:

- `pnpm check` passes;
- public API and CSS exports build;
- changelog describes consumer-visible behavior and migration;
- no unowned compatibility shim remains;
- consumers pin a released version rather than a mutable branch or local link.

## 14. Definition of done

A change is done when:

- duplication review is recorded in the change description;
- ownership and dependency direction remain valid;
- public behavior, accessibility, styles, and cleanup are tested;
- token and headless boundaries pass;
- types and package build pass;
- obsolete implementations are removed;
- documentation is updated at its authoritative owner;
- no required follow-up is hidden as an undocumented compatibility path.
