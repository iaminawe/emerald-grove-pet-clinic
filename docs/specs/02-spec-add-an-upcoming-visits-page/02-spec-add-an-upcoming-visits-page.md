## Summary
Add a simple read-only page to view upcoming visits for the next N days.

## Acceptance Criteria
- [ ] A new page exists at `/visits/upcoming`.
- [ ] Supports `days` query param (default 7).
- [ ] Displays owner, pet, date, and description for upcoming visits.

## Proof / Demo
- URL proof: `/visits/upcoming` renders a list.
- Playwright: create a visit within the window and verify it appears.

## Notes
- Keep initial scope read-only; no editing from this view.
