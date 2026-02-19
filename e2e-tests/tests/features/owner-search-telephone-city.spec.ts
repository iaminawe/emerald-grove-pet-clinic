import { test, expect } from '@fixtures/base-test';

import { OwnerPage } from '@pages/owner-page';
import { createOwner } from '@utils/data-factory';

test.describe('Find Owners by Telephone and City', () => {
  let ownerPage: OwnerPage;
  const owner = createOwner({ city: 'SpringfieldE2E' });

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    ownerPage = new OwnerPage(page);

    // Create a new owner with known telephone and city values
    await ownerPage.openFindOwners();
    await ownerPage.clickAddOwner();
    await ownerPage.fillOwnerForm(owner);
    await ownerPage.submitOwnerForm();

    // Verify the owner was created successfully
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await expect(
      page.getByRole('cell', { name: `${owner.firstName} ${owner.lastName}` }),
    ).toBeVisible();

    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    ownerPage = new OwnerPage(page);
    await ownerPage.openFindOwners();
  });

  test('finds the owner when searching by telephone only', async ({ page }) => {
    await ownerPage.searchByTelephone(owner.telephone);

    // With a unique telephone, exactly one result is expected → redirect to details
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await expect(
      page.getByRole('cell', { name: `${owner.firstName} ${owner.lastName}` }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: owner.telephone })).toBeVisible();
  });

  test('finds the owner when searching by city only', async ({ page }) => {
    await ownerPage.searchByCity(owner.city);

    // City search is a substring match — the owner should appear in results
    // If only one match, we get redirected to details; otherwise results table
    const onDetailsPage = page.getByRole('heading', { name: /Owner Information/i });
    const onResultsPage = ownerPage.ownersTable();

    await expect(onDetailsPage.or(onResultsPage)).toBeVisible();

    if (await onDetailsPage.isVisible()) {
      await expect(
        page.getByRole('cell', { name: `${owner.firstName} ${owner.lastName}` }),
      ).toBeVisible();
    } else {
      await expect(
        onResultsPage.getByRole('link', { name: `${owner.firstName} ${owner.lastName}` }),
      ).toBeVisible();
    }
  });

  test('finds the owner when searching by telephone and city combined', async ({ page }) => {
    await ownerPage.searchByTelephoneAndCity(owner.telephone, owner.city);

    // Combined search with unique telephone → single result → redirect to details
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await expect(
      page.getByRole('cell', { name: `${owner.firstName} ${owner.lastName}` }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: owner.city })).toBeVisible();
    await expect(page.getByRole('cell', { name: owner.telephone })).toBeVisible();
  });

  test('shows validation error for non-numeric telephone and does not return results', async ({
    page,
  }) => {
    await ownerPage.searchByTelephone('abc-invalid');

    // The controller rejects non-numeric telephone with a validation error
    await expect(
      page.getByText(/Telephone must contain only numeric characters/i),
    ).toBeVisible();

    // Verify we remain on the Find Owners page (no results returned)
    await expect(page.getByRole('heading', { name: /Find Owners/i })).toBeVisible();

    // The owners table should NOT be visible (no results)
    await expect(ownerPage.ownersTable()).not.toBeVisible();
  });
});
