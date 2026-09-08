# Component authority and migration matrix

This document is the inventory and migration source of truth for
`awaken-1.0.0-dev`, `awaken-flow` (Workforce), `oversight-next`, `awaken-cloud`, `awakenworks.com`, and `@awaken/ui`. It records ownership;
the normative boundary rules remain in [architecture.md](architecture.md) and
[development-standards.md](development-standards.md).

## End-to-end target

```text
feature/domain state
        |
product adapter (copy, icons, routes, DTO mapping)
        |
@awaken/ui (DOM, interaction, presentation state)
        |
Base UI (private headless behavior)
        |
product token map -> --ui-* contract -> shared structural CSS
```

There is one behavioral owner per responsibility. A product-local file is
allowed only when it is a thin adapter or owns product/domain behavior. A
parallel generic implementation is not an accepted migration state.

## Static ownership

| Bounded context | Shared authority | Awaken | Oversight | Status / required decision |
| --- | --- | --- | --- | --- |
| Buttons and clipboard | `Button`, `CopyButton` | variant adapter | variant/icon adapter | complete |
| Identity | `Avatar`, `Identity`, `IdentityCard` | transcript actor mapping | `EntityIdentity` icon adapter | shared identity; generated `EntityIcon` remains product-owned |
| Agent conversation | composer, message/list, markdown, thinking, reasoning, tool call, approval, draft/scroll hooks | wire-event/session-log adapter | DTO/i18n/icon adapter | shared |
| Fields and selection | Field, text/area/select, checkbox, native switch, segmented control, CheckPicker | class/copy adapters | direct/thin exports | complete; native input is the switch event authority |
| Schema/configuration | `SchemaForm`, `SecretField` | schema/copy/class adapters | product forms map DTOs into shared fields | shared renderer and secret-state machine complete |
| Data display | Card, badges/chips/status, table atoms, DataGrid, StatCard/StatGrid, panel, states | class and query-state adapters | direct/thin exports | complete for product-neutral display behavior |
| Layout | Stack, Cluster, SplitPane, ToolbarRow, Panel, SectionHeader, Toolbar | adoption pending by page | direct exports | shared authority exists |
| Transient feedback | Toast queue/provider | tone/API adapter | i18n/icon/API adapter | shared |
| Contextual notices | `InlineNotice` structure, tone, actions and caller-selected live-region semantics | all former `.banner` variants use `InlineNotice`; product supplies copy, icons, actions and urgency | migrate reason-code and setup-handoff presentation through domain adapters | shared authority; announcement delivery and dismissal persistence remain product-owned |
| Description metadata | native `DescriptionList` composition | adopt for neutral metadata where present | migrate repeated `dl` and key/value recipes | shared authority; Cloud billing/subscription metadata is also a consumer |
| In-page tabs | `Tabs`, `TabList`, `Tab`, `TabPanel` | agent-editor stages and nested panels use shared Tabs; draft state stays in the product | migrate controlled panel tabs | shared authority; `SegmentedControl` is value selection only |
| Addressable tab navigation | `TabNav`, `TabNavItem` | Session views use Router-backed `TabNavItem`; URL owns selection and history | migrate `SurfaceTabs` presentation; retain route matching | shared presentation; product owns URL state and Router links |
| Hierarchy navigation | `Breadcrumbs`, `BreadcrumbItem` | workspace hierarchy adapter | org/workspace/project adapter | shared presentation; Cloud has no current breadcrumb requirement |
| Event sequences | `EventList`, `EventItem`, `EventTime` | trace-span adapter | run/issue/activity adapters | shared leaf structure only; sorting, folding, streaming and domain event models stay local |
| Modal overlays | Dialog, Drawer, AlertDialog, ConfirmProvider, DialogSurface, Popover | thin adapters | thin visual adapters | shared behavior |
| Suite navigation | `SuiteSwitcher` product/destination menu semantics and layout | labels/icons/Cloud URLs adapter | labels/icons/Cloud URLs adapter | shared; Cloud remains the only route and authorization authority |
| Authoring/editor chrome | `EditorForm`, `AuthoringHeader`, `AuthoringGuide`, controlled tab state | product editor composition | thin modal/editor adapters | shared chrome complete; editor domain models remain local |
| Inspectors | `JsonInspector` | i18n/class adapter | shared inspector available where raw JSON is appropriate | disclosure, serialization and clipboard state shared |
| Trace views | shared chat/tool/approval/JSON primitives | `session-log` → span projection | run-event → tool/approval/output projection | intentionally separate domain projections; no common DTO |
| Usage and analytics | display primitives only | Awaken token/cache billing projection | Oversight run/domain analytics | intentionally product-owned calculations |
| Product identity generation | none | product-owned | `EntityIcon` prompt/hash/rendering | intentionally product-owned |
| Routing/API/query state | none | product-owned | product-owned | never shared |

