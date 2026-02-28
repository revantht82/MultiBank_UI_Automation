import { test as base, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as allure from 'allure-js-commons';
import { HomePage } from '../pages/HomePage';
import { TradingPage } from '../pages/TradingPage';
import { AboutPage } from '../pages/AboutPage';
import { NavigationBar } from '../pages/components/NavigationBar';
import { Footer } from '../pages/components/Footer';
import { Banner } from '../pages/components/Banner';

type TestFixtures = {
  homePage: HomePage;
  tradingPage: TradingPage;
  aboutPage: AboutPage;
  navigationBar: NavigationBar;
  footer: Footer;
  banner: Banner;
  axeBuilder: AxeBuilder;
};

/**
 * Capture browser console messages and page errors, then attach to Allure.
 */
function setupConsoleCapture(page: Page): string[] {
  const logs: string[] = [];

  page.on('console', (msg) => {
    const type = msg.type().toUpperCase();
    logs.push(`[${new Date().toISOString()}] [${type}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    logs.push(`[${new Date().toISOString()}] [PAGE_ERROR] ${err.message}`);
  });

  page.on('requestfailed', (request) => {
    logs.push(
      `[${new Date().toISOString()}] [REQUEST_FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`
    );
  });

  return logs;
}

export const test = base.extend<TestFixtures>({
  // Override the page fixture to capture console logs and attach to Allure
  page: async ({ page }, use, testInfo) => {
    const logs = setupConsoleCapture(page);

    await use(page);

    // After test: attach console logs to Allure
    if (logs.length > 0) {
      await allure.attachment(
        'Browser Console Logs',
        Buffer.from(logs.join('\n'), 'utf-8'),
        'text/plain'
      );
    }

    // Attach final screenshot on failure (Allure auto-attaches Playwright screenshots,
    // but this ensures a full-page capture is always present)
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot({ fullPage: true }).catch(() => null);
      if (screenshot) {
        await allure.attachment(
          'Failure Screenshot (Full Page)',
          screenshot,
          'image/png'
        );
      }
    }
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  tradingPage: async ({ page }, use) => {
    const tradingPage = new TradingPage(page);
    await use(tradingPage);
  },

  aboutPage: async ({ page }, use) => {
    const aboutPage = new AboutPage(page);
    await use(aboutPage);
  },

  navigationBar: async ({ page }, use) => {
    const navigationBar = new NavigationBar(page);
    await use(navigationBar);
  },

  footer: async ({ page }, use) => {
    const footer = new Footer(page);
    await use(footer);
  },

  banner: async ({ page }, use) => {
    const banner = new Banner(page);
    await use(banner);
  },

  axeBuilder: async ({ page }, use) => {
    const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
    await use(builder);
  },
});

export { expect } from '@playwright/test';
