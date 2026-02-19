import { test, expect } from '@fixtures/base-test';

import { OwnerPage } from '@pages/owner-page';
import { createOwner } from '@utils/data-factory';

test.describe('Find Owners by Telephone and City', () => {
  /**
   * Shared owner data: created once per worker via a beforeAll hook so that every
   * test in this describe block can search for the same owner.  Using a unique
   * city value avoids false positives from pre-seeded data.
   */
  const owner = createOwner({ city: `UniqueCity${Date.now()}` });

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const ownerPage = new OwnerPage(page);

    await ownerPage.openFindOwners();
    await ownerPage.clickAddOwner();
    await ownerPage.fillOwnerForm(owner);
    await ownerPage.submitOwnerForm();

    // Wait for redirect to the new owner's detail page
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await page.close();
  });

  // -----------------------------------------------------------------
  // Happy-path scenarios
  // -----------------------------------------------------------------

  test('finds the owner when searching by telephone only', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    await ownerPage.openFindOwners();
    await ownerPage.searchByTelephone(owner.telephone);

    // A single match redirects straight to the owner detail page
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await expect(page.getByText(owner.firstName)).toBeVisible();
    await expect(page.getByText(owner.lastName)).toBeVisible();
    await expect(page.getByText(owner.telephone)).toBeVisible();
  });

  test('finds the owner when searching by city only', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    await ownerPage.openFindOwners();
    await ownerPage.searchByCity(owner.city);

    // Unique city ⇒ single result ⇒ redirect to detail page
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await expect(page.getByText(owner.firstName)).toBeVisible();
    await expect(page.getByText(owner.city)).toBeVisible();
  });

  test('finds the owner when searching by telephone and city combined', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    await ownerPage.openFindOwners();
    await ownerPage.searchByTelephoneAndCity(owner.telephone, owner.city);

    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await expect(page.getByText(owner.firstName)).toBeVisible();
    await expect(page.getByText(owner.telephone)).toBeVisible();
    await expect(page.getByText(owner.city)).toBeVisible();
  });

  // -----------------------------------------------------------------
  // Validation / negative scenario
  // -----------------------------------------------------------------

  test('shows validation error for an invalid (non-numeric) telephone', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    await ownerPage.openFindOwners();
    await ownerPage.searchByTelephone('abc-invalid');

    // The controller rejects non-numeric telephone values with an inline error
    await expect(
      page.getByText(/Telephone must contain only numeric characters/i),
    ).toBeVisible();

    // The owners table / owner detail page must NOT be shown
    await expect(ownerPage.ownersTable()).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Owner Information/i }),
    ).not.toBeVisible();
  });

  test('returns "not found" when telephone does not match any owner', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    await ownerPage.openFindOwners();
    // Use a valid 10-digit number that is extremely unlikely to exist
    await ownerPage.searchByTelephone('0000000001');

    // Should stay on Find Owners page with "not found" feedback
    await expect(page.getByRole('heading', { name: /Find Owners/i })).toBeVisible();
    await expect(ownerPage.ownersTable()).not.toBeVisible();
  });
});
