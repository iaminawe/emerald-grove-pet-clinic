import { test, expect } from '@fixtures/base-test';

import { OwnerPage } from '@pages/owner-page';
import { createOwner } from '@utils/data-factory';
import { createPet } from '@utils/pet-factory';

test.describe('Delete Pet', () => {
  test('can create a pet, delete it via confirm dialog, and verify removal', async ({ page }, testInfo) => {
    const ownerPage = new OwnerPage(page);
    const owner = createOwner();
    const pet = createPet({ type: 'dog' });

    // ── Step 1: Create a fresh owner so the test is fully isolated ──────────
    await ownerPage.openFindOwners();
    await ownerPage.clickAddOwner();
    await ownerPage.fillOwnerForm(owner);
    await ownerPage.submitOwnerForm();

    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    // ── Step 2: Add a new pet to this owner ─────────────────────────────────
    await page.getByRole('link', { name: /Add New Pet/i }).click();

    await page.locator('input#name').fill(pet.name);
    await page.locator('input#birthDate').fill(pet.birthDate);
    await page.locator('select#type').selectOption({ label: pet.type });

    await page.screenshot({
      path: testInfo.outputPath('01-pet-form-filled.png'),
      fullPage: true,
    });

    await page.getByRole('button', { name: /Add Pet/i }).click();

    // ── Step 3: Confirm the pet appears on the owner details page ───────────
    await expect(page.getByRole('heading', { name: /Pets and Visits/i })).toBeVisible();
    await expect(page.getByText(pet.name, { exact: true })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('02-pet-visible-on-owner-details.png'),
      fullPage: true,
    });

    // Locate the table row that contains our pet (the <tr> wrapping the <dd>
    // with the pet name).  The ownerDetails template renders one <tr> per pet,
    // each containing a <dl> with <dd> elements for name, birth date, and type.
    const petRow = page.locator('tr').filter({
      has: page.locator('dd', { hasText: pet.name }),
    });

    await expect(petRow).toBeVisible();

    // ── Step 4: Delete the pet ──────────────────────────────────────────────
    // The delete button triggers a native window.confirm() dialog via the
    // form's onsubmit handler.  We must register the dialog handler *before*
    // clicking so Playwright can intercept it.
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Are you sure you want to delete this pet?');
      await dialog.accept();
    });

    await petRow.getByRole('button', { name: /Delete Pet/i }).click();

    // ── Step 5: Wait for navigation back to owner details and capture proof ─
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('03-after-delete-confirmation.png'),
      fullPage: true,
    });

    // ── Step 6: Assert the pet is no longer present ─────────────────────────
    await expect(page.getByText(pet.name, { exact: true })).not.toBeVisible();

    // Also verify the entire pet row is gone
    await expect(petRow).not.toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('04-pet-removed-from-owner-details.png'),
      fullPage: true,
    });
  });

  test('dismissing the confirm dialog does NOT delete the pet', async ({ page }) => {
    const ownerPage = new OwnerPage(page);
    const owner = createOwner();
    const pet = createPet({ type: 'cat' });

    // Create owner + pet
    await ownerPage.openFindOwners();
    await ownerPage.clickAddOwner();
    await ownerPage.fillOwnerForm(owner);
    await ownerPage.submitOwnerForm();

    await page.getByRole('link', { name: /Add New Pet/i }).click();

    await page.locator('input#name').fill(pet.name);
    await page.locator('input#birthDate').fill(pet.birthDate);
    await page.locator('select#type').selectOption({ label: pet.type });
    await page.getByRole('button', { name: /Add Pet/i }).click();

    await expect(page.getByText(pet.name, { exact: true })).toBeVisible();

    const petRow = page.locator('tr').filter({
      has: page.locator('dd', { hasText: pet.name }),
    });

    // Dismiss (cancel) the confirmation dialog — pet should remain
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await petRow.getByRole('button', { name: /Delete Pet/i }).click();

    // Pet should still be present because we cancelled the dialog
    await expect(page.getByText(pet.name, { exact: true })).toBeVisible();
    await expect(petRow).toBeVisible();
  });
});
