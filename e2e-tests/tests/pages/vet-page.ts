import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

export class VetPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  heading(): Locator {
    return this.page.getByRole('heading', { name: /Veterinarians/i });
  }

  vetsTable(): Locator {
    return this.page.locator('table#vets');
  }

  specialtyFilter(): Locator {
    // Try common selectors for the specialty filter control
    // Priority: data-testid > select > id
    return this.page.locator('[data-testid="specialty-filter"], select[name="specialty"], select#specialty').first();
  }

  vetsTableRows(): Locator {
    return this.vetsTable().locator('tbody tr');
  }

  vetsTableFirstColumnCells(): Locator {
    return this.vetsTable().locator('tbody tr td:first-child');
  }

  vetsTableSecondColumnCells(): Locator {
    return this.vetsTable().locator('tbody tr td:nth-child(2)');
  }

  async open(): Promise<void> {
    await this.goto('/vets.html');
    await this.heading().waitFor();
  }

  async openWithSpecialty(specialty: string): Promise<void> {
    await this.goto(`/vets.html?specialty=${specialty}`);
    await this.heading().waitFor();
  }

  async selectSpecialty(specialty: string): Promise<void> {
    const filterControl = this.specialtyFilter();
    await filterControl.selectOption(specialty);
    // Wait for page to update after filter change
    await this.page.waitForURL(/.*specialty=.*/);
  }

  async selectAllSpecialties(): Promise<void> {
    const filterControl = this.specialtyFilter();
    // Try to select "All" option (could be empty string, "all", or "All")
    await filterControl.selectOption({ label: /All/i }).catch(async () => {
      await filterControl.selectOption('');
    });
    // Wait for page to stabilize
    await this.page.waitForLoadState('networkidle');
  }

  async getVisibleVetCount(): Promise<number> {
    return this.vetsTableRows().count();
  }

  async getVisibleVetNames(): Promise<string[]> {
    const cells = this.vetsTableFirstColumnCells();
    const count = await cells.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cells.nth(i).textContent();
      names.push(text?.trim() || '');
    }
    return names;
  }

  async getSelectedSpecialty(): Promise<string | null> {
    const filterControl = this.specialtyFilter();
    return filterControl.inputValue();
  }

  async getNoResultsMessage(): Locator {
    return this.page.getByText(/No veterinarians found/i);
  }
}
