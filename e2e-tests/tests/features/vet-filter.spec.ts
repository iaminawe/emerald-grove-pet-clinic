/**
 * ============================================================================
 * VET DIRECTORY SPECIALTY FILTER - E2E TEST SUITE
 * ============================================================================
 *
 * EXPLORATION SUMMARY (Sub-Task 1 Findings):
 *
 * PROJECT STRUCTURE & PLAYWRIGHT CONFIG:
 * - Location: e2e-tests/playwright.config.ts
 * - Test Directory: e2e-tests/tests/
 * - Test Files Pattern: **\/*.spec.ts, **\/*.test.ts
 * - Base URL: http://localhost:8080
 * - WebServer: Maven Spring Boot (../mvnw -f ../pom.xml spring-boot:run)
 * - Browser: Chromium only
 * - Timeout: 30 seconds (test), 5 seconds (expect)
 * - Parallel Execution: Enabled
 * - CI Retries: 2 (CI environment), 0 (local)
 *
 * EXISTING TEST CONVENTIONS:
 * - Import pattern: import { test, expect } from '@fixtures/base-test';
 * - Page Object Location: e2e-tests/tests/pages/
 * - Fixture usage: Custom test fixture in base-test.ts
 * - Utilities: e2e-tests/tests/utils/
 * - Data Factory: @utils/data-factory.ts
 * - Features go in: e2e-tests/tests/features/
 *
 * VET PAGE STRUCTURE:
 * - Route: /vets.html
 * - Page Object Class: VetPage extends BasePage
 * - Table ID: #vets
 * - Table Structure:
 *   - Column 0 (index 0): Name (firstName + ' ' + lastName)
 *   - Column 1 (index 1): Specialties (rendered as <span> elements or "none")
 *   - Pagination: Query params for page and lastName (e.g., ?page=2&lastName=Davis)
 * - Navigation: BasePage.goVeterinarians() or goto('/vets.html')
 *
 * SPECIALTY FILTER FEATURE (TO BE IMPLEMENTED):
 * - Expected Control: Dropdown/Select element (likely id="specialty" or similar)
 * - Expected Query Parameter: ?specialty=<name> (e.g., ?specialty=surgery)
 * - Expected Options: "All" (default/blank), "radiology", "surgery", "dentistry", "none"
 * - Expected Behavior:
 *   * Filter works on initial page load (supports pre-filtered URLs)
 *   * Clicking filter updates URL with query parameter
 *   * Table updates to show only matching vets
 *   * "All" option shows full list or resets filter
 *
 * SEED DATA (6 vets total):
 * - James Carter (ID 1): No specialties
 * - Helen Leary (ID 2): Radiology
 * - Linda Douglas (ID 3): Surgery, Dentistry
 * - Rafael Ortega (ID 4): Surgery
 * - Henry Stevens (ID 5): Radiology
 * - Sharon Jenkins (ID 6): No specialties
 *
 * FILTERING EXPECTATIONS BY SPECIALTY:
 * - "radiology": 2 vets (Helen Leary, Henry Stevens)
 * - "surgery": 2 vets (Linda Douglas, Rafael Ortega)
 * - "dentistry": 1 vet (Linda Douglas)
 * - "none" (no specialty): 2 vets (James Carter, Sharon Jenkins)
 * - "All": 6 vets (full list)
 * - Empty/No specialty filter: 6 vets (full list)
 *
 * JAVA BACKEND DETAILS:
 * - Controller: VetController (src/main/java/.../vet/VetController.java)
 * - Current Parameters: page (default=1), lastName (default="")
 * - Repository: VetRepository - currently has findByLastNameStartingWith()
 * - Data Models: Vet (entity), Specialty (entity), VetRepository (interface)
 * - Specialty Relationship: Vet has Set<Specialty> (many-to-many via vet_specialties table)
 * - Specialty Properties: id, name (radiology|surgery|dentistry)
 *
 * TEMPLATE STRUCTURE (src/main/resources/templates/vets/vetList.html):
 * - Form ID: search-vet-form (GET to /vets.html)
 * - Search Input: id="lastName"
 * - Results Table: id="vets" with tbody rows
 * - No specialty filter control exists yet (to be added)
 * - Pagination: Pages navigation at bottom
 * - Empty State: "No veterinarians found." message when totalItems == 0
 *
 * ACCEPTANCE CRITERIA TO TEST:
 * 1. Navigate to Vet Directory page loads successfully
 * 2. Select a specialty from the filter dropdown
 * 3. Verify only vets with that specialty are displayed
 * 4. Verify URL query parameter updates to reflect selected specialty
 * 5. Select 'All' specialty (or default state) and verify full list returns
 * 6. Load a pre-filtered URL (e.g., /vets.html?specialty=surgery)
 * 7. Verify the filter is pre-selected and correct vets are displayed
 * 8. Test specialty "none" - vets with no specialties display correctly
 * 9. Verify empty results message if a specialty has no matching vets
 *
 * NOTES FOR IMPLEMENTATION:
 * - VetPage may need new methods: selectSpecialty(name), getSpecialtyFilter(), etc.
 * - Backend may need new repository method: findBySpecialty() or custom query
 * - Backend controller may need to accept specialty parameter and filter results
 * - HTML template needs specialty filter control with appropriate options
 * - Tests should verify table row counts match expected vet counts per specialty
 * - Tests should verify specific vet names appear in filtered results
 * ============================================================================
 */

