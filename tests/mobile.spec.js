import { test, expect } from '@playwright/test';
import { openHome, trackErrors } from './helpers';

test.describe('Mobile', () => {
  test('full-screen menu opens, traps focus, navigates and closes', async ({ page }) => {
    const errors = trackErrors(page);
    await openHome(page);
    const burger = page.getByRole('button', { name: 'Menu' });
    await expect(burger).toBeVisible();
    await burger.click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: /Projects/ })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await burger.click();
    await dialog.getByRole('link', { name: /Skills/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('#skills')).toBeInViewport();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('skills use the bento grid and the gallery is vertical', async ({ page }) => {
    await openHome(page);
    await expect(page.getByRole('tablist')).toBeHidden();
    await expect(page.locator('#skills li[data-reveal]')).toHaveCount(6);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
  });
});
