import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class Banner extends BasePage {
  readonly pageSections: Locator;
  readonly heroSection: Locator;
  readonly downloadAppLink: Locator;
  readonly openAccountLink: Locator;
  readonly startPortfolioLink: Locator;
  readonly viewPlatformFeaturesLink: Locator;

  // Bottom marketing banner sections
  readonly khabibBanner: Locator;
  readonly tradingFeaturesPromo: Locator;
  readonly catchNextTradeSection: Locator;

  constructor(page: Page) {
    super(page);

    // The site uses <section> elements for major content blocks
    this.pageSections = page.locator('section');

    // Hero / first section
    this.heroSection = page.locator('section').first();

    // CTAs on the homepage
    this.downloadAppLink = page.locator('a:has-text("Download the app")').first();
    this.openAccountLink = page.locator('a:has-text("Open an account")').first();
    this.startPortfolioLink = page.locator('a:has-text("Start Portfolio")').first();
    this.viewPlatformFeaturesLink = page.locator('a:has-text("View platform features")').first();

    // Bottom marketing banners (sections by heading content)
    this.khabibBanner = page.locator('section:has-text("Unblemished")').first();
    this.tradingFeaturesPromo = page.locator('section:has-text("Smarter ways to trade")').first();
    this.catchNextTradeSection = page.locator('section:has-text("Catch your next trade")').first();
  }

  async getSectionCount(): Promise<number> {
    const count = await this.countElements(this.pageSections);
    console.log(`[Banner] Section count: ${count}`);
    return count;
  }

  async isHeroSectionVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.heroSection);
    console.log(`[Banner] Hero section visible: ${visible}`);
    return visible;
  }

  async getHeroSectionText(): Promise<string> {
    const text = await this.getText(this.heroSection);
    console.log(`[Banner] Hero text (100): ${text.substring(0, 100)}`);
    return text;
  }

  async getAllSectionTexts(): Promise<string[]> {
    const sections = await this.pageSections.all();
    const texts: string[] = [];
    for (const section of sections) {
      const text = await section.textContent().catch(() => '');
      if (text && text.trim()) {
        texts.push(text.trim());
      }
    }
    console.log(`[Banner] Section texts retrieved: ${texts.length} sections`);
    return texts;
  }

  async getAllSectionHeadings(): Promise<string[]> {
    const headings: string[] = [];
    const sections = await this.pageSections.all();
    for (const section of sections) {
      const sectionHeadings = await section.locator('h1, h2, h3').allTextContents().catch(() => []);
      headings.push(...sectionHeadings.map(h => h.trim()).filter(h => h));
    }
    console.log(`[Banner] All section headings: ${headings.join(' | ')}`);
    return headings;
  }

  async pageContainsText(patterns: string[]): Promise<boolean> {
    const bodyText = (await this.page.locator('body').textContent()) || '';
    const lowerBody = bodyText.toLowerCase();
    const result = patterns.every(p => lowerBody.includes(p.toLowerCase()));
    console.log(`[Banner] Page contains [${patterns.join(', ')}]: ${result}`);
    return result;
  }

  async isDownloadAppLinkVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.downloadAppLink);
    console.log(`[Banner] Download app link visible: ${visible}`);
    return visible;
  }

  async isOpenAccountLinkVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.openAccountLink);
    console.log(`[Banner] Open account link visible: ${visible}`);
    return visible;
  }

  async getDownloadAppHref(): Promise<string> {
    const href = await this.getHref(this.downloadAppLink);
    console.log(`[Banner] Download app href: ${href}`);
    return href;
  }

  async getOpenAccountHref(): Promise<string> {
    const href = await this.getHref(this.openAccountLink);
    console.log(`[Banner] Open account href: ${href}`);
    return href;
  }

  async scrollToSection(index: number): Promise<void> {
    const section = this.pageSections.nth(index);
    await this.scrollToElement(section);
    console.log(`[Banner] Scrolled to section ${index}`);
  }

  // --- Bottom Marketing Banner Methods ---

  async isKhabibBannerVisible(): Promise<boolean> {
    await this.scrollToElement(this.khabibBanner).catch(() => {});
    const visible = await this.isVisible(this.khabibBanner);
    console.log(`[Banner] Khabib/MBG marketing banner visible: ${visible}`);
    return visible;
  }

  async getKhabibBannerText(): Promise<string> {
    await this.scrollToElement(this.khabibBanner).catch(() => {});
    const text = await this.khabibBanner.textContent().catch(() => '') || '';
    console.log(`[Banner] Khabib banner text (200): ${text.trim().substring(0, 200)}`);
    return text.trim();
  }

  async isTradingFeaturesPromoVisible(): Promise<boolean> {
    await this.scrollToElement(this.tradingFeaturesPromo).catch(() => {});
    const visible = await this.isVisible(this.tradingFeaturesPromo);
    console.log(`[Banner] Trading features promo visible: ${visible}`);
    return visible;
  }

  async getTradingFeaturesPromoHeadings(): Promise<string[]> {
    await this.scrollToElement(this.tradingFeaturesPromo).catch(() => {});
    const headings = await this.tradingFeaturesPromo.locator('h1, h2, h3').allTextContents();
    const cleaned = headings.map(h => h.trim()).filter(h => h);
    console.log(`[Banner] Trading features promo headings: ${cleaned.join(' | ')}`);
    return cleaned;
  }

  async isCatchNextTradeSectionVisible(): Promise<boolean> {
    await this.scrollToElement(this.catchNextTradeSection).catch(() => {});
    const visible = await this.isVisible(this.catchNextTradeSection);
    console.log(`[Banner] Catch your next trade section visible: ${visible}`);
    return visible;
  }

  async getCatchNextTradeHeadings(): Promise<string[]> {
    await this.scrollToElement(this.catchNextTradeSection).catch(() => {});
    const headings = await this.catchNextTradeSection.locator('h1, h2, h3').allTextContents();
    const cleaned = headings.map(h => h.trim()).filter(h => h);
    console.log(`[Banner] Catch next trade headings: ${cleaned.join(' | ')}`);
    return cleaned;
  }

  async getBottomBannerCount(): Promise<number> {
    const total = await this.countElements(this.pageSections);
    // Bottom banners are sections after the portfolio section (index >= 2)
    const bottomCount = Math.max(0, total - 2);
    console.log(`[Banner] Bottom banner sections (after portfolio): ${bottomCount}`);
    return bottomCount;
  }

  async isViewPlatformFeaturesVisible(): Promise<boolean> {
    await this.scrollToElement(this.viewPlatformFeaturesLink).catch(() => {});
    const visible = await this.isVisible(this.viewPlatformFeaturesLink);
    console.log(`[Banner] View platform features link visible: ${visible}`);
    return visible;
  }

  async getViewPlatformFeaturesHref(): Promise<string> {
    const href = await this.getHref(this.viewPlatformFeaturesLink);
    console.log(`[Banner] View platform features href: ${href}`);
    return href;
  }
}
