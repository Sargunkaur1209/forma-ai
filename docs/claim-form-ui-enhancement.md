# Next task: Enhance the claim form UI

## Goal

Polish the `/claim` page shown in the screenshot attached to the task request. Make the incident-story entry and generated claim form feel like one clear, cohesive, trustworthy experience, while keeping the existing claim flow and behavior intact.

## Status

Implemented on `feat/sargun-claim-form-ui`.

## Scope

- Improve the page hierarchy, spacing, alignment, and visual distinction between the story input and the generated form.
- Refine the form sections, field labels, required indicators, helper/error text, and primary actions into a consistent visual system.
- Make the layout work comfortably on narrow mobile screens as well as desktop; prevent horizontal overflow and keep actions easy to find.
- Provide clear visual feedback for extraction, form loading, validation, submission, and errors.
- Keep focus states, text contrast, semantic labels, and keyboard operation accessible.

## Acceptance criteria

- [x] The `/claim` page has a deliberate visual hierarchy from page title through story entry, generated fields, and submission.
- [x] Story entry and generated form sections are visually related, easy to distinguish, and aligned consistently.
- [x] The layout is usable at mobile and desktop widths without horizontal scrolling, clipped controls, or overlapping content.
- [x] Interactive controls have visible keyboard focus and disabled/loading states; labels and validation/error messages remain readable.
- [x] Existing behavior is preserved: story character count, extraction loading/error/retry/dismissal, schema-driven fields and conditional visibility, validation, and claim submission.
- [x] Verified the updated page in the browser at desktop and narrow mobile viewports.
- [x] Client lint, tests, and production build pass.

## Out of scope

- Changes to extraction, draft, schema, or submission APIs and their data contracts.
- Changes to the claim questions or the order/conditions defined by the form schema.
- New product flows, navigation, or backend functionality.

## Implementation touchpoints

- `client/src/pages/ClaimPage.jsx`
- `client/src/components/MagicInput.jsx`
- `client/src/components/DynamicFormRenderer.jsx`
- `client/src/index.css`
