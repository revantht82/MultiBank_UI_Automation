import { test, expect } from '../src/fixtures/test-fixtures';
import { loadTestData } from '../src/utils/helpers';

interface AboutData {
  companyPage: {
    url: string;
    pageTitle: string;
    expectedHeadings: string[];
    expectedTextPatterns: string[];
    expectedSectionCount: number;
    subHeadings: string[];
    stats: {
      annualTurnover: string;
      customersWorldwide: string;
      officesGlobally: string;
    };
    strengthCards: string[];
    articleImages: string[];
    ctaLinks: {
      getInTouch: string;
    };
    minimumImageCount: number;
    minimumParagraphCount: number;
  };
  featuresPage: {
    url: string;
    pageTitle: string;
    expectedHeadings: string[];
    additionalHeadings: string[];
    solutionsSection: {
      heading: string;
      expectedCards: string[];
    };
    vipSection: {
      headingPattern: string;
    };
    minimumSectionCount: number;
    minimumFeatureImages: number;
  };
}

const aboutData = loadTestData<AboutData>('about-page.json');

test.describe('Company Page - Why MultiBank Group', () => {
  test.beforeEach(async ({ aboutPage }) => {
    await aboutPage.openCompanyPage();
  });

  test('should load the Company page successfully', async ({ aboutPage, page }) => {
    const isVisible = await aboutPage.isMainContentVisible();
    expect(isVisible).toBe(true);
    const url = page.url().toLowerCase();
    expect(url).toContain('/company');
  });

  test('should display the page title', async ({ aboutPage }) => {
    const title = await aboutPage.getPageTitleText();
    expect(title).toBeTruthy();
    expect(title).toContain(aboutData.companyPage.pageTitle);
  });

  test('should render expected content sections', async ({ aboutPage }) => {
    const sectionCount = await aboutPage.getSectionCount();
    expect(sectionCount).toBeGreaterThanOrEqual(aboutData.companyPage.expectedSectionCount);
  });

  test('should display expected headings', async ({ aboutPage }) => {
    const headings = await aboutPage.getAllHeadingTexts();
    const combinedHeadings = headings.join(' ').toLowerCase();

    for (const expected of aboutData.companyPage.expectedHeadings) {
      expect.soft(
        combinedHeadings,
        `Page should have heading: "${expected}"`
      ).toContain(expected.toLowerCase());
    }
  });

  test('should contain expected text content', async ({ aboutPage }) => {
    for (const pattern of aboutData.companyPage.expectedTextPatterns) {
      const contains = await aboutPage.pageContainsText(pattern);
      expect.soft(
        contains,
        `Page should contain text: "${pattern}"`
      ).toBe(true);
    }
  });

  test('should display sub-headings', async ({ aboutPage }) => {
    const subHeadings = await aboutPage.getSubHeadingTexts();
    const combinedText = subHeadings.join(' ').toLowerCase();

    for (const expected of aboutData.companyPage.subHeadings) {
      expect.soft(
        combinedText,
        `Page should have sub-heading: "${expected}"`
      ).toContain(expected.toLowerCase());
    }
  });

  test('should display images/graphics', async ({ aboutPage }) => {
    const imageCount = await aboutPage.getImageCount();
    expect(imageCount).toBeGreaterThanOrEqual(aboutData.companyPage.minimumImageCount);
  });

  test('should have paragraphs with meaningful content', async ({ aboutPage }) => {
    const paragraphs = await aboutPage.getAllParagraphTexts();
    expect(paragraphs.length).toBeGreaterThanOrEqual(aboutData.companyPage.minimumParagraphCount);

    const nonEmptyParagraphs = paragraphs.filter(p => p.trim().length > 10);
    expect(nonEmptyParagraphs.length).toBeGreaterThan(0);
  });

  test('should display multiple headings for content structure', async ({ aboutPage }) => {
    const headings = await aboutPage.getAllHeadingTexts();
    expect(headings.length).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Company Page - Stats & Key Figures', () => {
  test.beforeEach(async ({ aboutPage }) => {
    await aboutPage.openCompanyPage();
  });

  test('should display annual turnover stat', async ({ aboutPage }) => {
    const has = await aboutPage.hasStatValue(aboutData.companyPage.stats.annualTurnover);
    expect(has).toBe(true);
  });

  test('should display customers worldwide stat', async ({ aboutPage }) => {
    const has = await aboutPage.hasStatValue(aboutData.companyPage.stats.customersWorldwide);
    expect(has).toBe(true);
  });

  test('should display offices globally stat', async ({ aboutPage }) => {
    const has = await aboutPage.hasStatValue(aboutData.companyPage.stats.officesGlobally);
    expect(has).toBe(true);
  });
});

test.describe('Company Page - Strength Cards & Media', () => {
  test.beforeEach(async ({ aboutPage }) => {
    await aboutPage.openCompanyPage();
  });

  test('should display strength card images', async ({ aboutPage }) => {
    const alts = await aboutPage.getStrengthCardImageAlts();
    expect(alts.length).toBeGreaterThan(0);

    for (const expected of aboutData.companyPage.strengthCards) {
      expect.soft(
        alts.join(' ').toLowerCase(),
        `Should have strength card: "${expected}"`
      ).toContain(expected.toLowerCase());
    }
  });

  test('should display article images with correct alt text', async ({ aboutPage }) => {
    const alts = await aboutPage.getArticleImageAlts();
    for (const expected of aboutData.companyPage.articleImages) {
      expect.soft(
        alts.join(' ').toLowerCase(),
        `Should have article image: "${expected}"`
      ).toContain(expected.toLowerCase());
    }
  });

  test('should display Community & Media section', async ({ aboutPage }) => {
    const isVisible = await aboutPage.isCommunityMediaVisible();
    expect(isVisible).toBe(true);
  });

  test('Community & Media should have social content', async ({ aboutPage }) => {
    const text = await aboutPage.getCommunityMediaText();
    expect(text.length).toBeGreaterThan(50);
    expect(text.toLowerCase()).toContain('multibank');
  });

  test('should display Get in touch CTA', async ({ aboutPage }) => {
    const isVisible = await aboutPage.isGetInTouchVisible();
    expect(isVisible).toBe(true);
  });

  test('Get in touch should link to contact page', async ({ aboutPage }) => {
    const href = await aboutPage.getGetInTouchHref();
    expect(href).toContain(aboutData.companyPage.ctaLinks.getInTouch);
  });
});

test.describe('Features Page', () => {
  test.beforeEach(async ({ aboutPage }) => {
    await aboutPage.openFeaturesPage();
  });

  test('should load the Features page successfully', async ({ aboutPage, page }) => {
    const isVisible = await aboutPage.isMainContentVisible();
    expect(isVisible).toBe(true);
    const url = page.url().toLowerCase();
    expect(url).toContain('/features');
  });

  test('should display the Features page title', async ({ aboutPage }) => {
    const title = await aboutPage.getPageTitleText();
    expect(title.toLowerCase()).toContain(aboutData.featuresPage.pageTitle.toLowerCase());
  });

  test('should display expected feature headings', async ({ aboutPage }) => {
    const headings = await aboutPage.getAllHeadingTexts();
    const combinedHeadings = headings.join(' ').toLowerCase();

    for (const expected of aboutData.featuresPage.expectedHeadings) {
      expect.soft(
        combinedHeadings,
        `Features page should have heading: "${expected}"`
      ).toContain(expected.toLowerCase());
    }
  });

  test('should display additional feature headings', async ({ aboutPage }) => {
    const headings = await aboutPage.getAllHeadingTexts();
    const subHeadings = await aboutPage.getSubHeadingTexts();
    const allText = [...headings, ...subHeadings].join(' ').toLowerCase();

    for (const expected of aboutData.featuresPage.additionalHeadings) {
      expect.soft(
        allText,
        `Features page should have heading: "${expected}"`
      ).toContain(expected.toLowerCase());
    }
  });

  test('should have multiple content sections', async ({ aboutPage }) => {
    const sectionCount = await aboutPage.getSectionCount();
    expect(sectionCount).toBeGreaterThanOrEqual(aboutData.featuresPage.minimumSectionCount);
  });

  test('should display Solutions with advantages section', async ({ aboutPage }) => {
    const contains = await aboutPage.pageContainsText(aboutData.featuresPage.solutionsSection.heading);
    expect(contains).toBe(true);
  });

  test('Solutions section should have expected cards', async ({ aboutPage }) => {
    for (const card of aboutData.featuresPage.solutionsSection.expectedCards) {
      const contains = await aboutPage.pageContainsText(card);
      expect.soft(
        contains,
        `Solutions section should contain: "${card}"`
      ).toBe(true);
    }
  });

  test('should display VIP section', async ({ aboutPage }) => {
    const contains = await aboutPage.pageContainsText(aboutData.featuresPage.vipSection.headingPattern);
    expect(contains).toBe(true);
  });

  test('should display feature images', async ({ aboutPage }) => {
    const count = await aboutPage.getFeatureImageCount();
    expect(count).toBeGreaterThanOrEqual(aboutData.featuresPage.minimumFeatureImages);
  });
});

test.describe('Navigation to Company Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should navigate to Company page from header nav', async ({ navigationBar, page }) => {
    await navigationBar.navigateToCompany();
    await page.waitForURL('**/company*', { timeout: 15000, waitUntil: 'domcontentloaded' });
    const url = page.url().toLowerCase();
    expect(url).toContain('/company');
  });

  test('should navigate to Features page from header nav', async ({ navigationBar, page }) => {
    await navigationBar.navigateToFeatures();
    await page.waitForURL('**/features*', { timeout: 15000, waitUntil: 'domcontentloaded' });
    const url = page.url().toLowerCase();
    expect(url).toContain('/features');
  });
});