`awaken-cloud` is the third consumer. Its console keeps OAuth/session state,
operator and tenant authorization, Billing/Organization/Operations DTOs and API
calls, navigation, copy, and Cloud token mapping. Shared Button, Card, Badge,
Table, loading/error state, and neutral layout primitives are authoritative;
the former inline-style implementations were removed during adoption.

## Current audit evidence

The 2026-07-24 completion audit re-read every production file under both
consumer `web/src` trees and every public shared export. It also searched the
consumer trees for direct clipboard access, headless-library imports, portals,
native confirmation APIs, and raw dialog implementations.

The remaining same-name cross-product components are deliberately split as
follows:

| Same-name surface | Decision |
| --- | --- |
| `Button`, `Card`, `Badge`, `CopyButton`, `StatusPill` | Shared authority with product class/icon/copy adapters only. |
| `TopChrome`, `AppShell` | Product-owned information architecture, routes, session/scope state, and responsive shell composition; the duplicated suite menu is replaced by shared `SuiteSwitcher`, while each shell supplies its labels, icons and Cloud-projected URLs. |
| `HomeSurface`, `EnvironmentsSurface` | Same generic page names but different product DTOs, operations, permissions, and terminal states; only their neutral fields, cards, states, tables, overlays, and drawers are shared. |

No consumer production source imports Base UI, Radix, Headless UI, or another
headless implementation. No consumer production source writes to the
clipboard directly. The one remaining textual `role="dialog"` occurrence is an
explicit role passed to shared `AlertDialog` by Oversight's consequence-preview
adapter; it is not a product-owned dialog implementation.

Notable consolidations discovered during the audit:

- Oversight Markdown now delegates detection, code-block wrapping, clipboard
  status, failure handling, and timer cleanup to shared `ChatMarkdown`; it keeps
  only its sanitized link renderer and Mermaid enhancement.
- Oversight Modal and Drawer now delegate semantic DOM, focus, dismissal,
  portal, title, close control, body, and footer structure to the shared
  components. Product adapters supply class slots, Lucide icons, translations,
  and the product-only drawer/FAB collision flag.
- Both products use the shared Command/Ctrl+K listener; command construction,
  execution, navigation, and copy remain product-owned.

## Dynamic behavior

1. A feature maps its DTO and permissions into product-neutral props.
2. The product adapter supplies localized labels, icons, route actions, and
   token mapping.
3. The shared component owns semantic DOM, keyboard/focus behavior, controlled
   state transitions, transient timers, and presentation-state rendering.
4. The feature performs mutations and maps success, failure, retry, and
   terminal state back into shared presentation props.
5. Session view navigation pushes the exact view URL; Back, Forward and reload
   restore it. Leaving Trace removes only its selected event coordinate.
6. Visual verification runs the same shared scene under both product token
   maps; consumer interaction tests verify adapter contracts.

For overlays, consumer validation additionally opens the real product surface:
Awaken's workspace menu and environment create dialog, and Oversight's
environment create dialog and environment detail drawer. This verifies the
product CSS adapter in addition to the isolated token scene.

Failure ownership follows the same boundary: the shared layer renders a typed
error/retry state, while products classify failures and execute retries.

## Migration priority

### Required maintenance

1. Reject new product-local behavior when a shared authority already exists;
   local files may translate classes, copy, icons, routes, or DTOs only.
2. Add both-token visual scenes for every new shared component family.
3. Keep Trace projections separate unless both products adopt the same event
   contract; reuse the shared leaf primitives instead of normalizing domain
   events into a synthetic common model.
