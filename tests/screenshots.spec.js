import { test } from '@playwright/test';
import { openHome } from './helpers';

/** Visual review captures (not assertions). Output: screenshots/*.png */
const SIZES = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];
const SECTIONS = ['home', 'about', 'projects', 'skills', 'experience', 'lab', 'contact'];

for (const size of SIZES) {
  test(`capture ${size.name}`, async ({ page }) => {
    test.skip(!process.env.CAPTURE, 'set CAPTURE=1 to record review screenshots');
    test.setTimeout(120_000);
    await page.setViewportSize({ width: size.width, height: size.height });
    await openHome(page);
    for (const id of SECTIONS) {
      await page.evaluate((sectionId) => {
        const element = document.getElementById(sectionId);
        window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY);
      }, id);
      await page.waitForTimeout(2200);
      await page.screenshot({ path: `screenshots/${size.name}-${id}.png` });
    }
  });
}
