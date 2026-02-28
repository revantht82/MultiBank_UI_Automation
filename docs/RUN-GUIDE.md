# MultiBank — Run Guide

This repository contains two tasks:

| Task | Description | Location |
|------|-------------|----------|
| **Task 1** | Web UI Automation Framework (Playwright) | `tests/`, `src/`, `playwright.config.ts` |
| **Task 2** | String Character Frequency | `tasks/string-character-frequency.ts` |

---

## Prerequisites

```bash
npm install                    # Install project dependencies
npx playwright install         # Install browser binaries (Chromium, Firefox, WebKit)
```

---

# Task 1: Web UI Automation Framework

## 1. Shell Script Runner (`run-all-tests.sh`)

The main runner that executes projects sequentially and generates an Allure report at the end.

```bash
./run-all-tests.sh [FILTER] [-w N] [-p LIST]
```

### Options

| Option | Description |
|--------|-------------|
| `-w, --workers N` | Number of parallel test workers per project (default: 4) |
| `-p, --projects LIST` | Comma-separated list of specific project names to run |
| `-h, --help` | Show help and list all available projects |

### Filter Shortcuts

| Filter | Projects Run | Description |
|--------|-------------|-------------|
| `all` (default) | 15 projects | All browsers, all viewports |
| `chromium` or `chrome` | 5 projects | Chrome across all 5 viewports |
| `firefox` | 5 projects | Firefox across all 5 viewports |
| `webkit` or `safari` | 5 projects | Safari across all 5 viewports |
| `desktop` or `fullscreen` | 3 projects | 1920x1080 on all 3 browsers |
| `tablet` | 3 projects | 1024x768 on all 3 browsers |
| `ipad` | 3 projects | 820x1180 on all 3 browsers |
| `samsung` or `samsung-s26` | 3 projects | 412x915 on all 3 browsers |
| `iphone` or `iphone-17` | 3 projects | 440x956 on all 3 browsers |
| `mobile` | 6 projects | Samsung + iPhone on all 3 browsers |

### Examples

```bash
# Run all 15 projects with default 4 workers
./run-all-tests.sh

# Run all 15 projects with 6 workers per project
./run-all-tests.sh -w 6

# Run Chrome across all viewports with 8 workers
./run-all-tests.sh chromium -w 8

# Run only desktop browsers (Chromium, Firefox, WebKit at 1920x1080)
./run-all-tests.sh desktop -w 8

# Run Samsung S26 Ultra on all browsers with 2 workers
./run-all-tests.sh samsung -w 2

# Run specific projects by name
./run-all-tests.sh -p chromium,firefox,webkit -w 8

# Run a single specific project
./run-all-tests.sh chromium-ipad

# Run iPad and tablet viewports together
./run-all-tests.sh -p chromium-ipad,firefox-ipad,webkit-ipad,chromium-tablet
```

### What the Script Does

1. Cleans previous `allure-results/`, `allure-report/`, and `test-results/` directories
2. Ensures browser binaries are installed
3. Runs each project sequentially with the specified worker count
4. Generates a single-page Allure report and opens it in the browser

---

## 2. NPM Script Commands

Quick-access commands defined in `package.json`.

### Run Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with default config (all projects) |
| `npm run test:chromium` | Run tests on Chromium desktop (1920x1080) |
| `npm run test:firefox` | Run tests on Firefox desktop (1920x1080) |
| `npm run test:webkit` | Run tests on WebKit/Safari desktop (1920x1080) |
| `npm run test:desktop` | Run all 3 desktop browsers (1920x1080) |
| `npm run test:tablet` | Run all 3 browsers at tablet viewport (1024x768) |
| `npm run test:ipad` | Run all 3 browsers at iPad viewport (820x1180) |
| `npm run test:samsung` | Run all 3 browsers at Samsung S26 Ultra (412x915) |
| `npm run test:iphone` | Run all 3 browsers at iPhone 17 Pro Max (440x956) |
| `npm run test:mobile` | Run all 6 mobile projects (Samsung + iPhone) |
| `npm run test:a11y` | Run accessibility tests (axe-core WCAG scans) |
| `npm run test:perf` | Run performance tests (load time, TTFB, Web Vitals) |
| `npm run test:cloud` | Run all tests via BrowserStack (requires credentials) |
| `npm run test:cloud:chromium` | Run Chromium tests via BrowserStack |
| `npm run test:all` | Run full suite via `run-all-tests.sh` |

