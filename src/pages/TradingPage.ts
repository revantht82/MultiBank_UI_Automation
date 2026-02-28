import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TradingPage extends BasePage {
  // Explore page elements (the public-facing trading/market view)
  readonly cryptoAssetList: Locator;
  readonly cryptoAssetItems: Locator;

  // Filter tabs on explore page
  readonly hotTab: Locator;
  readonly gainersTab: Locator;
  readonly losersTab: Locator;
  readonly filterButtons: Locator;

  // Asset info
  readonly assetNames: Locator;
  readonly assetPrices: Locator;

  // Spot market section
  readonly spotMarketHeading: Locator;
  readonly topCryptoPricesHeading: Locator;
  readonly marketSentimentHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Crypto asset list container
    this.cryptoAssetList = page.locator('main, [class*="overflow-x-hidden"]').first();
    this.cryptoAssetItems = page.locator('a[href*="/explore/"]');

    // Explore page filter tabs
    this.hotTab = page.locator('button:has-text("Hot")').first();
    this.gainersTab = page.locator('button:has-text("Gainers")').first();
    this.losersTab = page.locator('button:has-text("Losers")').first();
    this.filterButtons = page.locator('button:has-text("Hot"), button:has-text("Gainers"), button:has-text("Losers")');

    // Asset details
    this.assetNames = page.locator('a[href*="/explore/"] img[alt]');
    this.assetPrices = page.locator('a[href*="/explore/"]');

    // Spot market section headings
    this.spotMarketHeading = page.locator('h1:has-text("Spot market"), h2:has-text("Spot market")').first();
    this.topCryptoPricesHeading = page.locator('h1:has-text("top crypto prices"), h2:has-text("top crypto prices"), h3:has-text("top crypto prices")').first();
    this.marketSentimentHeading = page.locator('h1:has-text("Market sentiment"), h2:has-text("Market sentiment"), h3:has-text("Market sentiment")').first();
  }

  async openExplorePage(): Promise<void> {
    console.log('[TradingPage] Navigating to Explore page...');
    await this.navigate('/en-AE/explore');
    await this.waitForCryptoAssets();
    console.log(`[TradingPage] Explore page loaded — URL: ${this.page.url()}`);
  }

  async openHomePage(): Promise<void> {
    console.log('[TradingPage] Navigating to Home page...');
    await this.navigate('/');
    await this.waitForCryptoAssets();
    console.log(`[TradingPage] Home page loaded — URL: ${this.page.url()}`);
  }

  /**
   * Wait for crypto assets to appear. If they don't load within 20s, reload and retry once.
   * This handles site-side JS errors that occasionally prevent SPA content from rendering.
   */
  private async waitForCryptoAssets(): Promise<void> {
    const appeared = await this.cryptoAssetItems.first()
      .waitFor({ state: 'visible', timeout: 20000 })
      .then(() => true)
      .catch(() => false);

    if (!appeared) {
      console.log('[TradingPage] Crypto assets did not load — reloading page...');
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.dismissOverlays();
      await this.cryptoAssetItems.first().waitFor({ state: 'visible', timeout: 20000 });
    }
  }

  async getCryptoAssetCount(): Promise<number> {
    const count = await this.countElements(this.cryptoAssetItems);
    console.log(`[TradingPage] Crypto asset count: ${count}`);
    return count;
  }

  async getCryptoAssetTexts(): Promise<string[]> {
    const texts = await this.getAllTexts(this.cryptoAssetItems);
    console.log(`[TradingPage] Crypto assets found (${texts.length}):`);
    texts.forEach((t, i) => console.log(`  [${i}] ${t.trim().substring(0, 80)}`));
    return texts;
  }

  async getFilterTabTexts(): Promise<string[]> {
    const texts = await this.getAllTexts(this.filterButtons);
    console.log(`[TradingPage] Filter tabs: ${texts.map(t => t.trim()).join(', ')}`);
    return texts;
  }

  async getFilterTabCount(): Promise<number> {
    const count = await this.countElements(this.filterButtons);
    console.log(`[TradingPage] Filter tab count: ${count}`);
    return count;
  }

  async clickHotTab(): Promise<void> {
    console.log('[TradingPage] Clicking Hot tab...');
    await this.scrollToElement(this.hotTab);
    await this.clickElement(this.hotTab);
    console.log('[TradingPage] Hot tab clicked');
  }

  async clickGainersTab(): Promise<void> {
    console.log('[TradingPage] Clicking Gainers tab...');
    await this.scrollToElement(this.gainersTab);
    await this.clickElement(this.gainersTab);
    console.log('[TradingPage] Gainers tab clicked');
  }

  async clickLosersTab(): Promise<void> {
    console.log('[TradingPage] Clicking Losers tab...');
    await this.scrollToElement(this.losersTab);
    await this.clickElement(this.losersTab);
    console.log('[TradingPage] Losers tab clicked');
  }

  async clickFilterTab(tabName: string): Promise<void> {
    console.log(`[TradingPage] Clicking filter tab: ${tabName}...`);
    const tab = this.page.locator(`button:has-text("${tabName}")`).first();
    await this.scrollToElement(tab);
    await this.clickElement(tab);
    console.log(`[TradingPage] Filter tab "${tabName}" clicked`);
  }

  async getAssetImageAlts(): Promise<string[]> {
    const alts = await this.assetNames.evaluateAll(imgs =>
      imgs.map(img => img.getAttribute('alt') || '').filter(alt => alt)
    );
    console.log(`[TradingPage] Asset image alts (${alts.length}): ${alts.join(', ')}`);
    return alts;
  }

  async isAssetListVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.cryptoAssetList);
    console.log(`[TradingPage] Asset list visible: ${visible}`);
    return visible;
  }

  // --- Spot Market Section ---

  async isSpotMarketHeadingVisible(): Promise<boolean> {
    await this.scrollToElement(this.spotMarketHeading).catch(() => {});
    const visible = await this.isVisible(this.spotMarketHeading);
    console.log(`[TradingPage] Spot market heading visible: ${visible}`);
    return visible;
  }

  async isTopCryptoPricesHeadingVisible(): Promise<boolean> {
    await this.scrollToElement(this.topCryptoPricesHeading).catch(() => {});
    const visible = await this.isVisible(this.topCryptoPricesHeading);
    console.log(`[TradingPage] Top crypto prices heading visible: ${visible}`);
    return visible;
  }

  async isMarketSentimentHeadingVisible(): Promise<boolean> {
    await this.scrollToElement(this.marketSentimentHeading).catch(() => {});
    const visible = await this.isVisible(this.marketSentimentHeading);
    console.log(`[TradingPage] Market sentiment heading visible: ${visible}`);
    return visible;
  }

  /**
   * Get trading pair card details: symbol, name, href, and whether an icon image exists.
   * Uses a single evaluateAll call instead of per-element round-trips for speed.
   */
  async getTradingPairDetails(): Promise<{ symbol: string; name: string; href: string; hasIcon: boolean }[]> {
    const pairs = await this.cryptoAssetItems.evaluateAll(cards =>
      cards.map(card => {
        const spans = card.querySelectorAll('span');
        return {
          symbol: spans[0]?.textContent?.trim() || '',
          name: spans[1]?.textContent?.trim() || '',
          href: card.getAttribute('href') || '',
          hasIcon: card.querySelectorAll('img').length > 0,
        };
      })
    );

    console.log(`[TradingPage] Trading pair details (${pairs.length}):`);
    pairs.forEach((p, i) => console.log(`  [${i}] ${p.symbol} (${p.name}) → ${p.href} | icon: ${p.hasIcon}`));
    return pairs;
  }

  /**
   * Get asset count for a specific category tab (Hot, Gainers, Losers).
   */
  async getAssetCountForTab(tabName: string): Promise<number> {
    console.log(`[TradingPage] Switching to "${tabName}" tab...`);
    await this.clickFilterTab(tabName);
    // Wait for asset list to be populated after tab switch
    await this.cryptoAssetItems.first().waitFor({ state: 'visible', timeout: 5000 });
    const count = await this.countElements(this.cryptoAssetItems);
    console.log(`[TradingPage] Assets in "${tabName}" tab: ${count}`);
    return count;
  }

  /**
   * Get all page headings on the explore page.
   */
  async getExplorePageHeadings(): Promise<string[]> {
    const headings = await this.page.locator('h1, h2, h3').allTextContents();
    const filtered = headings.map(h => h.trim()).filter(h => h.length > 0);
    console.log(`[TradingPage] Explore page headings: ${filtered.join(' | ')}`);
    return filtered;
  }
}
