import { test, expect } from '@playwright/test';

test.describe('Landing page button functionality', () => {
  const baseUrl = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    // Ensure landing page is loaded
    await expect(page).toHaveURL(`${baseUrl}/`);
  });

  const buttons = [
    { text: 'Sign In', expectsNavigation: true },
    { text: 'Get Started Free', expectsNavigation: true },
  ];

  for (const btn of buttons) {
    test(`Button "${btn.text}" works`, async ({ page }) => {
      const locator = page.getByRole('button', { name: btn.text });
      await expect(locator).toBeVisible({ timeout: 10000 });
      await locator.click();
      if (btn.expectsNavigation) {
        await expect(page).toHaveURL(/\/login/);
        // Navigate back to landing for next button
        await page.goto(baseUrl);
      }
    });
  }
});