### Debug & Interactive

| Command | Description |
|---------|-------------|
| `npm run test:headed` | Run tests with visible browser window |
| `npm run test:debug` | Run tests in Playwright debug mode (step-through) |
| `npm run test:ui` | Open Playwright UI mode (interactive test explorer) |

### Reports

| Command | Description |
|---------|-------------|
| `npm run report` | Generate Allure report and open in browser |
| `npm run report:serve` | Generate and serve Allure report with live reload |
| `npm run allure:generate` | Generate Allure report from results |
| `npm run allure:open` | Open existing Allure report |

### Utilities

| Command | Description |
|---------|-------------|
| `npm run clean` | Delete all report and result directories |
| `npm run install:browsers` | Install Playwright browser binaries |

---

## 3. Playwright CLI Commands

Direct `npx playwright test` commands with Playwright options.

### Run by Project

```bash
# Single project
npx playwright test --project=chromium
npx playwright test --project=firefox-tablet
npx playwright test --project=webkit-samsung-s26-ultra

# Multiple projects
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Run by Spec File

```bash
# Run a single spec file across all projects
npx playwright test tests/navigation.spec.ts

# Run a single spec file on a specific browser
npx playwright test tests/trading.spec.ts --project=chromium

# Run multiple spec files
npx playwright test tests/navigation.spec.ts tests/about.spec.ts
```

### Run by Test Name (grep)

```bash
# Run tests matching a keyword
npx playwright test --grep "logo"

# Run tests matching a describe block
npx playwright test --grep "Footer Navigation"

# Run a single test by full name
npx playwright test --grep "should display the hero section"

# Exclude tests matching a pattern
npx playwright test --grep-invert "Mobile"
```

### Worker Control

```bash
# Run with 1 worker (sequential, good for debugging)
npx playwright test --workers=1

# Run with 8 workers (fast parallel execution)
npx playwright test --project=chromium --workers=8

# Run with 50% of CPU cores
npx playwright test --workers=50%
```

### Retries & Repeats

```bash
# Run with 2 retries on failure
npx playwright test --retries=2

# Repeat each test 3 times (find flaky tests)
npx playwright test --repeat-each=3

# Combine: repeat 5 times with 0 retries to surface flakiness
npx playwright test --repeat-each=5 --retries=0 --project=chromium
```

### Debug & Trace

```bash
# Run in headed mode (visible browser)
npx playwright test --headed --project=chromium

# Run in debug mode (step-through breakpoints)
npx playwright test --debug

# Open Playwright UI mode (interactive runner)
npx playwright test --ui

# Generate trace for all tests (not just failures)
npx playwright test --trace=on

# View a trace file after test run
npx playwright show-trace test-results/<test-folder>/trace.zip
```

### Report Viewing

```bash
# Open Playwright HTML report (auto-generated)
npx playwright show-report

# Open Allure report
npx allure open allure-report

