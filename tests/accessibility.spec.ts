import { test, expect } from '../src/fixtures/test-fixtures';
import { loadTestData } from '../src/utils/helpers';
import * as allure from 'allure-js-commons';

interface A11yPage {
  name: string;
  path: string;
  description: string;
}

interface AccessibilityData {
  pages: A11yPage[];
  wcagLevel: string;
  maxCriticalViolations: number;
  maxSeriousViolations: number;
}

const a11yData = loadTestData<AccessibilityData>('accessibility.json');

for (const pageConfig of a11yData.pages) {
  test.describe(`Accessibility - ${pageConfig.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageConfig.path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
    });

    test(`${pageConfig.name} should have no critical accessibility violations`, async ({ axeBuilder }) => {
      const results = await axeBuilder.analyze();

      const critical = results.violations.filter(v => v.impact === 'critical');

      // Attach full report to Allure
      await allure.attachment(
        `${pageConfig.name} - Axe A11y Report`,
        Buffer.from(JSON.stringify(results.violations, null, 2), 'utf-8'),
        'application/json'
      );

      if (critical.length > 0) {
        console.log(`[A11y] ${pageConfig.name} — ${critical.length} CRITICAL violations:`);
        critical.forEach(v => console.log(`  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
      }

      expect(
        critical.length,
        `${pageConfig.name} has ${critical.length} critical a11y violations`
      ).toBeLessThanOrEqual(a11yData.maxCriticalViolations);
    });

    test(`${pageConfig.name} should have no serious accessibility violations`, async ({ axeBuilder }) => {
      const results = await axeBuilder.analyze();

      const serious = results.violations.filter(v => v.impact === 'serious');

      if (serious.length > 0) {
        console.log(`[A11y] ${pageConfig.name} — ${serious.length} SERIOUS violations:`);
        serious.forEach(v => console.log(`  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
      }

      expect(
        serious.length,
        `${pageConfig.name} has ${serious.length} serious a11y violations (max: ${a11yData.maxSeriousViolations})`
      ).toBeLessThanOrEqual(a11yData.maxSeriousViolations);
    });
  });
}
