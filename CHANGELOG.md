# Changelog

## Unreleased

- Keep fenced-code copy controls working after parent rerenders, label changes
  and React Strict Mode effect replay; dispose pending clipboard feedback when
  the Markdown view is replaced or unmounted.

## 0.3.0

- Add an opt-in semantic mobile card presentation to `DataGrid`, including a
  caller-owned accessible row action and mobile loading slot.
- Make the package boundary check resolve file URLs correctly on Windows.
