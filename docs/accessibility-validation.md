# Accessibility validation

Automated checks are release gates, but they do not replace assistive
technology testing. Run the component tests, axe checks, keyboard browser test,
forced-colors scene, and both-token visual suite before this checklist.

## Screen-reader release checklist

Run at least one Windows combination (NVDA + Chrome or Firefox) and one Apple
combination (VoiceOver + Safari) against a real consuming-product page.

### Tabs

- The tablist has its product-supplied accessible name.
- Each tab announces its name, selected state, position, and disabled state.
- Arrow, Home, and End keys move through enabled tabs in the documented
  orientation; manual activation requires Space or Enter.
- The newly selected panel is announced without moving focus unexpectedly.
- Removing or disabling the selected tab leaves an enabled tab reachable.

### Addressable navigation and breadcrumbs

- `TabNav` is announced as navigation, not as an in-page tab widget.
- The current link announces `current page` exactly once.
- Breadcrumb separators are not announced and the current breadcrumb is not
  presented as a link.
- Product Router links retain their destination and activation behavior.

### Inline notices

- Static notices do not interrupt reading.
- Only urgent, newly inserted failures use `role="alert"`; routine updates use
  the product-selected polite status behavior.
- Tone icons and event markers are decorative; their meaning is repeated in
  text.
- Notice actions have descriptive names and remain reachable at 200% zoom.

Record browser, screen reader and versions, product route, token theme, result,
and any issue link in the release evidence. A release must not claim
screen-reader validation until this manual record exists.
