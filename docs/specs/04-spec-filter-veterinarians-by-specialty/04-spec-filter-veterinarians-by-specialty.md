## Summary
Add specialty filtering to the Vet Directory so users can narrow the veterinarian list by specialty.

## Acceptance Criteria
- [ ] Vet Directory includes a specialty filter control.
- [ ] Selecting a specialty shows only matching vets.
- [ ] An "All" option shows all vets; "None" is handled sensibly.

## Proof / Demo
- Screenshot: filtered vet list displayed.
- Playwright: E2E test that applies a filter and verifies results.

## Notes
- Prefer query param support so filtered URLs can be shared.
