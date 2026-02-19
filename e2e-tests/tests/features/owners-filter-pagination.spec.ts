import { test, expect } from '@fixtures/base-test';

import { OwnerPage } from '@pages/owner-page';

test.describe('Owner filter preservation across pagination', () => {
  test('filtered results are maintained when navigating between pages', async ({ page }, testInfo) => {
    const ownerPage = new OwnerPage(page);

    // Step 1: Navigate to Find Owners and search by "Davis"
    await ownerPage.openFindOwners();
    await ownerPage.searchByLastName('Davis');

    // Step 2: Verify initial filtered results on page 1
    const ownersTable = ownerPage.ownersTable();
    await expect(ownersTable).toBeVisible();

    // URL should contain the lastName filter parameter
    expect(page.url()).toContain('lastName=Davis');

    // All visible owner names should contain "Davis"
    const ownerLinks = ownersTable.locator('tbody tr td:first-child a');
    const count = await ownerLinks.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5); // page size is 5
    for (let i = 0; i < count; i++) {
      await expect(ownerLinks.nth(i)).toContainText('Davis');
    }

    // Verify pagination exists (we have 8 Davis owners = 2 pages)
    const pagination = page.locator('.liatrio-pagination');
    await expect(pagination).toBeVisible();

    // Verify the inline filter input shows the active filter
    const filterInput = page.locator('#filter-owner-form input#lastName');
    await expect(filterInput).toHaveValue('Davis');

    await page.screenshot({ path: testInfo.outputPath('owners-list-page1-filtered.png'), fullPage: true });

    // Step 3: Click page 2 to navigate forward
    await pagination.getByRole('link', { name: '2' }).click();

    // URL should still contain lastName=Davis and page=2
    expect(page.url()).toContain('lastName=Davis');
    expect(page.url()).toContain('page=2');

    // Results on page 2 should still be filtered
    await expect(ownersTable).toBeVisible();
    const page2Links = ownersTable.locator('tbody tr td:first-child a');
    const page2Count = await page2Links.count();
    expect(page2Count).toBeGreaterThan(0);
    for (let i = 0; i < page2Count; i++) {
      await expect(page2Links.nth(i)).toContainText('Davis');
    }

    // Inline filter input should still show "Davis"
    await expect(filterInput).toHaveValue('Davis');

    // Take screenshot of page 2 with active filter
    await page.screenshot({ path: testInfo.outputPath('owners-list-page2-filtered.png'), fullPage: true });

    // Step 4: Navigate back to page 1
    await pagination.getByRole('link', { name: '1' }).click();

    // URL should still contain lastName=Davis and page=1
    expect(page.url()).toContain('lastName=Davis');
    expect(page.url()).toContain('page=1');

    // Results should still be filtered
    await expect(ownersTable).toBeVisible();
    const backPage1Links = ownersTable.locator('tbody tr td:first-child a');
    const backPage1Count = await backPage1Links.count();
    expect(backPage1Count).toBe(5); // page 1 should have 5 Davis owners
    for (let i = 0; i < backPage1Count; i++) {
      await expect(backPage1Links.nth(i)).toContainText('Davis');
    }

    // Inline filter input should still show "Davis"
    await expect(filterInput).toHaveValue('Davis');
  });

  test('navigating via first/last pagination buttons preserves filter', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    // Navigate directly to page 1 of Davis-filtered results
    await page.goto('/owners?page=1&lastName=Davis');
    const ownersTable = ownerPage.ownersTable();
    await expect(ownersTable).toBeVisible();

    const pagination = page.locator('.liatrio-pagination');

    // Click the "next" (forward arrow) button
    await pagination.locator('a.fa-step-forward').click();

    expect(page.url()).toContain('lastName=Davis');
    expect(page.url()).toContain('page=2');

    // All owners on page 2 should be Davis
    const ownerLinks = ownersTable.locator('tbody tr td:first-child a');
    const count = await ownerLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(ownerLinks.nth(i)).toContainText('Davis');
    }

    // Click the "first" (fast-backward) button to go back to page 1
    await pagination.locator('a.fa-fast-backward').click();

    expect(page.url()).toContain('lastName=Davis');
    expect(page.url()).toContain('page=1');

    // Verify page 1 owners are all Davis
    const page1Links = ownersTable.locator('tbody tr td:first-child a');
    const page1Count = await page1Links.count();
    expect(page1Count).toBe(5);
    for (let i = 0; i < page1Count; i++) {
      await expect(page1Links.nth(i)).toContainText('Davis');
    }
  });

  test('clear filter button removes filter and shows all owners', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    // Start with filtered results
    await page.goto('/owners?page=1&lastName=Davis');
    const ownersTable = ownerPage.ownersTable();
    await expect(ownersTable).toBeVisible();

    // The filter input should show "Davis"
    const filterInput = page.locator('#filter-owner-form input#lastName');
    await expect(filterInput).toHaveValue('Davis');

    // Click the "Clear" link
    await page.locator('#filter-owner-form a.btn').click();

    // URL should no longer contain lastName=Davis
    expect(page.url()).not.toContain('lastName=Davis');

    // Should show all owners (not just Davis ones)
    await expect(ownersTable).toBeVisible();
    const ownerLinks = ownersTable.locator('tbody tr td:first-child a');
    const count = await ownerLinks.count();
    expect(count).toBe(5); // page size is 5, total owners > 5
  });
});
