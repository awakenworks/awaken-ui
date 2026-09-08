# Changelog

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