# Serve Allure report with live reload
npx allure serve allure-results
```

---

## 4. Available Projects (15 Total)

| Project Name | Browser | Viewport | Device |
|-------------|---------|----------|--------|
| `chromium` | Chrome | 1920x1080 | Desktop |
| `firefox` | Firefox | 1920x1080 | Desktop |
| `webkit` | Safari | 1920x1080 | Desktop |
| `chromium-tablet` | Chrome | 1024x768 | Tablet |
| `firefox-tablet` | Firefox | 1024x768 | Tablet |
| `webkit-tablet` | Safari | 1024x768 | Tablet |
| `chromium-ipad` | Chrome | 820x1180 | iPad |
| `firefox-ipad` | Firefox | 820x1180 | iPad |
| `webkit-ipad` | Safari | 820x1180 | iPad |
| `chromium-samsung-s26-ultra` | Chrome | 412x915 | Samsung Galaxy S26 Ultra |
| `firefox-samsung-s26-ultra` | Firefox | 412x915 | Samsung Galaxy S26 Ultra |
| `webkit-samsung-s26-ultra` | Safari | 412x915 | Samsung Galaxy S26 Ultra |
| `chromium-iphone-17-pro-max` | Chrome | 440x956 | iPhone 17 Pro Max |
| `firefox-iphone-17-pro-max` | Firefox | 440x956 | iPhone 17 Pro Max |
| `webkit-iphone-17-pro-max` | Safari | 440x956 | iPhone 17 Pro Max |

---

## 5. Spec Files (7 Total, 140 Tests)

| Spec File | Tests | What It Covers |
|-----------|-------|----------------|
| `navigation.spec.ts` | 26 | Header, logo, nav links, Sign In/Up, page routing, footer nav |
| `trading.spec.ts` | 22 | Crypto asset listing, prices, explore page, filter tabs, trading pairs |
| `banners.spec.ts` | 18 | Hero section, CTAs, Khabib banner, trading promo, category tabs |
| `download.spec.ts` | 19 | Download link, footer structure, legal links, payment icons, VARA compliance |
| `about.spec.ts` | 37 | Company page, stats, strength cards, features page, solutions, VIP section |
| `accessibility.spec.ts` | 8 | WCAG 2.1 AA axe-core scans — critical & serious violations per page |
| `performance.spec.ts` | 10 | Page load time, TTFB, LCP, CLS via Navigation Timing & Web Vitals |

---

## 6. Accessibility Tests

Uses `@axe-core/playwright` to run WCAG 2.1 Level AA scans on key pages. Violations are attached to Allure reports as JSON.

```bash
# Run accessibility tests on Chromium
npm run test:a11y

# Run on a specific browser
npx playwright test tests/accessibility.spec.ts --project=firefox

# Run with headed mode for debugging
npx playwright test tests/accessibility.spec.ts --project=chromium --headed
```

**Configuration** — `test-data/accessibility.json`:
- `pages` — pages to scan (Homepage, Explore, Features, Company)
- `wcagLevel` — target WCAG level (`wcag2aa`)
- `maxCriticalViolations` — max allowed critical violations per page (default: 1)
- `maxSeriousViolations` — max allowed serious violations per page (default: 5)

---

## 7. Performance Tests

Measures page load time, TTFB (Time to First Byte), LCP (Largest Contentful Paint), and CLS (Cumulative Layout Shift) using the Navigation Timing API and PerformanceObserver.

```bash
# Run performance tests on Chromium
npm run test:perf

# Run on a specific browser
npx playwright test tests/performance.spec.ts --project=webkit

# Run a single metric
npx playwright test tests/performance.spec.ts --grep "TTFB" --project=chromium
```

**Configuration** — `test-data/performance.json`:
- `pages` — pages to measure (Homepage, Explore, Features, Company)
- `thresholds.maxPageLoadTimeMs` — max page load time (default: 15000ms)
- `thresholds.maxTTFBMs` — max TTFB (default: 3000ms)
- `thresholds.maxDOMContentLoadedMs` — max DOM content loaded (default: 8000ms)
- `thresholds.maxLCPMs` — max LCP (default: 5000ms)
- `thresholds.maxCLS` — max CLS score (default: 0.25)

---

## 8. Cloud Execution (BrowserStack)

Run tests on BrowserStack's remote browsers via CDP (Chrome DevTools Protocol). When `BROWSERSTACK_USERNAME` is set, Playwright routes browser connections through BrowserStack automatically.

### Setup

1. Set credentials in `.env` or export them:
   ```bash
   export BROWSERSTACK_USERNAME=your_username
   export BROWSERSTACK_ACCESS_KEY=your_access_key
   ```

2. Run tests:
   ```bash
   # Run all tests via BrowserStack
   npm run test:cloud

   # Run Chromium tests via BrowserStack
   npm run test:cloud:chromium

   # Run with inline credentials
   BROWSERSTACK_USERNAME=xxx BROWSERSTACK_ACCESS_KEY=yyy npx playwright test --project=chromium
   ```

### How It Works

- `src/utils/browserstack.ts` builds a CDP WebSocket URL with encoded capabilities
- `playwright.config.ts` conditionally applies `connectOptions` when BrowserStack creds are detected
- When credentials are **not** set, all tests run locally — no configuration changes needed

---

## 9. Environment Variables

Configured in `.env` file or passed inline.

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://mb.io/` | Target site base URL |
| `WORKERS` | `4` | Default parallel worker count |
| `DEFAULT_TIMEOUT` | `30000` | Action timeout (ms) |
| `NAVIGATION_TIMEOUT` | `45000` | Page navigation timeout (ms) |
| `EXPECT_TIMEOUT` | `10000` | Assertion timeout (ms) |
| `CI` | _(unset)_ | Set to `true` for CI mode (2 retries, 2 workers) |
| `BROWSERSTACK_USERNAME` | _(unset)_ | BrowserStack username (enables cloud execution) |
| `BROWSERSTACK_ACCESS_KEY` | _(unset)_ | BrowserStack access key |