4. Re-run the duplication search whenever either product adds a generic
   component or presentation-state hook.

### Product adapters that remain

- localized labels and tone-name translation;
- Lucide or product-generated icons;
- route/navigation callbacks;
- DTO-to-view-model conversion;
- application state, API calls, retries, and persistence.

### Explicitly deferred

- Generated entity artwork and prompt/hash policy remain in Oversight until a
  second product needs the same identity-generation contract.
- Trace event folding and usage accounting remain product-owned because their
  source events, consistency boundaries, and terminal outcomes differ.
- `ProgressList` remains product-owned until a second consumer demonstrates the
  same readiness-state contract. Oversight's current onboarding state is
  `complete | active | pending` and is not a generic linear stepper.
- `Combobox` remains deferred until a second product needs the same searchable
  selection contract; command palettes, catalog pickers, and remote relation
  search are not treated as interchangeable widgets.
- A standalone `Stepper` and announcement system are not shared primitives.
  Products may compose `InlineNotice` for announcement presentation while
  retaining delivery, targeting, expiry, priority, and persistence.

## Completion gate

A row becomes complete only after both products have been searched for
overlapping implementations, all relevant callers use the authority or a thin
adapter, obsolete code/CSS is removed, interaction/build checks pass, and the
same scene has browser screenshots under Awaken and Oversight token maps.

The [repeatable gallery](../tests/visual/gallery.spec.ts) owns the executable
scene inventory under both demo token maps, including separate Dialog, Drawer,
Popover and confirmation baselines. Product browser journeys additionally verify
the actual consumer themes and placement.

## Agents, Workforce and Cloud consolidation (0.4.0)

Flow is the Workforce product; its repository/package identifiers remain stable.
All three consumers pin the same complete source-built npm archive, with no
expanded workspace copy or hand-assembled distribution modules. Agents removes its
local button, switch, segmented control, picker, card-body, skeleton and confirmation-provider wrappers and its
secret editor state machine. Copy, tone, schema localization, grid query state,
CardHeader composition and usage projections remain product adapters. The follow-up
removes the remaining generic notice recipe, moves all 55 notice call sites to
`InlineNotice`, and uses `TabNav` for Session URL navigation. Product-request
callbacks, pending state, error classification and alert/status roles remain local.
Workforce
removes its input, field, selector and generic state CSS recipes. Cloud uses
shared SelectField and the intrinsic DataTable layout, retaining its accessible
scroll region, organization switching, permissions and command state.

Static: features -> product adapters -> @awaken/ui -> private headless primitives;
product themes -> semantic tokens. Runtime: user input -> shared presentation
state/callback -> product mutation -> pending/error/success props. Shared controls
never persist credentials or run/retry product commands. Disabled/cancelled menu
actions remain open; enabled navigation closes. Secret modes emit intent only.

Reused unchanged: headless overlays, fields, field refs, grid state algorithms,
mobile cards, Markdown lifecycle and product domain owners. Modified: shared
recipes, package exports and the three consumer integrations. Newly added source
is limited to the recovered SuiteSwitcher authority and regression coverage;
no new domain service, theme system or parallel component framework is introduced.

## Awaken family consolidation (0.5.0)

The optional `brand` exports own the geometry and palettes migrated from
`awakenworks.com`. React consumers render `BrandMark`, Astro consumes the pure
brand API, and Vite injects a generated adaptive favicon. Agents uses A,
Workforce uses W (including directory and suite entrances), and Cloud uses the
Works master A with its own name. Product-local paths, text-A marks and favicon
sources are removed; the website's downloadable SVGs remain generated outputs.

The earlier static matrix's second product column is **Oversight**, not Workforce.
Workforce already uses shared `Tabs` in PackStudio and `TabNav` in
IssueViewNavigation; there is no Workforce `SurfaceTabs` implementation.
Workforce's remaining metadata recipes are recorded by their actual source
callers rather than inherited from the Oversight migration list.

## Family appearance consolidation (0.6.0)

