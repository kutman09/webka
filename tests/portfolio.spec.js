import { test, expect } from '@playwright/test';
import { openHome, scrollToSection, trackErrors } from './helpers';

test.describe('Home page', () => {
  test('loads with correct title, headline and no console errors', async ({ page }) => {
    const errors = trackErrors(page);
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await expect(page.locator('[data-preloader]')).toHaveCount(0, { timeout: 15_000 });
    await expect(page).toHaveTitle('Nurkalykov Kutman — Full-Stack & AI Developer');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Nurkalykov/i);
    for (const id of ['home', 'about', 'projects', 'skills', 'experience', 'lab', 'contact']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    // the WebGL stage (or its fallback) is mounted
    await expect(page.locator('[data-quality]')).not.toHaveAttribute('data-quality', 'pending');
    await page.waitForTimeout(1000);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('SEO essentials are present', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Bishkek, Kyrgyzstan/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /Nurkalykov Kutman/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    const jsonLd = JSON.parse(
      await page.locator('script[type="application/ld+json"]').first().textContent(),
    );
    expect(jsonLd['@type']).toBe('Person');
    expect(jsonLd.email).toBe('mailto:kutmann@gmail.com');
    expect((await request.get('/sitemap.xml')).status()).toBe(200);
    expect((await request.get('/robots.txt')).status()).toBe(200);
    expect((await request.get('/opengraph-image')).status()).toBe(200);
  });

  test('header navigation scrolls to sections and marks the active link', async ({ page }) => {
    await openHome(page);
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    await nav.getByRole('link', { name: 'About' }).click();
    await expect(page.locator('#about')).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'true');
    await nav.getByRole('link', { name: 'Contact' }).click();
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('keyboard users can skip to content', async ({ page }) => {
    await openHome(page);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('language switcher translates content and updates <html lang>', async ({ page }) => {
    await openHome(page);
    await page
      .getByRole('button', { name: /Русский/ })
      .first()
      .click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.locator('#about-title')).toContainText('Превращаю идеи');
    await page
      .getByRole('button', { name: /Кыргызча/ })
      .first()
      .click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ky');
    await expect(page.locator('#about-title')).toContainText('чындыкка');
    // the choice is remembered
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ky');
    await page
      .getByRole('button', { name: /English/ })
      .first()
      .click();
    await expect(page.locator('#about-title')).toContainText('Engineering ideas');
  });
});

test.describe('Projects', () => {
  test('gallery links to a detail page with stack, status and no fake links', async ({ page }) => {
    await openHome(page);
    await scrollToSection(page, 'projects');
    await page.getByRole('link', { name: 'Online Shop', exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/online-shop$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Online Shop');
    await expect(page.getByText('Django REST Framework').first()).toBeVisible();
    await expect(page.getByText('Personal project')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Source code' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Live demo' })).toHaveCount(0);
    await expect(page.getByText('Public links will be added when available.')).toBeVisible();
  });

  test('every project page renders', async ({ page }) => {
    const errors = trackErrors(page);
    for (const slug of [
      'online-shop',
      'otp-service',
      'instacopy',
      'delivery-app',
      'culture-kgz',
      'ai-experiments',
    ]) {
      const response = await page.goto(`/projects/${slug}`);
      expect(response.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('link', { name: /Next project/ })).toBeVisible();
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('unknown routes show the 404 page', async ({ page }) => {
    const response = await page.goto('/projects/does-not-exist');
    expect(response.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Signal lost.' })).toBeVisible();
  });
});

test.describe('Skills', () => {
  test('orbit tabs work with mouse and keyboard', async ({ page }) => {
    await openHome(page);
    await scrollToSection(page, 'skills');
    const tablist = page.getByRole('tablist');
    await tablist.getByRole('tab', { name: /Databases/ }).click();
    await expect(page.getByRole('tabpanel')).toContainText('PostgreSQL');
    await page.keyboard.press('ArrowDown');
    await expect(tablist.getByRole('tab', { name: /DevOps/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tabpanel')).toContainText('Docker');
  });
});

test.describe('Contact', () => {
  test('contact actions point to the right destinations', async ({ page }) => {
    await openHome(page);
    const contact = page.locator('#contact');
    await expect(contact.getByRole('link', { name: 'Contact via WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/996700700070',
    );
    await expect(contact.getByRole('link', { name: 'Send an Email' })).toHaveAttribute(
      'href',
      'mailto:kutmann@gmail.com',
    );
    await expect(contact.getByRole('link', { name: 'Call Me' })).toHaveAttribute(
      'href',
      'tel:+996700700070',
    );
  });

  test('copy email puts the address on the clipboard and confirms it', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openHome(page);
    await scrollToSection(page, 'contact');
    await page.getByTestId('copy-email').click();
    await expect(page.getByText('Email copied to clipboard')).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('kutmann@gmail.com');
  });

  test('form validates and hands the message to WhatsApp without faking a send', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__opened = [];
      window.open = (url) => {
        window.__opened.push(String(url));
        return null;
      };
    });
    await openHome(page);
    await scrollToSection(page, 'contact');
    const form = page.getByTestId('contact-form');
    await form.getByRole('button', { name: 'Continue in WhatsApp' }).click();
    await expect(form.getByText('Please enter your name.')).toBeVisible();
    await expect(form.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(form.getByLabel('Your name')).toBeFocused();

    await form.getByLabel('Your name').fill('Aida');
    await form.getByLabel('Email address').fill('aida@example.com');
    await form.getByLabel('Project type').selectOption('ai');
    await form
      .getByLabel('Your message')
      .fill('I would like to discuss a computer vision prototype.');
    await expect(form.getByText(/No mail server is connected/)).toBeVisible();
    await form.getByRole('button', { name: 'Continue in WhatsApp' }).click();

    const opened = await page.evaluate(() => window.__opened);
    expect(opened).toHaveLength(1);
    expect(opened[0]).toContain('https://wa.me/996700700070?text=');
    expect(decodeURIComponent(opened[0])).toContain('Project type: AI Project');
    await expect(page.getByText('Your message was opened in WhatsApp')).toBeVisible();
  });
});

test.describe('The Lab', () => {
  test('terminal runs allow-listed commands only', async ({ page }) => {
    await openHome(page);
    await scrollToSection(page, 'lab');
    const terminal = page.getByTestId('terminal');
    await expect(terminal).toBeVisible({ timeout: 15_000 });
    const input = page.getByLabel('Terminal command');

    await input.fill('help');
    await input.press('Enter');
    for (const command of ['about', 'skills', 'projects', 'contact', 'clear', 'whoami']) {
      await expect(terminal).toContainText(command);
    }

    await input.fill('whoami');
    await input.press('Enter');
    await expect(terminal).toContainText('nurkalykov.kutman');

    await input.fill('contact');
    await input.press('Enter');
    await expect(terminal).toContainText('kutmann@gmail.com');

    await input.fill('rm -rf /');
    await input.press('Enter');
    await expect(terminal).toContainText('command not found');

    await input.fill('cle');
    await input.press('Tab');
    await expect(input).toHaveValue('clear');
    await input.press('Enter');
    await expect(terminal.getByRole('log').locator('p')).toHaveCount(0);
  });

  test('neural network and particle experiments mount with controls', async ({ page }) => {
    await openHome(page);
    await scrollToSection(page, 'lab');
    await expect(page.getByRole('button', { name: 'Fire signal' })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: 'Fire signal' }).click();
    await page.getByLabel('Hidden layers').fill('3');
    await expect(page.getByRole('button', { name: 'Attract' })).toBeVisible();
    await page.getByRole('button', { name: 'NK' }).click();
    await expect(page.getByRole('button', { name: 'NK' })).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Resilience', () => {
  test('respects prefers-reduced-motion', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await openHome(page);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // horizontal pin is replaced by a vertical gallery
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await context.close();
  });

  test('the WebGL scene mounts a canvas when a quality tier is forced', async ({ page }) => {
    const errors = trackErrors(page);
    // headless Chromium renders WebGL in software, which the site treats as "static";
    // ?quality=low forces the real scene so it is exercised here
    await openHome(page, '/?quality=low');
    await expect(page.locator('[data-quality="low"] canvas')).toHaveCount(1);
    await scrollToSection(page, 'skills');
    await page.waitForTimeout(800);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('falls back to the CSS/SVG composition without WebGL', async ({ page }) => {
    const errors = trackErrors(page);
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
        if (/webgl/i.test(type)) return null;
        return original.call(this, type, ...args);
      };
    });
    await openHome(page);
    await expect(page.locator('[data-quality="static"]')).toHaveCount(1);
    await expect(page.locator('[data-quality="static"] svg')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('no horizontal overflow at any breakpoint', async ({ page }) => {
    const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560];
    await openHome(page);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});
