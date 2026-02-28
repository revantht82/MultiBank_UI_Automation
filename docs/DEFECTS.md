# MultiBank UI Automation — Defect Log

## Test Run History

### Run 1 — Desktop (2026-02-28)

| Field | Value |
|-------|-------|
| **Date** | 2026-02-28 |
| **Projects** | Chromium (1920×1080), Firefox (1920×1080), WebKit (1920×1080) |
| **Total Tests** | 420 (140 tests × 3 browsers) |
| **Passed** | 420 |
| **Failed** | 0 |
| **Flaky** | 0 |
| **Duration** | 6.7 minutes |

### Run 2 — Samsung S26 Ultra Mobile (2026-02-28)

| Field | Value |
|-------|-------|
| **Date** | 2026-02-28 |
| **Projects** | Chromium-Samsung-S26-Ultra (412×915), Firefox-Samsung-S26-Ultra (412×915), WebKit-Samsung-S26-Ultra (412×915) |
| **Total Tests** | 420 (140 tests × 3 browsers) |
| **Passed** | 278 |
| **Failed** | 140 (all Firefox — `isMobile` not supported) |
| **Flaky** | 2 (WebKit — hamburger menu timing) |
| **Skipped** | 2 (accessibility — Chromium-only by design) |
| **Duration** | 5.3 minutes |
| **Playwright** | v1.58.2 |
| **Node.js** | v24.9.0 |

---

## Defect Table

| Defect ID | Severity | Browser | Spec File | Test Name | Description | Steps to Reproduce | Expected | Actual | Status |
|-----------|----------|---------|-----------|-----------|-------------|---------------------|----------|--------|--------|
| DEF-001 | Critical | Firefox | All 7 spec files | All 140 Firefox mobile tests | `isMobile` context option is not supported in Firefox (Playwright limitation). Config sets `isMobile: true` for `firefox-samsung-s26-ultra` and `firefox-iphone-17-pro-max` projects, causing instant crash on browser context creation. | 1. Run `npx playwright test --project=firefox-samsung-s26-ultra` | Tests execute with mobile viewport in Firefox | `browser.newContext: options.isMobile is not supported in Firefox` — all 140 tests fail in ~3ms each | Fixed |
| DEF-002 | Low | WebKit | `navigation.spec.ts` | "Explore" link should have correct href pattern | Flaky — hamburger menu animation timing on 412px viewport occasionally causes element not found. Passes on retry. | 1. Run `npx playwright test --project=webkit-samsung-s26-ultra tests/navigation.spec.ts:83` multiple times | Hamburger menu opens, Explore link href is read | Intermittent timeout (~32s) waiting for menu element. Passes on retry 1/2. | Open |
| DEF-003 | Low | WebKit | `navigation.spec.ts` | should navigate to Features page | Flaky — navigation via hamburger menu on 412px viewport intermittently slow. Passes on retry. | 1. Run `npx playwright test --project=webkit-samsung-s26-ultra tests/navigation.spec.ts:125 --grep=Features` multiple times | Page navigates to /features within timeout | Intermittent timeout (~6.8s). Passes on retry. | Open |

---

## Defect Severity Levels

| Severity | Description |
|----------|-------------|
| **Critical** | Application crash, data loss, security vulnerability |
| **High** | Major feature broken, no workaround |
| **Medium** | Feature partially broken, workaround exists |
| **Low** | Cosmetic issue, minor UI inconsistency |

---

## How to Log a Defect

When a test fails, add a row to the Defect Table above with:

1. **Defect ID** — Sequential: `DEF-001`, `DEF-002`, etc.
2. **Severity** — Critical / High / Medium / Low
3. **Browser** — Which browser(s) the defect occurs on
4. **Spec File** — The `.spec.ts` file containing the failing test
5. **Test Name** — Full test name from the describe/test block
6. **Description** — Brief summary of the defect
7. **Steps to Reproduce** — How to trigger the issue
8. **Expected** — What should happen
9. **Actual** — What actually happens
10. **Status** — Open / In Progress / Fixed / Closed

### Example Entry

| Defect ID | Severity | Browser | Spec File | Test Name | Description | Steps to Reproduce | Expected | Actual | Status |
|-----------|----------|---------|-----------|-----------|-------------|---------------------|----------|--------|--------|
| DEF-001 | High | WebKit | `navigation.spec.ts` | should navigate to Explore page | Explore link click does not navigate | 1. Open homepage 2. Click "Explore" nav link | URL changes to `/explore` | Page stays on homepage, timeout after 30s | Open |

---

## Report

The Allure report for this run is available at:
```
allure-report/index.html
```
This is a **self-contained single-file** HTML report — no server or `allure-results/` directory needed to view it. Just open the file directly in any browser.