`brand/family.css` is the shared light/dark palette, font, radius, status and
control-density owner. All four consumers map or directly use that contract.
`brand/appearance` is the single document-lifetime state owner: prepaint bootstrap,
React subscribers and native Astro selectors all use the same implementation.
Agents and website legacy preferences migrate into the canonical origin-local
key; Cloud and Workforce gain system/light/dark selection.

The appearance-phase artifact was `awaken-ui-0.6.0.tgz`, built from UI source
commit `5d25055`. Its SHA-256 is
`a1223f3bdf9536076ccce83fafc96a1f59099bf6062aa5e6a34b8c36f959b049`.
This artifact is superseded by the current 0.8.0 integration below; no distribution
module is patched after packaging.

Shared acceptance covers all four identities in both modes, long Chinese copy,
narrow layout, native controls, contrast, keyboard focus, storage failures and
cross-tab changes. Product browser checks cover actual control placement,
refresh and route continuity. The Chinese website docs header now wraps at narrow
widths; its search keeps an accessible name when visible text is hidden.

## Functional icons and responsive layout (0.7.0–0.8.0)

All four family consumers use `@awaken/ui/icons` or the pure `icons/data` export.
Lucide 0.468.0 is the single functional geometry source. Workforce removes its
separate `lucide-react` dependency; Agents removes handwritten search geometry
and character-based action icons; Astro uses a thin SVG-node renderer. Labels,
icon choices, command state and routing stay with the consumer. Product marks
remain distinct from functional icons: A for Works/Agents, O for Objects, W for
Workforce, and Works A beside the Cloud name.

The current immutable artifact is `awaken-ui-0.8.0.tgz`, built from committed
UI source `78f3398`. SHA-256:
`c6ffaeb1b7a203d486cc1f862ae4410c03816ea269cd7b0c65fa96ccefe72d8e`.
Agents, Workforce, Cloud and website pin the same archive and lockfile integrity.
Version 0.7.0 introduced the optional icons; 0.8.0 fixes responsive recipes.

Static: `DescriptionList` owns native term/detail structure, columns and narrow
collapse. Workforce's Resource/schema renderer, Outcome fulfillment renderer,
Run trace formatter and Pack revision projections remain separate domain owners.
They now compose this same layout in Pack/Resource details, Fleet, Issue/Run
facts, Worklog results, Studio metrics and Outcome contracts. Their obsolete
metadata CSS and the unused whole-Workflow progress strip are removed. Product
CSS retains external placement and structured-value spans. Numeric page radii
now consume the family scale; circles/pills keep their semantic silhouettes.

Dynamic: translated long labels stay inside the tab strip. Arrow/Home/End keep
controlled tab selection and reveal keyboard focus; addressable links retain
native navigation. Optional-icon notices put actions below content on narrow
screens. Two/three-column descriptions collapse at 40rem without dropping zero,
false, missing or nested values. This introduces no API call, domain state,
persistence, retry or second theme controller.

Reused unchanged: shared React components, native details, domain queries and
mutations, Base UI focus behavior, canonical brand data, appearance controller.
Modified: responsive shared CSS, consumer icon/layout composition, local metric
aliases, existing gallery profile, browser assertions and screenshot provenance.
New mechanisms: none beyond the optional shared icon exports recorded above.

The gallery now loads the actual document-wide Awaken family stylesheet,
including portal contents; Oversight keeps its independent compatible token
profile. Shared validation passes 199 unit tests and 61 browser scenarios,
including long English/Chinese tabs, optional notice icons, responsive metadata,
all brand themes, keyboard focus, contrast and forced colors. Consumer acceptance
also covers real routes, command errors, loading, disabled actions and recovery.

Website Console captures come from the existing Agents browser inventory at
revision `cadf3816ab4003e977387be2f700ce03c0455e04`. Their local initial setup data
and Vite-rendered source are explicitly identified; they do not establish
customer activity, a deployed release or successful provider interoperability.
The website's existing brand document owns capture instructions and provenance.

Cross-repository acceptance uses the existing consumer suites: Agents Console
E2E and UI inventory, Workforce repository and browser gates, Cloud console E2E,
and website home/standalone/browser checks. These are local source and browser
checks; deployment and cross-origin account preference synchronization are not
part of this integration.
