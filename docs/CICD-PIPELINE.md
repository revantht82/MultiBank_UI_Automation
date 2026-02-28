# MultiBank UI Automation — CI/CD Pipeline

**Platform:** GitHub Actions | **Workflow File:** `.github/workflows/playwright.yml`

---

## Overview

The pipeline runs **4 parallel jobs** on every push/PR, covering functional tests across 3 browsers, accessibility scans, performance metrics, and optional cloud execution via BrowserStack.

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions Trigger                   │
│  push → main/develop  |  PR → main  |  manual dispatch      │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
       ┌───────▼───────┐     │              │
       │   test (matrix)│     │              │
       │  ┌──────────┐  │  ┌──▼──────────┐  │  ┌────────────┐
       │  │ chromium  │  │  │accessibility│  │  │performance │
       │  │ firefox   │  │  │ (chromium)  │  │  │ (chromium) │
       │  │ webkit    │  │  └─────────────┘  │  └────────────┘
       │  └──────────┘  │                    │
       └────────────────┘           ┌────────▼───────┐
                                    │  cloud-tests   │
                                    │ (manual only)  │
                                    └────────────────┘
```

---

## Triggers

| Event | Branches | When It Runs |
|-------|----------|-------------|
| `push` | `main`, `develop` | Every commit pushed to main or develop |
| `pull_request` | `main` | Every PR opened/updated targeting main |
| `workflow_dispatch` | any | Manual trigger from GitHub Actions UI |

---

## Jobs

### 1. `test` — Cross-Browser Functional Tests

Runs the full 140-test suite across 3 desktop browsers in parallel using a matrix strategy.

| Setting | Value |
|---------|-------|
| **Runs on** | `ubuntu-latest` |
| **Timeout** | 30 minutes |
| **Strategy** | Matrix: `[chromium, firefox, webkit]` |
| **Fail-fast** | `false` — all browsers complete even if one fails |
| **Workers** | 2 (CI mode) |
| **Retries** | 2 (CI mode) |

**Steps:**

| Step | What It Does |
|------|-------------|
| Checkout | Clone repository |
| Setup Node 20 | Install Node.js with npm cache |
| Install npm dependencies | Run `npm ci` and verify 5 critical packages (`@playwright/test`, `allure-playwright`, `allure-commandline`, `@axe-core/playwright`, `typescript`) |
| Install Playwright Browsers | Install only the browser needed for this matrix job |
| Run Playwright tests | Execute `npx playwright test --project={browser}` with `CI=true` |
| Generate Allure Report | Build single-file HTML report from results (runs even on failure) |
| Upload artifacts | Upload `allure-report/` and `allure-results/` + `test-results/` (14-day retention) |

**Artifacts produced:**
- `allure-report-chromium` / `allure-report-firefox` / `allure-report-webkit` — HTML report per browser
- `allure-results-chromium` / `allure-results-firefox` / `allure-results-webkit` — Raw results + traces/screenshots

---

### 2. `accessibility` — WCAG Accessibility Scans

Runs axe-core WCAG 2.1 Level AA scans on 4 key pages (Homepage, Explore, Features, Company).

| Setting | Value |
|---------|-------|
| **Runs on** | `ubuntu-latest` |
| **Timeout** | 15 minutes |
| **Browser** | Chromium only |
| **Tests** | 8 (critical + serious violations per page) |

**Steps:**

| Step | What It Does |
|------|-------------|
| Checkout | Clone repository |
| Setup Node 20 | Install Node.js with npm cache |
| Install npm dependencies | Run `npm ci` and verify `@axe-core/playwright` is present |
| Install Playwright Browsers | Install Chromium with system dependencies |
| Run Accessibility tests | Execute `npx playwright test tests/accessibility.spec.ts --project=chromium` |
| Upload artifacts | Upload `a11y-results` (allure-results + test-results, 14-day retention) |

**Why Chromium only:** Accessibility violations are browser-independent (DOM/ARIA issues). Running on one browser is sufficient and saves CI minutes.

---

### 3. `performance` — Performance Metrics

Measures page load time, TTFB, LCP, and CLS across 4 pages using the Navigation Timing API and PerformanceObserver.

| Setting | Value |
|---------|-------|
| **Runs on** | `ubuntu-latest` |
| **Timeout** | 15 minutes |
| **Browser** | Chromium only |
| **Tests** | 10 (load time + TTFB per page, LCP + CLS for Homepage) |

**Steps:**

| Step | What It Does |
|------|-------------|
| Checkout | Clone repository |
| Setup Node 20 | Install Node.js with npm cache |
| Install npm dependencies | Run `npm ci` |
| Install Playwright Browsers | Install Chromium with system dependencies |
| Run Performance tests | Execute `npx playwright test tests/performance.spec.ts --project=chromium` |
| Upload artifacts | Upload `perf-results` (allure-results + test-results, 14-day retention) |

**Why Chromium only:** Performance metrics need consistent baseline. CI runners have fixed resources, so single-browser avoids variance from parallel browser execution.

---

### 4. `cloud-tests` — BrowserStack Cloud Execution

Runs the test suite on BrowserStack's remote browsers via CDP. Only triggers on manual dispatch.

| Setting | Value |
|---------|-------|
| **Runs on** | `ubuntu-latest` |
| **Timeout** | 30 minutes |
| **Trigger** | `workflow_dispatch` only (manual) |
| **Browser** | Chromium (routed through BrowserStack) |

**Steps:**

| Step | What It Does |
|------|-------------|
| Checkout | Clone repository |
| Setup Node 20 | Install Node.js with npm cache |
| Install npm dependencies | Run `npm ci` |
| Verify BrowserStack credentials | Check `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` secrets are set — fail with clear error if missing |
| Run tests on BrowserStack | Execute `npx playwright test --project=chromium` with BrowserStack env vars |
| Upload artifacts | Upload `cloud-results` (14-day retention) |

**Why manual only:** BrowserStack has limited minutes on most plans. Manual dispatch prevents accidental consumption on every push.

---

## Dependency Verification

Every job verifies dependencies before running tests. If a critical package is missing after `npm ci`, the job fails immediately with a clear error message.

| Job | Packages Verified |
|-----|-------------------|
| `test` | `@playwright/test`, `allure-playwright`, `allure-commandline`, `@axe-core/playwright`, `typescript` |
| `accessibility` | `@axe-core/playwright` |
| `performance` | — (general `npm ci` verification) |
| `cloud-tests` | BrowserStack secrets (`BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY`) |

---

## Environment Variables

| Variable | Value | Set By |
|----------|-------|--------|
| `CI` | `true` | Workflow (enables 2 retries, 2 workers) |
| `BASE_URL` | `https://mb.io/` | Workflow |
| `BROWSERSTACK_USERNAME` | _(secret)_ | Repository secrets (cloud-tests only) |
| `BROWSERSTACK_ACCESS_KEY` | _(secret)_ | Repository secrets (cloud-tests only) |

