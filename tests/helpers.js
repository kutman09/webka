import { expect } from '@playwright/test';

/** Collect console errors and uncaught exceptions for a page. */
export function trackErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** Open the home page and wait until the preloader has handed over. */
export async function openHome(page, path = '/') {
  await page.goto(path);
  await expect(page.locator('[data-preloader]')).toHaveCount(0, { timeout: 15_000 });
}

/** Scroll an element into view through the real page scroll (Lenis follows native scroll). */
export async function scrollToSection(page, id) {
  await page.evaluate((sectionId) => {
    const element = document.getElementById(sectionId);
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY);
  }, id);
}
