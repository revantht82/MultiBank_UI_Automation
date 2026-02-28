import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  readonly mainContent: Locator;
  readonly pageTitle: Locator;
  readonly sections: Locator;
  readonly headings: Locator;
  readonly subHeadings: Locator;
  readonly paragraphs: Locator;
  readonly images: Locator;
  readonly ctaLinks: Locator;

  // Company page specific
  readonly companyStats: Locator;
  readonly strengthCards: Locator;
  readonly communitySection: Locator;
  readonly getInTouchLink: Locator;

  // Features page specific
  readonly featureCards: Locator;

  constructor(page: Page) {
    super(page);

    this.mainContent = page.locator('[class*="overflow-x-hidden"], main').first();
    this.pageTitle = page.locator('h1').first();
    this.sections = page.locator('section');
    this.headings = page.locator('h1, h2');
    this.subHeadings = page.locator('h3');
    this.paragraphs = page.locator('p');
    this.images = page.locator('img');
    this.ctaLinks = page.locator('a:has-text("Get in touch"), a:has-text("Contact")');

    // Company page: stats section (contains $2 trillion, 2,000,000+, 25+)
    this.companyStats = page.locator('section').first();
    // Strength cards in "The strength behind MultiBank Group" section
    this.strengthCards = page.locator('section:has-text("strength behind") img[alt]');
    // Community & Media section
    this.communitySection = page.locator('section:has-text("Community & Media")').first();
    // Get in touch CTA
    this.getInTouchLink = page.locator('a:has-text("Get in touch")').first();

    // Features page cards
    this.featureCards = page.locator('section').nth(1);
  }

  async openCompanyPage(): Promise<void> {
    console.log('[AboutPage] Opening company page...');
    await this.navigate('/en-AE/company');
    await this.waitForPageTitle();
    console.log(`[AboutPage] Company page loaded — URL: ${this.page.url()}`);
  }

  async openFeaturesPage(): Promise<void> {
    console.log('[AboutPage] Opening features page...');
    await this.navigate('/en-AE/features');
    await this.waitForPageTitle();
    console.log(`[AboutPage] Features page loaded — URL: ${this.page.url()}`);
  }

  /**
   * Wait for the page title (h1) to appear. If it doesn't load within 20s, reload and retry once.
   */
  private async waitForPageTitle(): Promise<void> {
    const appeared = await this.pageTitle
      .waitFor({ state: 'visible', timeout: 20000 })
      .then(() => true)
      .catch(() => false);

    if (!appeared) {
      console.log('[AboutPage] Page title did not load — reloading page...');
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.dismissOverlays();
      await this.pageTitle.waitFor({ state: 'visible', timeout: 20000 });
    }
  }

  async isMainContentVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.mainContent);
    console.log(`[AboutPage] Main content visible: ${visible}`);
    return visible;
  }

  async getPageTitleText(): Promise<string> {
    const text = await this.getText(this.pageTitle);
    console.log(`[AboutPage] Page title: ${text}`);
    return text;
  }

  async getSectionCount(): Promise<number> {
    const count = await this.countElements(this.sections);
    console.log(`[AboutPage] Section count: ${count}`);
    return count;
  }

  async getAllHeadingTexts(): Promise<string[]> {
    const texts = await this.getAllTexts(this.headings);
    const cleaned = texts.map(t => t.trim()).filter(t => t);
    console.log(`[AboutPage] Headings: ${cleaned.join(' | ')}`);
    return cleaned;
  }

  async getSubHeadingTexts(): Promise<string[]> {
    const texts = await this.getAllTexts(this.subHeadings);
    const cleaned = texts.map(t => t.trim()).filter(t => t);
    console.log(`[AboutPage] Sub-headings: ${cleaned.join(' | ')}`);
    return cleaned;
  }

  async getAllParagraphTexts(): Promise<string[]> {
    const texts = await this.getAllTexts(this.paragraphs);
    const cleaned = texts.filter(t => t.trim().length > 0);
    console.log(`[AboutPage] Paragraphs count: ${cleaned.length}`);
    return cleaned;
  }

  async getImageCount(): Promise<number> {
    const count = await this.countElements(this.images);
    console.log(`[AboutPage] Image count: ${count}`);
    return count;
  }

  async getFullPageText(): Promise<string> {
    return (await this.page.locator('body').textContent()) || '';
  }

  async pageContainsText(text: string): Promise<boolean> {
    const fullText = await this.getFullPageText();
    const contains = fullText.toLowerCase().includes(text.toLowerCase());
    console.log(`[AboutPage] Contains "${text}": ${contains}`);
    return contains;
  }

  // --- Company Page: Stats ---

  async getCompanyStatsText(): Promise<string> {
    const text = await this.companyStats.textContent().catch(() => '') || '';
    console.log(`[AboutPage] Company stats text (300): ${text.trim().substring(0, 300)}`);
    return text.trim();
  }

  async hasStatValue(value: string): Promise<boolean> {
    const text = await this.getCompanyStatsText();
    const has = text.includes(value);
    console.log(`[AboutPage] Has stat "${value}": ${has}`);
    return has;
  }

  // --- Company Page: Strength Cards ---

  async getStrengthCardImageAlts(): Promise<string[]> {
    await this.scrollToElement(this.strengthCards.first()).catch(() => {});
    const alts = await this.strengthCards.evaluateAll(imgs =>
      imgs.map(img => img.getAttribute('alt') || '').filter(alt => alt)
    );
    console.log(`[AboutPage] Strength card images: ${alts.join(' | ')}`);
    return alts;
  }

  // --- Company Page: Community & Media ---

  async isCommunityMediaVisible(): Promise<boolean> {
    await this.scrollToElement(this.communitySection).catch(() => {});
    const visible = await this.isVisible(this.communitySection);
    console.log(`[AboutPage] Community & Media visible: ${visible}`);
    return visible;
  }

  async getCommunityMediaText(): Promise<string> {
    await this.scrollToElement(this.communitySection).catch(() => {});
    const text = await this.communitySection.textContent().catch(() => '') || '';
    console.log(`[AboutPage] Community section text (200): ${text.trim().substring(0, 200)}`);
    return text.trim();
  }

  // --- Company Page: CTA ---

  async isGetInTouchVisible(): Promise<boolean> {
    await this.scrollToElement(this.getInTouchLink).catch(() => {});
    const visible = await this.isVisible(this.getInTouchLink);
    console.log(`[AboutPage] Get in touch visible: ${visible}`);
    return visible;
  }

  async getGetInTouchHref(): Promise<string> {
    const href = await this.getHref(this.getInTouchLink);
    console.log(`[AboutPage] Get in touch href: ${href}`);
    return href;
  }

  // --- Company Page: Article Images ---

  async getArticleImageAlts(): Promise<string[]> {
    const alts = await this.page.locator('section img[alt]').evaluateAll(imgs =>
      imgs.map(img => (img.getAttribute('alt') || '').trim()).filter(alt => alt)
    );
    console.log(`[AboutPage] Article image alts: ${alts.join(' | ')}`);
    return alts;
  }

  // --- Features Page ---

  async getFeatureSectionHeadings(): Promise<string[]> {
    const headings = await this.featureCards.locator('h1, h2, h3').allTextContents().catch(() => []);
    const cleaned = headings.map(h => h.trim()).filter(h => h);
    console.log(`[AboutPage] Feature section headings: ${cleaned.join(' | ')}`);
    return cleaned;
  }

  async getFeatureImageCount(): Promise<number> {
    const count = await this.featureCards.locator('img').count().catch(() => 0);
    console.log(`[AboutPage] Feature section images: ${count}`);
    return count;
  }
}
