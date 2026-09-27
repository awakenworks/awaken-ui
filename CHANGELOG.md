# Changelog

## 0.13.1

- Reveal the mounted assistant when a product opens Describe after a test or
  repair request, even if the rail was collapsed. Hiding it from Describe
  returns to Design rather than leaving an empty mobile view. Unsent inputs
  and the prior rail preference remain intact; no new product state or API.

## 0.13.0

- Consolidate static translation-catalog checks under the optional i18n export:
  fragment ownership, key coverage, parameters, exact code literals and
  unexplained generator remnants. Products retain copy and semantic review.
- No change to locale resolution, runtime fallback, preferences or draft state.

## 0.12.1

- Keep workbench mode controls and the assistant rail reachable while editing
  long desktop forms. The rail uses its own bounded scroll region; mobile
  retains one ordinary page scroll and the same mounted content.
- Split workbench styling by responsibility without changing public imports.

## 0.12.0

- Extend DesignWorkbench with optional product-owned Test content and a
  collapsible assistant rail. Design, Test and Review share the main workspace;
  content stays mounted so drafts, conversations and test tasks survive switches.
- Show the mode controls on desktop as well as mobile. Consumers must open
  Review explicitly; it no longer competes with the editor below the fold.
- Correct the component inventory to the frontend-owned Console artifact format.

## 0.11.1

- Preserve rich placeholder node identity by name and occurrence when a
  translation reorders the sentence. Locale changes no longer swap uncontrolled
  input drafts between fields. Unknown placeholders remain literal text.

## 0.11.0

- Make invalid/missing date data render safely through one shared formatter.
- Share one locale store between React views and imperative product messages;
  add safe rich placeholders that preserve user content and React interaction.
- Load product-owned language chunks before switching, fence stale requests and
  retain drafts on failures. Share the accessible language selection control.
- Prepare the built package when installing a pinned GitHub revision; Rust
  interoperability tests remain in repository CI rather than consumer install.

## 0.10.0

- Own Console artifact emission through the optional Node build export and
  the `awaken-ui-artifact` Rust host reader. Products retain API/profile policy;
  Foundation no longer defines Console delivery.
- Use one version 2 format without unverified source/dependency provenance or
  unused browser comparison logic. UTF-8 byte ordering and actual Node-to-Rust
  tests prevent locale-dependent build/host digest disagreement.

## 0.9.0

- Add the product-neutral i18n engine for BCP 47 locale resolution, explicit
  fallback chains, interpolation, plural categories and locale-bound `Intl`
  formatting.
- Add the React provider contract for product-owned catalogs, preference
  persistence, browser-language initialization, cross-tab updates and document
  `lang`/`dir`, including RTL locales. No product copy moved into the package.

## 0.8.2

- Align supplied event markers with the title instead of stretching their slot
  through the event body and metadata.

## 0.8.1

- Render a supplied EventItem marker without a second default dot, including
  forced colors. Empty markers retain the existing timeline dot and rail.

## 0.8.0

- Keep optional-icon notice actions inside narrow layouts.
- Fix multi-column DescriptionList collapsing at the 40rem breakpoint.
- Keep long tab labels inside a horizontally scrollable strip with visible
  keyboard focus, preserving product-owned selection and panel state.

## 0.7.0

- Add shared Lucide functional icon nodes and thin React renderers for React and
  Astro consumers, preserving Workforce geometry while standardizing size, stroke
  and accessibility defaults.
- Replace character-based default icons in shared chat, feedback, navigation,
  overlays and forms; controls retain caller-owned names and actions.
- Loading icons honor reduced motion.

## 0.6.0

- Add optional family palettes and shared system/light/dark appearance control,
  consolidating website and Agents persistence with one prepaint implementation.
- Family consumers reuse local font stacks, status colors, 4px radii and compact
  desktop / comfortable touch metrics while retaining route and domain ownership.
- Existing origin-local theme preferences migrate once; blocked storage preserves
  usable live selection, and React and native Astro controls share one controller.

## 0.5.0

- Move the existing Awaken brand geometry and palettes from the website into
  optional framework-independent brand exports, with React and Vite adapters.
- All product marks, suite entries, downloads and favicons consume one source.
  Cloud uses the company master mark with its product name.
- Brand renderers support explicit/automatic surfaces, decorative/named images,
  system color schemes and forced colors without importing product state.

## 0.4.0

- Consolidate SuiteSwitcher and link dismissal from existing consumer distributions.
- Shared DataGrid, SchemaForm, SecretField and JsonInspector now apply their own
  input/button recipes. SecretField associates unique labels with password inputs.
- Add opt-in intrinsic column layout (`DataTable layout="auto"`), consolidating
  Cloud's table recipe while preserving the default grid-column contract.
- Consolidate native grid tables, bare cards, responsive toolbar layout and field
  typography. Optional tokens add xs/control font sizes, raised/muted surfaces,
  strong borders, soft accent backgrounds and warning text with neutral fallbacks.
- Consumers remove local generic recipes and no-op wrappers; keep product copy,
  state, routes and token values in the product.


- Keep fenced-code copy controls working after parent rerenders, label changes
  and React Strict Mode effect replay; dispose pending clipboard feedback when
  the Markdown view is replaced or unmounted.

## 0.3.0

- Add an opt-in semantic mobile card presentation to `DataGrid`, including a
  caller-owned accessible row action and mobile loading slot.
- Make the package boundary check resolve file URLs correctly on Windows.
