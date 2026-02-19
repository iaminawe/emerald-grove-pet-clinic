import { test, expect } from '../fixtures/base-test';

import { OwnerPage } from '../pages/owner-page';

test('OwnerPage can search owners by last name and open owner details', async ({ page }, testInfo) => {
  const ownerPage = new OwnerPage(page);

  await ownerPage.openFindOwners();
  await ownerPage.searchByLastName('Davis');

  const ownersTable = ownerPage.ownersTable();
  await expect(ownersTable).toBeVisible();
  await expect(ownersTable.locator('tbody tr')).toHaveCount(5);

  await ownerPage.openOwnerDetailsByName('Betty Davis');
  await expect(ownerPage.heading().filter({ hasText: /Owner Information/i })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('owner-details.png'), fullPage: true });
});
