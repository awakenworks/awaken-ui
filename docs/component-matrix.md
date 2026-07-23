# Component authority and migration matrix

This document is the inventory and migration source of truth for
`awaken-1.0.0-dev`, `oversight-next`, and `@awaken/ui`. It records ownership;
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
| Modal overlays | Dialog, Drawer, AlertDialog, ConfirmProvider, DialogSurface, Popover | thin adapters | thin visual adapters | shared behavior |
| Authoring/editor chrome | `EditorForm`, `AuthoringHeader`, `AuthoringGuide`, controlled tab state | product editor composition | thin modal/editor adapters | shared chrome complete; editor domain models remain local |
| Inspectors | `JsonInspector` | i18n/class adapter | shared inspector available where raw JSON is appropriate | disclosure, serialization and clipboard state shared |
| Trace views | shared chat/tool/approval/JSON primitives | `session-log` → span projection | run-event → tool/approval/output projection | intentionally separate domain projections; no common DTO |
| Usage and analytics | display primitives only | Awaken token/cache billing projection | Oversight run/domain analytics | intentionally product-owned calculations |
| Product identity generation | none | product-owned | `EntityIcon` prompt/hash/rendering | intentionally product-owned |
| Routing/API/query state | none | product-owned | product-owned | never shared |

## Dynamic behavior

1. A feature maps its DTO and permissions into product-neutral props.
2. The product adapter supplies localized labels, icons, route actions, and
   token mapping.
3. The shared component owns semantic DOM, keyboard/focus behavior, controlled
   state transitions, transient timers, and presentation-state rendering.
4. The feature performs mutations and maps success, failure, retry, and
   terminal state back into shared presentation props.
5. Visual verification runs the same shared scene under both product token
   maps; consumer interaction tests verify adapter contracts.

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

## Completion gate

A row becomes complete only after both products have been searched for
overlapping implementations, all relevant callers use the authority or a thin
adapter, obsolete code/CSS is removed, interaction/build checks pass, and the
same scene has browser screenshots under Awaken and Oversight token maps.
