import { test, expect } from '../src/fixtures/test-fixtures';
import { loadTestData, getPerformanceMetrics, collectWebVitals } from '../src/utils/helpers';
import * as allure from 'allure-js-commons';

interface PerfPage {
  name: string;
  path: string;
  description: string;
}

interface PerformanceData {
  pages: PerfPage[];
  thresholds: {
    maxPageLoadTimeMs: number;
    maxTTFBMs: number;
    maxDOMContentLoadedMs: number;
    maxLCPMs: number;
    maxCLS: number;
  };
}

const perfData = loadTestData<PerformanceData>('performance.json');

for (const pageConfig of perfData.pages) {
  test.describe(`Performance - ${pageConfig.name}`, () => {
    test(`${pageConfig.name} page load time should be within threshold`, async ({ page }) => {
      await page.goto(pageConfig.path, { waitUntil: 'load' });

      const metrics = await getPerformanceMetrics(page);

      await allure.attachment(
        `${pageConfig.name} - Navigation Timing`,
        Buffer.from(JSON.stringify(metrics, null, 2), 'utf-8'),
        'application/json'
      );

      console.log(`[Perf] ${pageConfig.name} — TTFB: ${metrics.ttfb}ms, DCL: ${metrics.domContentLoaded}ms, Load: ${metrics.pageLoad}ms`);

      expect(
        metrics.pageLoad,
        `${pageConfig.name} page load (${metrics.pageLoad}ms) exceeds ${perfData.thresholds.maxPageLoadTimeMs}ms`
      ).toBeLessThanOrEqual(perfData.thresholds.maxPageLoadTimeMs);
    });

    test(`${pageConfig.name} TTFB should be within threshold`, async ({ page }) => {
      await page.goto(pageConfig.path, { waitUntil: 'load' });

      const metrics = await getPerformanceMetrics(page);

      console.log(`[Perf] ${pageConfig.name} — TTFB: ${metrics.ttfb}ms`);

      expect(
        metrics.ttfb,
        `${pageConfig.name} TTFB (${metrics.ttfb}ms) exceeds ${perfData.thresholds.maxTTFBMs}ms`
      ).toBeLessThanOrEqual(perfData.thresholds.maxTTFBMs);
    });
  });
}

// Web Vitals tests (LCP, CLS) — run on Homepage only to avoid SPA measurement complexity
test.describe('Web Vitals - Homepage', () => {
  test('Homepage LCP should be within threshold', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const vitals = await collectWebVitals(page);

    await allure.attachment(
      'Homepage - Web Vitals',
      Buffer.from(JSON.stringify(vitals, null, 2), 'utf-8'),
      'application/json'
    );

    console.log(`[Perf] Homepage — LCP: ${vitals.lcp}ms, CLS: ${vitals.cls}`);

    expect(
      vitals.lcp,
      `Homepage LCP (${vitals.lcp}ms) exceeds ${perfData.thresholds.maxLCPMs}ms`
    ).toBeLessThanOrEqual(perfData.thresholds.maxLCPMs);
  });

  test('Homepage CLS should be within threshold', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const vitals = await collectWebVitals(page);

    console.log(`[Perf] Homepage — CLS: ${vitals.cls}`);

    expect(
      vitals.cls,
      `Homepage CLS (${vitals.cls}) exceeds ${perfData.thresholds.maxCLS}`
    ).toBeLessThanOrEqual(perfData.thresholds.maxCLS);
  });
});