---

## Artifacts

All jobs upload artifacts on completion (even on failure) with 14-day retention.

| Artifact Name | Contents | Produced By |
|---------------|----------|-------------|
| `allure-report-chromium` | HTML report (single-file) | test (chromium) |
| `allure-report-firefox` | HTML report (single-file) | test (firefox) |
| `allure-report-webkit` | HTML report (single-file) | test (webkit) |
| `allure-results-chromium` | Raw results, traces, screenshots, videos | test (chromium) |
| `allure-results-firefox` | Raw results, traces, screenshots, videos | test (firefox) |
| `allure-results-webkit` | Raw results, traces, screenshots, videos | test (webkit) |
| `a11y-results` | Accessibility scan results + axe JSON reports | accessibility |
| `perf-results` | Performance metrics JSON + test results | performance |
| `cloud-results` | BrowserStack test results | cloud-tests |

---

## Viewing Reports

After a workflow run completes:

1. Go to the **Actions** tab in the GitHub repository
2. Click the completed workflow run
3. Scroll to **Artifacts** section at the bottom
4. Download the desired report (e.g., `allure-report-chromium`)
5. Extract and open `index.html` in a browser

The Allure report includes:
- Pass/fail summary with test timeline
- Failure screenshots and browser console logs
- Traces and videos (for failed tests)
- Accessibility violation JSON attachments
- Performance metrics JSON attachments

---

## Required Repository Setup

### Secrets (for cloud execution)

Go to **Settings > Secrets and variables > Actions** and add:

| Secret | Description |
|--------|-------------|
| `BROWSERSTACK_USERNAME` | Your BrowserStack username |
| `BROWSERSTACK_ACCESS_KEY` | Your BrowserStack access key |

These are only needed for the `cloud-tests` job. All other jobs run without secrets.

### Branch Protection (recommended)

| Setting | Recommendation |
|---------|---------------|
| Require status checks | Enable for `test (chromium)`, `test (firefox)`, `test (webkit)` |
| Require branches to be up to date | Enable for PR checks |
| Required checks | `test`, `accessibility`, `performance` |

---

## Pipeline Behavior

| Scenario | What Happens |
|----------|-------------|
| Push to `main` | All 3 jobs run: test (3 browsers), accessibility, performance |
| Push to `develop` | Same as main |
| PR to `main` | Same as main — must pass before merge |
| Manual dispatch | All 4 jobs run including cloud-tests |
| One browser fails | Other browsers continue (`fail-fast: false`) |
| Test fails | Allure report + traces/screenshots still uploaded |
| npm dependency missing | Job fails immediately with error naming the missing package |
| BrowserStack creds missing | cloud-tests job fails with setup instructions |

---

## Workflow File Location

```
.github/
  workflows/
    playwright.yml      ← CI/CD pipeline definition
```
