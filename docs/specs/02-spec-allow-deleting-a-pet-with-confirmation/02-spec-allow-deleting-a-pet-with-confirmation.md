## Summary
Add the ability to delete a pet from an owner (with confirmation).

## Acceptance Criteria
- [ ] A delete action is available for a pet on the owner details page.
- [ ] Deleting requires a confirmation step.
- [ ] After deletion, the pet no longer appears on the owner details page.

## Proof / Demo
- Playwright: create a pet, delete it, verify it is removed from the UI.
- Screenshot: confirmation UI.

## Notes
- Keep safety behavior explicit (e.g., block deletion if visits exist, or require extra confirmation).
