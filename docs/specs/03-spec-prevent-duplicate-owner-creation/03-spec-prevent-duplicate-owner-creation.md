## Summary
Prevent creating duplicate owners by adding a simple duplicate detection rule during owner creation.

## Acceptance Criteria
- [ ] Attempting to create a duplicate owner is blocked.
- [ ] The UI shows a clear, actionable error message.
- [ ] The duplicate attempt does not create a second owner record.

## Proof / Demo
- Playwright: create an owner, attempt to create the same owner again, assert error.
- JUnit: controller/service test covering duplicate detection path.

## Notes
- Define "duplicate" using a small, explicit rule (e.g., same first/last/telephone).
