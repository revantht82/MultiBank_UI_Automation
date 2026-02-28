import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load test data from a JSON file in the test-data directory.
 */
export function loadTestData<T>(fileName: string): T {
  const filePath = path.resolve(__dirname, '../../test-data', fileName);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData) as T;
}

/**
 * Normalize a URL by removing trailing slashes and lowercasing.
 */
export function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '').toLowerCase();
}

/**
 * Check if a URL contains an expected path segment.
 */
export function urlContainsPath(fullUrl: string, expectedPath: string): boolean {
  const normalized = normalizeUrl(fullUrl);
  const normalizedExpected = normalizeUrl(expectedPath);
  return normalized.includes(normalizedExpected);
}

/**
 * Wait for page to be in a stable state (no ongoing network requests).
 */
export async function waitForPageStable(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {
    // Fallback: some SPAs never reach networkidle
  });
}

/**
 * Take a named screenshot for debugging.
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const screenshotDir = path.resolve(__dirname, '../../test-results/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  await page.screenshot({
    path: path.join(screenshotDir, `${name}-${Date.now()}.png`),
    fullPage: true,
  });
}

export interface PerformanceMetrics {
  ttfb: number;
  domContentLoaded: number;
  pageLoad: number;
}

/**
 * Get navigation timing metrics from the browser Performance API.
 */
export async function getPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      pageLoad: Math.round(nav.loadEventEnd - nav.startTime),
    };
  });
}

export interface WebVitals {
  lcp: number;
  cls: number;
}

/**
 * Collect LCP and CLS Web Vitals using PerformanceObserver.
 * Must be called BEFORE page navigation to install observers early.
 */
export async function collectWebVitals(page: Page): Promise<WebVitals> {
  // Inject observers via CDP to catch metrics from page start
  await page.evaluate(() => {
    (window as any).__webVitals = { lcp: 0, cls: 0 };

    // LCP observer
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        (window as any).__webVitals.lcp = entries[entries.length - 1].startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS observer
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          (window as any).__webVitals.cls += (entry as any).value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  // Wait for page to settle so LCP/CLS are captured
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  return page.evaluate(() => ({
    lcp: Math.round((window as any).__webVitals.lcp),
    cls: Math.round((window as any).__webVitals.cls * 1000) / 1000,
  }));
}