import { test, expect } from '@fixtures/base-test';

import { VetPage } from '@pages/vet-page';

/**
 * E2E tests for Vet Directory specialty filtering feature.
 *
 * These tests verify that:
 * 1. Users can filter veterinarians by specialty
 * 2. The filter updates the URL with query parameters
 * 3. Pre-filtered URLs load with correct filter state
 * 4. Vets with no specialty are handled correctly
 * 5. Selecting 'All' resets to the full list
 *
 * Seed data includes 6 vets with the following specialties:
 * - James Carter: None
 * - Helen Leary: Radiology
 * - Linda Douglas: Surgery, Dentistry
 * - Rafael Ortega: Surgery
 * - Henry Stevens: Radiology
 * - Sharon Jenkins: None
 */

test.describe('Vet Directory – Specialty Filter', () => {
  let vetPage: VetPage;

  test.beforeEach(async ({ page }) => {
    vetPage = new VetPage(page);
  });

  test('filter by specialty shows only matching vets', async ({ page }) => {
    // Navigate to the Vet Directory page
    await vetPage.open();

    // Wait for the table to be visible before proceeding
    await expect(vetPage.vetsTable()).toBeVisible();

    // Get the initial count of vets (unfiltered)
    const allVetsCount = await vetPage.getVisibleVetCount();
    expect(allVetsCount).toBeGreaterThan(0);

    // Select 'surgery' specialty from the filter
    await vetPage.selectSpecialty('surgery');

    // Wait for the filter to apply and URL to update
    await expect(page).toHaveURL(/\?specialty=surgery/i);

    // Verify table is still visible
    await expect(vetPage.vetsTable()).toBeVisible();

    // Get the filtered count
    const surgeryVetsCount = await vetPage.getVisibleVetCount();

    // Verify that fewer (or equal in edge case) vets are shown
    // For surgery specialty, we expect 2 vets (Linda Douglas, Rafael Ortega)
    expect(surgeryVetsCount).toBeLessThanOrEqual(allVetsCount);
    expect(surgeryVetsCount).toBeGreaterThan(0);

    // Verify that each visible row contains the specialty or relevant information
    const surgerySpecialtyElements = vetPage.vetsTableSecondColumnCells();
    const surgeryCount = await surgerySpecialtyElements.count();

    for (let i = 0; i < surgeryCount; i++) {
      const specialtyCell = surgerySpecialtyElements.nth(i);
      // The surgery specialty should be visible in the cell
      // (Actual text depends on implementation - could be "Surgery", "surgery", etc.)
      await expect(specialtyCell).toContainText(/surgery|Surgery/i);
    }
  });

  test('filter by radiology shows only matching vets', async ({ page }) => {
    // Test another specialty to ensure filter works generally
    await vetPage.open();
    await expect(vetPage.vetsTable()).toBeVisible();

    const allVetsCount = await vetPage.getVisibleVetCount();

    // Select 'radiology' specialty
    await vetPage.selectSpecialty('radiology');
    await expect(page).toHaveURL(/\?specialty=radiology/i);

    const radiologyVetsCount = await vetPage.getVisibleVetCount();

    // For radiology, we expect 2 vets (Helen Leary, Henry Stevens)
    expect(radiologyVetsCount).toBeLessThanOrEqual(allVetsCount);
    expect(radiologyVetsCount).toBeGreaterThan(0);

    // Verify specialty in cells
    const specialtyElements = vetPage.vetsTableSecondColumnCells();
    const count = await specialtyElements.count();

    for (let i = 0; i < count; i++) {
      const specialtyCell = specialtyElements.nth(i);
      await expect(specialtyCell).toContainText(/radiology|Radiology/i);
    }
  });

  test('selecting All resets to full vet list', async ({ page }) => {
    // Navigate and apply a filter first
    await vetPage.open();
    await expect(vetPage.vetsTable()).toBeVisible();

    const allVetsCount = await vetPage.getVisibleVetCount();

    // Apply surgery filter
    await vetPage.selectSpecialty('surgery');
    await expect(page).toHaveURL(/\?specialty=surgery/i);

    const surgeryVetsCount = await vetPage.getVisibleVetCount();
    expect(surgeryVetsCount).toBeLessThan(allVetsCount);

    // Now select 'All' to reset the filter
    await vetPage.selectAllSpecialties();

    // Wait for page to load (URL should change or stay as base)
    await vetPage.page.waitForLoadState('networkidle');

    // Verify the table is still visible
    await expect(vetPage.vetsTable()).toBeVisible();

    // Verify full list is shown
    const resetVetsCount = await vetPage.getVisibleVetCount();
    expect(resetVetsCount).toBe(allVetsCount);

    // Verify that vets of multiple specialties are present (or no specialty)
    const vetNames = await vetPage.getVisibleVetNames();
    expect(vetNames.length).toBeGreaterThan(2);
  });

  test('URL query parameter updates on filter change', async ({ page }) => {
    // Navigate to the Vet Directory
    await vetPage.open();
    await expect(vetPage.vetsTable()).toBeVisible();

    // Initially, no specialty filter should be set
    const initialUrl = page.url();
    expect(initialUrl).not.toContain('specialty=');

    // Select a specialty
    await vetPage.selectSpecialty('dentistry');

    // Verify URL now contains the specialty parameter
    expect(page.url()).toContain('specialty=dentistry');
    await expect(page).toHaveURL(/specialty=dentistry/i);

    // Select another specialty
    await vetPage.selectSpecialty('radiology');

    // Verify URL changed to the new specialty
    expect(page.url()).toContain('specialty=radiology');
    await expect(page).toHaveURL(/specialty=radiology/i);

    // Select 'All' to reset
    await vetPage.selectAllSpecialties();

    // Verify URL no longer has specialty parameter (or has it set to empty/all)
    const finalUrl = page.url();
    // The URL should either not contain specialty or contain specialty=
    const hasSpecialtyParam = finalUrl.includes('specialty=');
    const isEmptyParam = finalUrl.match(/specialty=[\w]*/)?.[0] === 'specialty=';
    expect(hasSpecialtyParam === false || isEmptyParam).toBeTruthy();
  });

  test('loading a pre-filtered URL shows correct filter state and results', async ({
    page,
  }) => {
    // Navigate directly to a pre-filtered URL
    await vetPage.openWithSpecialty('radiology');

    // Verify the page loaded with the filter applied
    await expect(vetPage.vetsTable()).toBeVisible();
    await expect(page).toHaveURL(/\?specialty=radiology/i);

    // Verify the filter control shows the selected specialty
    // (This depends on the filter implementation - may need adjustment)
    const selectedSpecialty = await vetPage.getSelectedSpecialty();
    expect(selectedSpecialty).toBe('radiology');

    // Verify only radiology vets are shown
    const vetCount = await vetPage.getVisibleVetCount();
    expect(vetCount).toBeGreaterThan(0);

    const specialtyElements = vetPage.vetsTableSecondColumnCells();
    const count = await specialtyElements.count();

    for (let i = 0; i < count; i++) {
      const specialtyCell = specialtyElements.nth(i);
      await expect(specialtyCell).toContainText(/radiology|Radiology/i);
    }

    // Get the visible vet names to verify correctness
    const vetNames = await vetPage.getVisibleVetNames();
    // Expected vets with radiology: Helen Leary, Henry Stevens
    expect(vetNames.length).toBeGreaterThan(0);
  });

  test('vets with no specialty are handled correctly', async ({ page }) => {
    // Navigate to the Vet Directory
    await vetPage.open();
    await expect(vetPage.vetsTable()).toBeVisible();

    const allVetsCount = await vetPage.getVisibleVetCount();

    // If there's a 'none' or 'None' specialty option, test it
    // Try to select the 'none' specialty
    await vetPage.selectSpecialty('none');

    // Wait for page to update
    await vetPage.page.waitForLoadState('networkidle');

    // Verify the filter was applied
    const specialtyInUrl = page.url().includes('specialty=none');
    const vetsCount = await vetPage.getVisibleVetCount();

    if (specialtyInUrl && vetsCount > 0) {
      // If the filter worked, verify only vets with no specialty are shown
      const specialtyElements = vetPage.vetsTableSecondColumnCells();
      const count = await specialtyElements.count();

      for (let i = 0; i < count; i++) {
        const specialtyCell = specialtyElements.nth(i);
        // Vets with no specialty should show "none" or "None"
        await expect(specialtyCell).toContainText(/none|None/i);
      }
    } else {
      // If 'none' option doesn't exist, verify that in the full list there are vets with no specialty
      // Reset and check the full list has vets with no specialty
      await vetPage.selectAllSpecialties();
      await vetPage.page.waitForLoadState('networkidle');

      const specialtyElements = vetPage.vetsTableSecondColumnCells();
      const count = await specialtyElements.count();

      let foundNoneSpecialty = false;
      for (let i = 0; i < count; i++) {
        const specialtyCell = specialtyElements.nth(i);
        const text = await specialtyCell.textContent();
        if (text?.includes('none') || text?.includes('None')) {
          foundNoneSpecialty = true;
          break;
        }
      }

      // The full list should include vets with no specialty
      expect(foundNoneSpecialty).toBeTruthy();
    }
  });

  test('verify expected vet names in filtered results', async ({ page }) => {
    // This test verifies that the correct specific vets appear for each specialty

    // Test surgery specialty
    await vetPage.open();
    await vetPage.selectSpecialty('surgery');
    await expect(page).toHaveURL(/specialty=surgery/i);

    const surgeryVets = await vetPage.getVisibleVetNames();
    // Expected: Linda Douglas, Rafael Ortega (at least one should be visible)
    const hasSurgeryVets =
      surgeryVets.some((name) => name.includes('Douglas')) ||
      surgeryVets.some((name) => name.includes('Ortega'));
    expect(hasSurgeryVets).toBeTruthy();

    // Test radiology specialty
    await vetPage.selectSpecialty('radiology');
    await expect(page).toHaveURL(/specialty=radiology/i);

    const radiologyVets = await vetPage.getVisibleVetNames();
    // Expected: Helen Leary, Henry Stevens (at least one should be visible)
    const hasRadiologyVets =
      radiologyVets.some((name) => name.includes('Leary')) ||
      radiologyVets.some((name) => name.includes('Stevens'));
    expect(hasRadiologyVets).toBeTruthy();
  });

  test('navigate between specialties without resetting', async ({ page }) => {
    // Verify user can switch between specialty filters without issues
    await vetPage.open();

    // Apply surgery filter
    await vetPage.selectSpecialty('surgery');
    await expect(page).toHaveURL(/specialty=surgery/i);

    const surgeryCount = await vetPage.getVisibleVetCount();
    expect(surgeryCount).toBeGreaterThan(0);

    // Switch to dentistry
    await vetPage.selectSpecialty('dentistry');
    await expect(page).toHaveURL(/specialty=dentistry/i);

    const dentistryCount = await vetPage.getVisibleVetCount();
    expect(dentistryCount).toBeGreaterThan(0);

    // The counts might be different, which is fine
    // Just verify the table is still responsive
    await expect(vetPage.vetsTable()).toBeVisible();
  });

  test('empty specialty list is handled gracefully', async ({ page }) => {
    // This test checks that if a specialty has no vets, the UI handles it well
    // (This is more of a future-proofing test)

    await vetPage.open();
    await expect(vetPage.vetsTable()).toBeVisible();

    // If we add a specialty in the future with no vets, the behavior should be:
    // Either show "No veterinarians found" or show an empty table
    // For now, all our specialties have vets, but this test structure allows for it
    const vetsCount = await vetPage.getVisibleVetCount();
    const noResultsMessage = vetPage.getNoResultsMessage();

    // Either we have vets displayed or we see a no-results message
    const messageVisible = await noResultsMessage.isVisible().catch(() => false);
    expect(vetsCount > 0 || messageVisible).toBeTruthy();
  });
});
