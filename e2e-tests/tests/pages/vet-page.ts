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

  vetRows(): Locator {
    return this.vetsTable().locator('tbody tr');
  }

  specialtyFilter(): Locator {
    return this.page.locator('select#specialty');
  }

  async selectSpecialty(value: string): Promise<void> {
    await this.specialtyFilter().selectOption(value);
    await this.heading().waitFor();
  }

  async open(): Promise<void> {
    await this.goto('/vets.html');
    await this.heading().waitFor();
  }

  async openWithSpecialty(specialty: string): Promise<void> {
    await this.goto(`/vets.html?specialty=${encodeURIComponent(specialty)}`);
    await this.heading().waitFor();
  }
}
