import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly mainContent: Locator;
  readonly sections: Locator;
  readonly cryptoAssetLinks: Locator;
  readonly downloadAppLink: Locator;
  readonly openAccountLink: Locator;
  readonly exploreAllAssetsLink: Locator;
  readonly viewPlatformFeaturesLink: Locator;
  readonly paymentIcons: Locator;

  constructor(page: Page) {
    super(page);

    // Main content wrapper (Next.js structure: #__next > div.overflow-x-hidden)
    this.mainContent = page.locator('[class*="overflow-x-hidden"]').first();
    this.sections = page.locator('section');

    // Crypto asset links (e.g., /explore/BTC, /explore/ETH)
    this.cryptoAssetLinks = page.locator('a[href*="/explore/"]');

    // CTA links
    this.downloadAppLink = page.locator('a:has-text("Download the app")').first();
    this.openAccountLink = page.locator('a:has-text("Open an account")').first();
    this.exploreAllAssetsLink = page.locator('a:has-text("Explore all assets")').first();
    this.viewPlatformFeaturesLink = page.locator('a:has-text("View platform features")').first();

    // Payment method icons
    this.paymentIcons = page.locator('img[alt="Visa"], img[alt="Mastercard"], img[alt="Swift"], img[alt="American Express"]');
  }

  async open(): Promise<void> {
    await this.navigate('/');
    // Wait for hero section OR crypto asset links — whichever appears first
    // If neither appears within 20s, reload and retry (handles site-side JS errors)
    const appeared = await Promise.race([
      this.cryptoAssetLinks.first().waitFor({ state: 'visible', timeout: 20000 }).then(() => true),
      this.downloadAppLink.waitFor({ state: 'visible', timeout: 20000 }).then(() => true),
    ]).catch(() => false);

    if (!appeared) {
      console.log('[HomePage] Content did not load — reloading page...');
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.dismissOverlays();
      await Promise.race([
        this.cryptoAssetLinks.first().waitFor({ state: 'visible', timeout: 20000 }),
        this.downloadAppLink.waitFor({ state: 'visible', timeout: 20000 }),
      ]);
    }
  }

  async isMainContentVisible(): Promise<boolean> {
    return this.isVisible(this.mainContent);
  }

  async getSectionCount(): Promise<number> {
    return this.countElements(this.sections);
  }

  async getCryptoAssetCount(): Promise<number> {
    return this.countElements(this.cryptoAssetLinks);
  }

  async getCryptoAssetTexts(): Promise<string[]> {
    return this.getAllTexts(this.cryptoAssetLinks);
  }

  async isDownloadAppVisible(): Promise<boolean> {
    return this.isVisible(this.downloadAppLink);
  }

  async isOpenAccountVisible(): Promise<boolean> {
    return this.isVisible(this.openAccountLink);
  }

  async getPageBodyText(): Promise<string> {
    return (await this.page.locator('body').textContent()) || '';
  }
}
