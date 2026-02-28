# MultiBank UI Automation Framework

Production-grade Playwright + TypeScript automation framework for the [MultiBank](https://mb.io/) trading platform. Covers navigation, trading UI, marketing content, download links, and company pages across Chromium, Firefox, and WebKit.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Page Objects](#page-objects)
- [Test Data](#test-data)
- [Test Suites](#test-suites)
- [Allure Reporting](#allure-reporting)
- [CI/CD](#cicd)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Java JDK** >= 8 (required by Allure CLI for report generation)

## Installation

```bash
# Install project dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

---

## Running Tests

### All tests (all browsers)
```bash
npm test
```

### Single browser
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Headed mode (visible browser)
```bash
npm run test:headed
```

### Debug mode (Playwright Inspector)
```bash
npm run test:debug
```

### Interactive UI mode
```bash
npm run test:ui
```

### Run a specific test file
```bash
npx playwright test tests/navigation.spec.ts
```

### Run tests matching a grep pattern
```bash
npx playwright test --grep "should display the header"
```

---

## Project Structure

```
UI_Automation/
├── playwright.config.ts           # Playwright config (browsers, timeouts, Allure reporter)
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and npm scripts
├── .env                           # Environment variables (base URL, timeouts)
├── .gitignore                     # Git ignore rules
│
├── src/
│   ├── pages/                     # Page Object Model classes
│   │   ├── BasePage.ts            # Base class — navigation, waits, overlay dismissal
│   │   ├── HomePage.ts            # Homepage elements and actions
│   │   ├── TradingPage.ts         # Explore/trading page (Hot, Gainers, Losers tabs)
│   │   ├── AboutPage.ts           # Company & Features pages
│   │   └── components/
│   │       ├── NavigationBar.ts   # Header nav menu (Explore, Features, Company, auth links)
│   │       ├── Footer.ts          # Footer section (legal links, Contact Us)
│   │       └── Banner.ts          # Homepage sections and CTA buttons
│   ├── fixtures/
│   │   └── test-fixtures.ts       # Custom Playwright fixtures + Allure console log capture
│   └── utils/
│       └── helpers.ts             # Test data loader, URL helpers, screenshot utility
│
├── test-data/                     # External JSON test data (no hard-coded values in tests)
│   ├── navigation.json            # Expected nav items, footer links
│   ├── trading-pairs.json         # Crypto assets, explore tabs
│   ├── banners.json               # Homepage section patterns, CTA text
│   ├── download-links.json        # Download app, Sign Up, Open Account links
│   └── about-page.json            # Company & Features page headings/content
│
├── tests/                         # Test specifications
│   ├── navigation.spec.ts         # Header, nav links, page routing (13 tests)
│   ├── trading.spec.ts            # Crypto assets, prices, explore tabs (11 tests)
│   ├── banners.spec.ts            # Homepage sections, hero, CTAs (8 tests)
│   ├── download.spec.ts           # Download/Sign Up/Footer links (11 tests)
│   └── about.spec.ts              # Company page, Features page, nav (15 tests)
│
└── .github/
    └── workflows/
        └── playwright.yml         # GitHub Actions CI (matrix: chromium/firefox/webkit)
```

---

## Page Objects

### BasePage (`src/pages/BasePage.ts`)
Base class inherited by all page objects. Provides:
- **`navigate(path)`** — Navigates to a URL path with smart wait strategy (capped `networkidle` at 10s to handle SPA behavior)
- **`dismissMoEngageOverlay()`** — Hides the MoEngage push notification overlay (`#moe-push-div`) that blocks clicks
- **`dismissOverlays()`** — Handles cookie consent banners, modal popups, and MoEngage overlays
- **`clickElement(locator)`** — Dismisses overlays before clicking to prevent interception
- **`getText(locator)`**, **`getHref(locator)`**, **`isVisible(locator)`** — Common element interactions
- **`scrollToElement(locator)`**, **`countElements(locator)`**, **`getAllTexts(locator)`**, **`getAllHrefs(locator)`**

### HomePage (`src/pages/HomePage.ts`)
Homepage (`/`) with crypto asset links, hero sections, and CTAs.

### TradingPage (`src/pages/TradingPage.ts`)
Explore page (`/en-AE/explore`) with filter tabs (Hot, Gainers, Losers) and crypto asset listings.

### AboutPage (`src/pages/AboutPage.ts`)
Company page (`/en-AE/company`) and Features page (`/en-AE/features`). Validates headings, sections, images, and content.

### NavigationBar (`src/pages/components/NavigationBar.ts`)
Header navigation component. Handles clicking nav links (Explore, Features, Company) with SPA-aware URL waiting via `page.waitForURL()`.

### Footer (`src/pages/components/Footer.ts`)
Footer section with legal links and Contact Us link.

### Banner (`src/pages/components/Banner.ts`)
Homepage sections, hero section, and CTA buttons (Download the app, Open an account).

---

## Test Data

All assertions are driven by external JSON files in `test-data/`. This means **zero hard-coded expected values in test specs** — update the JSON to adjust expectations without changing test code.

| File | Purpose |
|------|---------|
| `navigation.json` | Nav item labels/URLs, footer legal links, minimum counts |
| `trading-pairs.json` | Explore tab names, expected crypto assets (BTC, ETH, SOL, etc.) |
| `banners.json` | Homepage section text patterns, hero CTAs |
| `download-links.json` | Download app, Sign Up, Open Account link text & URL patterns |
| `about-page.json` | Company page headings, text patterns, section counts; Features page headings |

To load test data in a spec:
```typescript
import { loadTestData } from '../src/utils/helpers';
const data = loadTestData<MyDataType>('my-data.json');
```

---

## Test Suites

**58 total tests** across 5 spec files:

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| Navigation | `navigation.spec.ts` | 13 | Header visibility, logo, nav items, Sign In/Up, page routing, footer links |
| Trading | `trading.spec.ts` | 11 | Crypto asset list, expected assets, prices, percentages, explore page tabs |
| Banners | `banners.spec.ts` | 8 | Section count, hero section, content patterns, CTA buttons |
| Downloads | `download.spec.ts` | 11 | Download app link, Sign Up link, Open Account link, footer section |
| About | `about.spec.ts` | 15 | Company page headings/content/sections, Features page, nav routing |

---

## Allure Reporting

This framework uses [Allure](https://allurereport.org/) for rich, interactive test reports with screenshots, console logs, and traces.

### Generate and View Reports

```bash
# Generate a single-file HTML report
npm run allure:generate

# Open the generated report in browser
npm run allure:open

# Or generate + open in one command
npm run report

# Serve results directly (no generation step)
npm run report:serve
```

### Clean Up

```bash
# Remove all report artifacts
npm run clean
```

### What's Captured in Allure

Every test run automatically captures and attaches the following to the Allure report:

| Attachment | When | Description |
|------------|------|-------------|
| **Screenshots** | Every test | Full-page screenshots captured after each test |
| **Failure Screenshot** | On failure | Additional full-page screenshot attached via custom fixture |
| **Browser Console Logs** | Every test | All `console.log`, `console.error`, `console.warn` messages from the browser |
| **Page Errors** | On error | Uncaught JavaScript exceptions from the page |
| **Failed Requests** | On failure | HTTP requests that failed (method, URL, error text) |
| **Trace** | On failure | Playwright trace file (`.zip`) for step-by-step replay |
| **Video** | On failure | Browser session video recording |

### How to Read an Allure Report

After running `npm run report`, the report opens in your browser. Here's how to navigate it:

#### 1. Overview Dashboard
The landing page shows a summary with:
- **Pass/Fail/Broken/Skipped** counts and percentages
- **Suites** breakdown (each `.spec.ts` file is a suite)
- **Duration** of the overall run and per-suite timings
- **Environment** info (base URL, Node version)

#### 2. Suites View (Left Sidebar)
Click **Suites** to see tests grouped by spec file. Expand a suite to see individual tests. Each test shows a status icon:
- Green check = passed
- Red X = failed
- Yellow = broken (unexpected error)

#### 3. Individual Test Details
Click on any test to see:
- **Test Body** — Step-by-step execution timeline (Playwright actions)
- **Attachments** tab — Screenshots, console logs, trace files, videos
- **Parameters** — Test data and configuration used
- **History** — Pass/fail trend if you have historical results

#### 4. Viewing Console Logs
1. Click on a test
2. Go to the **Attachments** section
3. Click **"Browser Console Logs"** (`.txt` file)
4. You'll see timestamped entries like:
   ```
   [2026-02-27T10:30:45.123Z] [LOG] Application initialized
   [2026-02-27T10:30:46.456Z] [ERROR] Failed to load resource
   [2026-02-27T10:30:47.789Z] [REQUEST_FAILED] GET https://... - net::ERR_FAILED
   ```

#### 5. Viewing Failure Screenshots
1. Click on a failed test
2. In the **Attachments** section, click the screenshot image
3. Two screenshots may be available:
   - **Playwright auto-screenshot** — captured at the point of failure
   - **Failure Screenshot (Full Page)** — full-page capture from the custom fixture

#### 6. Replaying a Trace
1. Click on a failed test
2. Find the **trace.zip** in Attachments
3. Download it, then open [trace.playwright.dev](https://trace.playwright.dev/)
4. Drop the `.zip` file to see:
   - Each action with before/after DOM snapshots
   - Network requests timeline
   - Console logs per action
   - Screenshot at each step

#### 7. Filtering and Searching
- Use the **Status** filter to show only failed tests
- Use the **Search** bar to find tests by name
- Click column headers to sort by duration, status, etc.

---

## CI/CD

The framework includes a GitHub Actions workflow (`.github/workflows/playwright.yml`) that:

1. Runs on push to `main`/`develop` and on PRs to `main`
2. Executes tests in parallel across **Chromium, Firefox, and WebKit** (matrix strategy)
3. Generates a single-file Allure report per browser
4. Uploads report artifacts (retained for 14 days)

### Manual Trigger
The workflow supports `workflow_dispatch` for on-demand runs from the GitHub Actions UI.

### Viewing CI Reports
1. Go to the **Actions** tab in GitHub
2. Click on a workflow run
3. Download the `allure-report-<browser>` artifact
4. Open `index.html` in a browser (single-file, no server needed)

---

## Configuration

### Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://mb.io/` | Base URL for the application under test |
| `DEFAULT_TIMEOUT` | `30000` | Action timeout in ms (clicks, fills) |
| `NAVIGATION_TIMEOUT` | `45000` | Page navigation timeout in ms |
| `EXPECT_TIMEOUT` | `10000` | Assertion timeout in ms |
| `RETRY_COUNT` | `2` | Number of test retries on failure |
| `WORKERS` | `4` | Number of parallel workers |

### Playwright Config (`playwright.config.ts`)

Key settings:
- **Test timeout**: 60s (accommodates heavy SPA load times)
- **Retries**: 1 locally, 2 in CI
- **Parallel**: Fully parallel with configurable workers
- **Screenshots**: Captured on every test
- **Traces**: Retained on failure
- **Video**: Retained on failure

---

## Troubleshooting

### Tests timeout on first run
The site is a heavy Next.js SPA. The 60s test timeout accounts for this, but slow networks may need a higher value. Increase `timeout` in `playwright.config.ts`.

### MoEngage overlay blocks clicks
The `BasePage.dismissMoEngageOverlay()` method automatically hides the `#moe-push-div` overlay before clicks. If new overlays appear, add their selectors to `dismissOverlays()`.

### Navigation tests fail with wrong URL
The site uses client-side SPA routing. Navigation methods use `page.waitForURL()` instead of waiting for full page loads. If URL patterns change, update the wait patterns in `NavigationBar.ts`.

### `networkidle` never resolves
Expected behavior for SPAs with persistent WebSocket connections. The framework caps `networkidle` wait at 10s using `Promise.race()` in `BasePage.navigate()`.

### Allure report generation fails
Ensure Java JDK >= 8 is installed (`java -version`). Allure CLI requires Java to run.

### Clean state
```bash
npm run clean                     # Remove all report/result artifacts
npx playwright install --with-deps  # Reinstall browsers if needed
```
