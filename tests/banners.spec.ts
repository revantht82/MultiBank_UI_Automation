import { test, expect } from '../src/fixtures/test-fixtures';
import { loadTestData } from '../src/utils/helpers';

interface HomepageSection {
  id: string;
  expectedTextPatterns: string[];
  description: string;
}

interface BannerData {
  homepageSections: HomepageSection[];
  minimumSectionCount: number;
  heroSection: {
    expectedHeading: string;
    expectedCtaTexts: string[];
    expectedVisible: boolean;
  };
  bottomBanners: {
    khabibBanner: {
      expectedTextPatterns: string[];
      description: string;
    };
    tradingFeaturesPromo: {
      expectedHeading: string;
      expectedSubHeadings: string[];
      viewPlatformFeaturesUrl: string;
    };
    catchNextTrade: {
      expectedHeading: string;
      expectedCategories: string[];
      exploreAllAssetsUrl: string;
    };
  };
  minimumBottomBannerCount: number;
}

const bannerData = loadTestData<BannerData>('banners.json');

test.describe('Homepage Sections & Content', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should display minimum number of content sections', async ({ banner }) => {
    const sectionCount = await banner.getSectionCount();
    expect(sectionCount).toBeGreaterThanOrEqual(bannerData.minimumSectionCount);
  });

  test('should display the hero section', async ({ banner }) => {
    const isVisible = await banner.isHeroSectionVisible();
    expect(isVisible).toBe(true);
  });

  test('should display hero section with correct heading', async ({ banner }) => {
    const heroText = await banner.getHeroSectionText();
    expect(heroText.toLowerCase()).toContain(bannerData.heroSection.expectedHeading.toLowerCase());
  });

  for (const section of bannerData.homepageSections) {
    test(`should display ${section.description}`, async ({ banner }) => {
      const containsText = await banner.pageContainsText(section.expectedTextPatterns);
      expect.soft(
        containsText,
        `Page should contain: ${section.expectedTextPatterns.join(', ')}`
      ).toBe(true);
    });
  }

  test('should have sections with non-empty content', async ({ banner }) => {
    const sectionTexts = await banner.getAllSectionTexts();
    expect(sectionTexts.length).toBeGreaterThan(0);

    for (const text of sectionTexts) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('should display Download the app CTA', async ({ banner }) => {
    const isVisible = await banner.isDownloadAppLinkVisible();
    expect(isVisible).toBe(true);
  });

  test('should display Open an account CTA', async ({ banner }) => {
    const isVisible = await banner.isOpenAccountLinkVisible();
    expect(isVisible).toBe(true);
  });

  test('should have expected CTA buttons', async ({ page }) => {
    for (const ctaText of bannerData.heroSection.expectedCtaTexts) {
      const cta = page.locator(`a:has-text("${ctaText}")`).first();
      const isVisible = await cta.isVisible().catch(() => false);
      expect.soft(
        isVisible,
        `CTA "${ctaText}" should be visible`
      ).toBe(true);
    }
  });
});

test.describe('Marketing Banners - Bottom of Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should have minimum expected bottom banner sections', async ({ banner }) => {
    const count = await banner.getBottomBannerCount();
    expect(count).toBeGreaterThanOrEqual(bannerData.minimumBottomBannerCount);
  });

  test('should display Khabib/MBG Token marketing banner', async ({ banner }) => {
    const isVisible = await banner.isKhabibBannerVisible();
    expect(isVisible).toBe(true);
  });

  test('Khabib banner should contain expected text', async ({ banner }) => {
    const text = await banner.getKhabibBannerText();
    for (const pattern of bannerData.bottomBanners.khabibBanner.expectedTextPatterns) {
      expect.soft(
        text,
        `Khabib banner should contain "${pattern}"`
      ).toContain(pattern);
    }
  });

  test('should display trading features promo section', async ({ banner }) => {
    const isVisible = await banner.isTradingFeaturesPromoVisible();
    expect(isVisible).toBe(true);
  });

  test('trading features promo should have correct heading', async ({ banner }) => {
    const headings = await banner.getTradingFeaturesPromoHeadings();
    const combined = headings.join(' ').toLowerCase();
    expect(combined).toContain(bannerData.bottomBanners.tradingFeaturesPromo.expectedHeading.toLowerCase());
  });

  test('trading features promo should display sub-headings', async ({ banner }) => {
    const headings = await banner.getTradingFeaturesPromoHeadings();
    const combined = headings.join(' ').toLowerCase();
    for (const sub of bannerData.bottomBanners.tradingFeaturesPromo.expectedSubHeadings) {
      expect.soft(
        combined,
        `Should contain sub-heading: "${sub}"`
      ).toContain(sub.toLowerCase());
    }
  });

  test('should display View platform features link', async ({ banner }) => {
    const isVisible = await banner.isViewPlatformFeaturesVisible();
    expect(isVisible).toBe(true);
  });

  test('View platform features link should have correct href', async ({ banner }) => {
    const href = await banner.getViewPlatformFeaturesHref();
    expect(href.toLowerCase()).toContain(bannerData.bottomBanners.tradingFeaturesPromo.viewPlatformFeaturesUrl);
  });

  test('should display Catch your next trade section', async ({ banner }) => {
    const isVisible = await banner.isCatchNextTradeSectionVisible();
    expect(isVisible).toBe(true);
  });

  test('Catch your next trade should have correct heading', async ({ banner }) => {
    const headings = await banner.getCatchNextTradeHeadings();
    const combined = headings.join(' ').toLowerCase();
    expect(combined).toContain(bannerData.bottomBanners.catchNextTrade.expectedHeading.toLowerCase());
  });

  test('Catch your next trade should display category tabs', async ({ banner }) => {
    const headings = await banner.getCatchNextTradeHeadings();
    const combined = headings.join(' ').toLowerCase();
    for (const category of bannerData.bottomBanners.catchNextTrade.expectedCategories) {
      expect.soft(
        combined,
        `Should contain category: "${category}"`
      ).toContain(category.toLowerCase());
    }
  });
});
