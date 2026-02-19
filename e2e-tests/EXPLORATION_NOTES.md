# Exploration Notes: Upcoming Visits E2E Test

## Playwright Configuration
**Location**: `e2e-tests/playwright.config.ts`

- **Test directory**: `./tests` → `e2e-tests/tests/`
- **Test pattern**: `**/*.spec.ts`, `**/*.test.ts`
- **Base URL**: `http://localhost:8080` (configurable via `E2E_BASE_URL`)
- **Timeout**: 30s for tests, 5s for expect assertions
- **Browser**: Chromium (Desktop Chrome)
- **Global setup**: `tests/global-setup.ts` - waits for app to be ready before tests run
- **Web server**: Auto-starts Spring Boot app with `../mvnw -f ../pom.xml spring-boot:run`

## Test Organization & Patterns
- Tests located in: `e2e-tests/tests/features/`
- Naming convention: `kebab-case-name.spec.ts`
- Import aliases (defined in `tsconfig.json`):
  - `@fixtures/base-test` - base test & expect exports
  - `@pages/*` - page object classes
  - `@utils/*` - utility functions (data-factory, test-helpers)

**Common patterns observed**:
- Use page objects for reusable actions
- Use role-based selectors: `page.getByRole('button', { name: /Add Visit/i })`
- Direct navigation with `page.goto('/owners/1')`
- Screenshot on important steps: `page.screenshot({ path: testInfo.outputPath('name.png') })`
- Filter elements with `.filter({ hasText: 'value' })`

## Add Visit Flow
**Source**: `visit-scheduling.spec.ts`, `templates/pets/createOrUpdateVisitForm.html`

### UI Flow Steps:
1. Navigate to owner details page: `/owners/{ownerId}` (e.g., `/owners/1`)
2. Locate and click "Add Visit" link (in "Pets and Visits" section)
   - Link format: `/owners/{ownerId}/pets/{petId}/visits/new`
3. Fill visit form:
   - **Date field**: `input#date` (format: `YYYY-MM-DD`)
   - **Description field**: `input#description` (required, text input)
4. Click "Add Visit" button to submit
5. Redirects back to owner details page with visit in pet's visit history

### VisitPage Object (`tests/pages/visit-page.ts`):
```typescript
- fillVisitDate(date: string) → fills input#date
- fillDescription(description: string) → fills input#description
- submit() → clicks "Add Visit" button
- heading() → returns locator for "Visit" heading
```

### Example from existing test:
```typescript
await page.goto('/owners/1');
await page.getByRole('link', { name: /Add Visit/i }).first().click();
await visitPage.fillVisitDate('2024-02-02');
await visitPage.fillDescription(`E2E visit ${Date.now()}`);
await visitPage.submit();
```

## Upcoming Visits Page Structure
**Source**: `templates/visits/upcomingVisits.html`

### URL: `/visits/upcoming`

### HTML Structure:
- **Main table**: `<table id="upcoming-visits" class="table table-striped liatrio-table">`
- **Columns** (4 total):
  1. **Owner Name** (th: "Owner Name") - contains link to owner: `<a href="/owners/{id}">First Last</a>`
  2. **Pet Name** (th: "Pet Name") - plain text: `<td>PetName</td>`
  3. **Visit Date** (th: "Visit Date") - format `YYYY-MM-DD`: `<td>2026-02-21</td>`
  4. **Description** (th: "Description") - plain text: `<td>description text</td>`
- **Empty state**: Shows `<p class="liatrio-muted">No upcoming visits found.</p>` when no visits

### Key Selectors for Assertions:
```typescript
// Main table
const table = page.locator('#upcoming-visits');
await expect(table).toBeVisible();

// All rows in tbody
const rows = page.locator('#upcoming-visits tbody tr');

// Find specific row by filtering
const visitRow = rows
  .filter({ hasText: 'Owner Name' })
  .filter({ hasText: 'Pet Name' })
  .filter({ hasText: '2026-02-21' })
  .filter({ hasText: 'description' });
await expect(visitRow).toBeVisible();

// Empty state
await expect(page.getByText(/No upcoming visits found/i)).toBeVisible();
```

## Date Requirements
**From page subtitle**: "Visits scheduled in the next 7 days"
**Current date**: February 19, 2026

### Valid upcoming visit dates:
- Range: `2026-02-19` to `2026-02-26` (inclusive)
- Recommended test date: `2026-02-21` (2 days from now)
- Format: `YYYY-MM-DD` (required by form input)

**Important**: Existing test uses hardcoded past date (`2024-02-02`). For upcoming visits test, must use a future date within the 7-day window.

## Test Data Strategy
Based on seed data exploration:
- **Owner**: Use `/owners/1` (George Franklin - stable seed data)
- **Pet**: Use first available pet (Leo - id=1)
- **Visit date**: `2026-02-21` (within 7-day window)
- **Description**: `E2E Upcoming Visit ${Date.now()}` (unique identifier)

### Test Flow:
1. Create visit via UI (navigate to owner → add visit → fill form → submit)
2. Navigate to `/visits/upcoming`
3. Assert table exists and contains row with:
   - Owner name: "George Franklin"
   - Pet name: "Leo"
   - Visit date: "2026-02-21"
   - Description: matches created description

## New Test File Location
**Path**: `e2e-tests/tests/features/upcoming-visits.spec.ts`

Follows existing naming convention (kebab-case) and feature test organization.

---

## Summary Checklist
- ✅ Playwright config understood (base URL, test dir, browser)
- ✅ Test patterns documented (page objects, selectors, imports)
- ✅ Add-visit flow mapped (URLs, form fields, selectors)
- ✅ Upcoming visits page HTML structure analyzed (table, columns, empty state)
- ✅ Date requirements identified (7-day window from Feb 19, 2026)
- ✅ Test data strategy defined (owner/pet/date/description)
- ✅ New test file location determined
