# Upcoming Visits E2E Test Implementation Summary

## Test File Created
**Location**: `e2e-tests/tests/features/upcoming-visits.spec.ts`

## Tests Implemented

### 1. **Main Test**: Visit created within 7-day window appears on upcoming visits page
**Purpose**: Validates end-to-end flow from visit creation to display on upcoming visits page

**Test Steps**:
1. Navigate to owner details page (`/owners/1` - George Franklin)
2. Click "Add Visit" link for first pet (Leo)
3. Fill visit form with:
   - Date: `2026-02-21` (within 7-day window from current date 2026-02-19)
   - Description: Unique identifier with timestamp
4. Submit form and verify redirect to owner details
5. Navigate to `/visits/upcoming`
6. Assert page loads with "Upcoming Visits" heading
7. Assert table `#upcoming-visits` exists and is visible
8. Assert visit row appears with all correct data:
   - Owner name: "George Franklin"
   - Pet name: "Leo"
   - Visit date: "2026-02-21"
   - Description: matches created description
9. Verify owner link is functional

**Assertions**: 7+ assertions covering heading, table, row count, cell contents, and links

---

### 2. **Additional Test**: Shows visits scheduled for different time windows with days parameter
**Purpose**: Validates that the `days` query parameter is accepted and displayed correctly

**Test Steps**:
1. Test with `?days=1` - verifies subtitle shows "1 days"
2. Test with `?days=30` - verifies subtitle shows "30 days"
3. Test with no parameter - verifies default "7 days"

**Assertions**: 6 assertions (2 per scenario: heading + subtitle)

---

### 3. **Edge Case Test**: Displays empty state when no upcoming visits exist
**Purpose**: Validates empty state rendering

**Test Steps**:
1. Navigate to `/visits/upcoming?days=0` (time window with no visits)
2. Verify heading displays
3. Verify empty state message "No upcoming visits found." appears
4. Verify table is NOT visible (uses `.not.toBeVisible()`)

**Assertions**: 3 assertions (heading, empty message, table absence)

---

### 4. **Navigation Test**: Navigates to upcoming visits page from navigation menu
**Purpose**: Validates navigation integration (conditional test)

**Test Steps**:
1. Start from home page
2. Check if "Upcoming Visits" nav link exists
3. If exists: click and verify URL and heading
4. If not exists: fallback to direct navigation test

**Assertions**: 2-3 assertions depending on nav link existence

---

## Test Patterns Used

### Imports
```typescript
import { test, expect } from '@fixtures/base-test';
import { VisitPage } from '@pages/visit-page';
```

### Page Objects
- Uses `VisitPage` for form interactions:
  - `fillVisitDate(date: string)`
  - `fillDescription(description: string)`
  - `submit()`
  - `heading()`

### Selectors
- Role-based: `page.getByRole('heading', { name: /Upcoming Visits/i })`
- ID selector: `page.locator('#upcoming-visits')`
- Filtering: `.filter({ hasText: 'value' })`
- nth child: `.locator('td').nth(0)`

### Assertions
- Visibility: `toBeVisible()`, `.not.toBeVisible()`
- Content: `toContainText('value')`
- Count: `toHaveCount(1)`
- URL: `toHaveURL(/pattern/)`

### Screenshots
- Takes screenshots at key points using `testInfo.outputPath()`

---

## Test Data

### Seed Data Used
- **Owner #1**: George Franklin (from `data.sql` line 25)
- **Pet #1**: Leo, cat, owned by owner #1 (from `data.sql` line 42)

### Test Data
- **Visit Date**: `2026-02-21` (2 days after current date `2026-02-19`, within 7-day window)
- **Description**: `E2E Upcoming Visit ${Date.now()}` (unique identifier)

---

## Coverage Provided

✅ **Happy path**: Create visit → view on upcoming visits page
✅ **Query parameters**: Tests `?days=N` parameter variations
✅ **Empty state**: Tests when no visits exist
✅ **Navigation**: Tests navigation integration (if nav link exists)
✅ **Data integrity**: Validates all 4 columns (owner, pet, date, description)
✅ **Link functionality**: Validates owner link works

---

## How to Run

```bash
# Run all tests
cd e2e-tests
npm test

# Run only upcoming visits tests
npm test -- upcoming-visits

# Run with UI
npm run test:ui

# Run in headed mode
npm run test:headed

# Debug mode
npm run test:debug
```

---

## Next Steps (Sub-Task 3)
Run the test and verify it passes!