```bash
# Override via environment variable
BASE_URL=https://staging.mb.io/ npx playwright test --project=chromium

# Override workers via CLI
npx playwright test --project=chromium --workers=8

# Run on BrowserStack
BROWSERSTACK_USERNAME=xxx BROWSERSTACK_ACCESS_KEY=yyy npx playwright test --project=chromium
```

---

# Task 2: String Character Frequency

**File:** `tasks/string-character-frequency.ts`

Counts character occurrences in a string and outputs them in order of first appearance.

## Run

```bash
npx ts-node tasks/string-character-frequency.ts
```

## Example Output

```
1: h:1, e:1, l:3, o:2, w:1, r:1, d:1
2: a:2, b:2, c:2
3:
4: a:1
5: A:2, a:2
6: h:1, e:1, l:3, o:2, !:2, @:1, w:1, r:1, d:1, #:1, 2:2, 0:1, 4:1
7: م:2, ر:1, ح:1, ب:2, ا:3, ل:2, ع:1
8: 你:2, 好:2, 世:1, 界:1
9: こ:2, ん:2, に:2, ち:2, は:2
10: 안:1, 녕:1, 하:1, 세:1, 요:1
11: न:2, म:1, स:1, ्:1, त:1, े:1, द:1, ु:1, ि:1, य:1, ा:1
12: 👋:2, 🌍:2, 🚀:1
13: c:1, a:2, f:1, é:3, r:1, s:1, u:1, m:1, n:1, ï:1, v:1, e:1, 日:1, 本:1, 語:1, 🎉:1
14: a:1, 	:2, b:1, ...:1, c:1, d:1
15:
```

## Test Cases (15 Total)

| # | Input | What It Tests |
|---|-------|---------------|
| 1 | `"hello world"` | Basic English, spaces skipped |
| 2 | `"aabbcc"` | Repeated characters |
| 3 | `""` | Empty string |
| 4 | `"a"` | Single character |
| 5 | `"AaAa"` | Case sensitivity |
| 6 | `"hello!! @world #2024"` | Special characters (`!`, `@`, `#`) and digits |
| 7 | `"مرحبا بالعالم"` | Arabic script |
| 8 | `"你好世界你好"` | Chinese characters |
| 9 | `"こんにちはこんにちは"` | Japanese Hiragana |
| 10 | `"안녕하세요"` | Korean Hangul |
| 11 | `"नमस्ते दुनिया"` | Hindi Devanagari (with combining marks) |
| 12 | `"👋🌍👋🌍🚀"` | Emoji (surrogate pairs) |
| 13 | `"café résumé naïve 日本語 🎉"` | Mixed: English + accented + CJK + emoji |
| 14 | `"a\tb\nc\td"` | Tabs and newlines |
| 15 | `"     "` | Only spaces (returns empty) |

## Approach

- Single pass using a `Map` to count occurrences — `Map` preserves insertion order (ES2015+), so first-appearance ordering comes free
- `for...of` iterates by Unicode code points, correctly handling emoji and non-BMP characters
- Spaces are skipped; all other characters (special, non-English, emoji) are counted
- **Time:** O(n) | **Space:** O(k) where k = unique characters
