import { test, expect } from '@playwright/test';

test.describe('Farmer demo journey', () => {
  test('login page shows field journal messaging', async ({ page }) => {
    await page.goto('/farmer/login');
    await expect(
      page.getByRole('heading', {
        name: /Turn your next harvest into a confirmed opportunity/i,
      }),
    ).toBeVisible();
    await expect(page.getByLabel(/phone number or email/i)).toBeVisible();
  });

  test('list produce entry shows three input methods', async ({ page }) => {
    await page.goto('/farmer/list-produce');
    await expect(page.getByRole('link', { name: /Speak/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Type/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Fill form/i })).toBeVisible();
  });
});
