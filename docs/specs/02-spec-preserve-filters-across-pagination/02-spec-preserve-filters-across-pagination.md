## Summary
When paging through Owners and/or Vets lists, preserve current search/filter parameters across pagination links.

## Acceptance Criteria
- [ ] Pagination links include the current query/filter parameters.
- [ ] Navigating to next/previous pages does not reset the current filter.
- [ ] The UI continues to reflect the active filter while paging.

## Proof / Demo
- Playwright: apply a filter, page forward/back, verify results stay filtered.
- Screenshot: pagination URLs include expected query parameters.

## Notes
- Keep scope limited to the existing list pages.
