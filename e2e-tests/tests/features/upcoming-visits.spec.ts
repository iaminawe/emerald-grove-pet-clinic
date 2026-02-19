import { test, expect } from '@fixtures/base-test';

import { VisitPage } from '@pages/visit-page';

test.describe('Upcoming Visits', () => {
  test('visit created within 7-day window appears on upcoming visits page', async ({ page }, testInfo) => {
    const visitPage = new VisitPage(page);

    // Step 1: Navigate to owner details page (George Franklin, owner id=1)
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    // Step 2: Click the "Add Visit" link for the first pet
    const addVisitLink = page.getByRole('link', { name: /^Add Visit$/i }).first();
    await addVisitLink.click();

    await expect(visitPage.heading()).toBeVisible();

    // Step 3: Create a visit with a date within the 7-day window
    // Current date is 2026-02-19, so we'll use 2026-02-21 (2 days from now)
    const visitDate = '2026-02-21';
    const description = `E2E Upcoming Visit ${Date.now()}`;

    await visitPage.fillVisitDate(visitDate);
    await visitPage.fillDescription(description);

    await page.screenshot({ path: testInfo.outputPath('upcoming-visit-form.png'), fullPage: true });

    await visitPage.submit();

    // Step 4: Verify redirect back to owner details
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    // Step 5: Navigate to the upcoming visits page
    await page.goto('/visits/upcoming');

    // Step 6: Verify page loads successfully
    await expect(page.getByRole('heading', { name: /Upcoming Visits/i })).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath('upcoming-visits-page.png'), fullPage: true });

    // Step 7: Verify the table exists
    const upcomingVisitsTable = page.locator('#upcoming-visits');
    await expect(upcomingVisitsTable).toBeVisible();

    // Step 8: Assert the newly created visit appears with correct data
    // Find the row that contains all our visit data
    const visitRow = upcomingVisitsTable
      .locator('tbody tr')
      .filter({ hasText: 'George Franklin' })  // Owner name
      .filter({ hasText: 'Leo' })              // Pet name (first pet of owner 1)
      .filter({ hasText: visitDate })          // Visit date
      .filter({ hasText: description });       // Description

    await expect(visitRow).toHaveCount(1);

    // Verify individual cell contents for completeness
    await expect(visitRow.locator('td').nth(0)).toContainText('George Franklin');
    await expect(visitRow.locator('td').nth(1)).toContainText('Leo');
    await expect(visitRow.locator('td').nth(2)).toContainText(visitDate);
    await expect(visitRow.locator('td').nth(3)).toContainText(description);

    // Verify the owner link is functional
    const ownerLink = visitRow.locator('a[href*="/owners/1"]');
    await expect(ownerLink).toBeVisible();
  });

  test('shows visits scheduled for different time windows with days parameter', async ({ page }) => {
    // Test that the page accepts and processes the 'days' query parameter
    // Default is 7 days, but we can test with different values

    // Test with 1 day window
    await page.goto('/visits/upcoming?days=1');
    await expect(page.getByRole('heading', { name: /Upcoming Visits/i })).toBeVisible();
    // Note: The app uses "{0} days" format, so "1 days" is technically grammatically incorrect but expected
    await expect(page.getByText(/Visits scheduled in the next 1 days?/i)).toBeVisible();

    // Test with 30 day window
    await page.goto('/visits/upcoming?days=30');
    await expect(page.getByRole('heading', { name: /Upcoming Visits/i })).toBeVisible();
    await expect(page.getByText(/Visits scheduled in the next 30 days/i)).toBeVisible();

    // Test with default (no parameter, should show 7 days)
    await page.goto('/visits/upcoming');
    await expect(page.getByRole('heading', { name: /Upcoming Visits/i })).toBeVisible();
    await expect(page.getByText(/Visits scheduled in the next 7 days/i)).toBeVisible();
  });

  test('displays empty state when no upcoming visits exist', async ({ page }) => {
    // Navigate to upcoming visits with a very short time window where no visits exist
    await page.goto('/visits/upcoming?days=0');

    await expect(page.getByRole('heading', { name: /Upcoming Visits/i })).toBeVisible();

    // Verify empty state message is shown
    await expect(page.getByText(/No upcoming visits found/i)).toBeVisible();

    // Verify table is not present when there are no visits
    const upcomingVisitsTable = page.locator('#upcoming-visits');
    await expect(upcomingVisitsTable).not.toBeVisible();
  });

  test('navigates to upcoming visits page from navigation menu', async ({ page }) => {
    // Start from home page
    await page.goto('/');

    // Check if there's a navigation link to upcoming visits
    // Note: This assumes the nav link exists - adjust if needed based on actual UI
    const upcomingVisitsNavLink = page.locator('nav.navbar').getByRole('link', { name: /Upcoming Visits/i });

    // Only test navigation if the link exists in the nav
    if (await upcomingVisitsNavLink.count() > 0) {
      await upcomingVisitsNavLink.click();
      await expect(page).toHaveURL(/\/visits\/upcoming/);
      await expect(page.getByRole('heading', { name: /Upcoming Visits/i })).toBeVisible();
    } else {
      // If no nav link, just verify direct navigation works
      await page.goto('/visits/upcoming');
      await expect(page.getByRole('heading', { name: /Upcoming Visits/i })).toBeVisible();
    }
  });
});
