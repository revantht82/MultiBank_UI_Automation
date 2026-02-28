/**
 * BrowserStack Playwright integration helpers.
 *
 * Usage:
 *   BROWSERSTACK_USERNAME=xxx BROWSERSTACK_ACCESS_KEY=yyy npx playwright test --project=chromium
 *
 * When BROWSERSTACK_USERNAME is set, playwright.config.ts will route browser
 * connections through BrowserStack's CDP endpoint instead of local browsers.
 */

export interface BrowserStackCaps {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  projectName: string;
  buildName: string;
  sessionName: string;
}

/**
 * Check if BrowserStack credentials are configured.
 */
export function isBrowserStackEnabled(): boolean {
  return !!(process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY);
}

/**
 * Build the BrowserStack CDP WebSocket endpoint URL.
 */
export function getBrowserStackWSEndpoint(caps: Partial<BrowserStackCaps> = {}): string {
  const username = process.env.BROWSERSTACK_USERNAME;
  const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;

  if (!username || !accessKey) {
    throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set');
  }

  const capabilities = {
    browser: caps.browser || 'chrome',
    browser_version: caps.browserVersion || 'latest',
    os: caps.os || 'Windows',
    os_version: caps.osVersion || '11',
    'browserstack.username': username,
    'browserstack.accessKey': accessKey,
    project: caps.projectName || 'MultiBank UI Automation',
    build: caps.buildName || `Build-${new Date().toISOString().split('T')[0]}`,
    name: caps.sessionName || 'Playwright Test',
  };

  const encodedCaps = encodeURIComponent(JSON.stringify(capabilities));
  return `wss://cdp.browserstack.com/playwright?caps=${encodedCaps}`;
}

/**
 * Get Playwright connectOptions for BrowserStack.
 * Returns undefined if BrowserStack is not configured.
 */
export function getBrowserStackConnectOptions(
  caps: Partial<BrowserStackCaps> = {}
): { wsEndpoint: string } | undefined {
  if (!isBrowserStackEnabled()) return undefined;
  return { wsEndpoint: getBrowserStackWSEndpoint(caps) };
}
