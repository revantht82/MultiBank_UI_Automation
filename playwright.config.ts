import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getBrowserStackConnectOptions } from './src/utils/browserstack';

dotenv.config();

// BrowserStack: when credentials are set, connect via their CDP endpoint
const bsConnectOptions = getBrowserStackConnectOptions();

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : parseInt(process.env.WORKERS || '4'),
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          BASE_URL: process.env.BASE_URL || 'https://mb.io/',
          NODE_VERSION: process.version,
        },
      },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://mb.io/',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '45000'),
    locale: 'en-US',
    timezoneId: 'America/New_York',
    // Route through BrowserStack CDP when credentials are set
    ...(bsConnectOptions ? { connectOptions: bsConnectOptions } : {}),
  },
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT || '10000'),
  },
  projects: [
    // ── Desktop / Fullscreen (1920×1080) ──
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
    },

    // ── Tablet (1024×768) ──
    {
      name: 'chromium-tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'firefox-tablet',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'webkit-tablet',
      use: { ...devices['Desktop Safari'], viewport: { width: 1024, height: 768 } },
    },

    // ── iPad (820×1180) ──
    {
      name: 'chromium-ipad',
      use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 } },
    },
    {
      name: 'firefox-ipad',
      use: { ...devices['Desktop Firefox'], viewport: { width: 820, height: 1180 } },
    },
    {
      name: 'webkit-ipad',
      use: { ...devices['Desktop Safari'], viewport: { width: 820, height: 1180 } },
    },

    // ── Samsung Galaxy S26 Ultra Max (412×915) ──
    {
      name: 'chromium-samsung-s26-ultra',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 3.5,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
      },
    },
    {
      name: 'firefox-samsung-s26-ultra',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 3.5,
        hasTouch: true,
      },
    },
    {
      name: 'webkit-samsung-s26-ultra',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 3.5,
        isMobile: true,
        hasTouch: true,
      },
    },

    // ── iPhone 17 Pro Max (440×956) ──
    {
      name: 'chromium-iphone-17-pro-max',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 440, height: 956 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'firefox-iphone-17-pro-max',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 440, height: 956 },
        deviceScaleFactor: 3,
        hasTouch: true,
      },
    },
    {
      name: 'webkit-iphone-17-pro-max',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 440, height: 956 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
      },
    },
  ],
});
