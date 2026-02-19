import { test, expect } from '@fixtures/base-test';

import { VetPage } from '@pages/vet-page';

test.describe('Vet Directory', () => {
  test('can browse veterinarian list and view specialties', async ({ page }, testInfo) => {
    const vetPage = new VetPage(page);

    await vetPage.open();

    await expect(vetPage.vetsTable()).toBeVisible();

    // This test relies on Petclinic's startup seed data providing vets.
    const rows = vetPage.vetsTable().locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount, 'Expected seeded veterinarians to be present').toBeGreaterThan(0);

    await page.screenshot({ path: testInfo.outputPath('vet-directory.png'), fullPage: true });

    // Validate each row's specialty cell contains a known specialty or "none".
    for (let i = 0; i < rowCount; i++) {
      const specialtyCell = rows.nth(i).locator('td').nth(1);
      await expect(specialtyCell).toContainText(/none|surgery|dentistry|radiology|medicine/i);
    }
  });

  test.describe('Specialty Filter', () => {
    test('displays specialty filter dropdown with All option', async ({ page }) => {
      const vetPage = new VetPage(page);
      await vetPage.open();

      const filter = vetPage.specialtyFilter();
      await expect(filter).toBeVisible();

      // The first option should be the "All" option with an empty value
      const allOption = filter.locator('option[value=""]');
      await expect(allOption).toBeAttached();
    });

    test('filters vets by a specific specialty', async ({ page }, testInfo) => {
      const vetPage = new VetPage(page);
      await vetPage.open();

      // Select "radiology" from the filter dropdown
      await vetPage.selectSpecialty('radiology');

      // Wait for page to reload with the filter applied
      await expect(vetPage.vetsTable()).toBeVisible();

      const rows = vetPage.vetRows();
      const rowCount = await rows.count();
      expect(rowCount, 'Expected at least one vet with radiology specialty').toBeGreaterThan(0);

      // Every displayed vet should have "radiology" in their specialty column
      for (let i = 0; i < rowCount; i++) {
        const specialtyCell = rows.nth(i).locator('td').nth(1);
        await expect(specialtyCell).toContainText(/radiology/i);
      }

      // Verify the query parameter is in the URL
      expect(page.url()).toContain('specialty=radiology');

      await page.screenshot({ path: testInfo.outputPath('vet-filter-radiology.png'), fullPage: true });
    });

    test('filters to show vets with no specialties using "none" option', async ({ page }, testInfo) => {
      const vetPage = new VetPage(page);
      await vetPage.open();

      // Select "none" from the filter dropdown
      await vetPage.selectSpecialty('none');

      await expect(vetPage.vetsTable()).toBeVisible();

      const rows = vetPage.vetRows();
      const rowCount = await rows.count();
      expect(rowCount, 'Expected at least one vet with no specialties').toBeGreaterThan(0);

      // Every displayed vet should show "none" in their specialty column
      for (let i = 0; i < rowCount; i++) {
        const specialtyCell = rows.nth(i).locator('td').nth(1);
        await expect(specialtyCell).toContainText(/none/i);
      }

      expect(page.url()).toContain('specialty=none');

      await page.screenshot({ path: testInfo.outputPath('vet-filter-none.png'), fullPage: true });
    });

    test('resets filter when "All" is selected', async ({ page }) => {
      const vetPage = new VetPage(page);

      // Start with a filtered view
      await vetPage.openWithSpecialty('radiology');
      await expect(vetPage.vetsTable()).toBeVisible();

      const filteredCount = await vetPage.vetRows().count();

      // Select "All" to reset the filter
      await vetPage.selectSpecialty('');
      await expect(vetPage.vetsTable()).toBeVisible();

      const allCount = await vetPage.vetRows().count();
      expect(allCount, 'All vets should be >= filtered count').toBeGreaterThanOrEqual(filteredCount);
    });

    test('supports shareable filtered URLs via query parameter', async ({ page }) => {
      const vetPage = new VetPage(page);

      // Navigate directly to a filtered URL
      await vetPage.openWithSpecialty('radiology');

      await expect(vetPage.vetsTable()).toBeVisible();

      // The filter dropdown should reflect the applied filter
      const filter = vetPage.specialtyFilter();
      await expect(filter).toHaveValue('radiology');

      // All visible vets should match the filter
      const rows = vetPage.vetRows();
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      for (let i = 0; i < rowCount; i++) {
        const specialtyCell = rows.nth(i).locator('td').nth(1);
        await expect(specialtyCell).toContainText(/radiology/i);
      }
    });
  });
});
