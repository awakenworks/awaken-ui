# Visual evidence

The PNGs in this directory are full-page review captures of the public gallery:

- `awaken-agent-chat.png` uses the Awaken token adapter.
- `oversight-agent-chat.png` uses the Oversight token adapter.

The focused, repeatable baselines live beside `tests/visual/gallery.spec.ts`.
There are 26 comparisons: 13 component scenes rendered once with Awaken tokens
and once with Oversight tokens. The set includes agent conversation and
identity, buttons/switch, Popover, Dialog, Drawer, confirmation, metric cards,
editor/form/schema/secret controls, DataGrid, and JSON Inspector.

Update them intentionally with `pnpm test:visual:update`, review both product
images, then prove the adapters on real consumer pages. The current real-page
checks are:

- Awaken workspace Popover and New environment Dialog;
- Oversight New environment Dialog and environment-detail Drawer.

The isolated gallery proves the semantic token contract. The consumer checks
prove that product CSS, layout constraints, and adapters preserve the original
surface proportions.
