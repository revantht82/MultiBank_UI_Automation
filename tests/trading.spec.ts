import { test, expect } from '../src/fixtures/test-fixtures';
import { loadTestData } from '../src/utils/helpers';

interface CryptoAsset {
  name: string;
  symbol: string;
}

interface SpotMarketData {
  headings: string[];
  minimumAssetsPerCategory: number;
  assetsPerTab: number;
  expectedHrefPattern: string;
  cardStructure: {
    hasSymbol: boolean;
    hasName: boolean;
    hasIcon: boolean;
    hrefFormat: string;
  };
}

interface TradingData {
  exploreTabs: string[];
  expectedCryptoAssets: CryptoAsset[];
  minimumAssetsOnHomepage: number;
  explorePageUrl: string;
  spotMarket: SpotMarketData;
}

const tradingData = loadTestData<TradingData>('trading-pairs.json');

test.describe('Trading - Homepage Crypto Assets', () => {
  test.beforeEach(async ({ tradingPage }) => {
    await tradingPage.openHomePage();
  });

  test('should display crypto asset list on homepage', async ({ tradingPage }) => {
    const isVisible = await tradingPage.isAssetListVisible();
    expect(isVisible).toBe(true);
  });

  test('should display minimum number of crypto assets', async ({ tradingPage }) => {
    const count = await tradingPage.getCryptoAssetCount();
    expect(count).toBeGreaterThanOrEqual(tradingData.minimumAssetsOnHomepage);
  });

  test('should display expected crypto assets', async ({ tradingPage }) => {
    const assetTexts = await tradingPage.getCryptoAssetTexts();
    const combinedText = assetTexts.join(' ').toLowerCase();

    for (const asset of tradingData.expectedCryptoAssets) {
      expect.soft(
        combinedText,
        `Homepage should display ${asset.name}`
      ).toContain(asset.name.toLowerCase());
    }
  });

  test('should display crypto asset images with correct alt text', async ({ tradingPage }) => {
    const alts = await tradingPage.getAssetImageAlts();
    expect(alts.length).toBeGreaterThan(0);

    // Verify at least some expected assets appear in image alts
    const combinedAlts = alts.join(' ').toLowerCase();
    let matchCount = 0;
    for (const asset of tradingData.expectedCryptoAssets) {
      if (combinedAlts.includes(asset.name.toLowerCase())) {
        matchCount++;
      }
    }
    expect(matchCount).toBeGreaterThanOrEqual(1);
  });

  test('should have asset links pointing to explore pages', async ({ page }) => {
    const links = page.locator('a[href*="/explore/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    // Verify first link has valid href
    const href = await links.first().getAttribute('href');
    expect(href).toContain('/explore/');
  });

  test('should display price information for crypto assets', async ({ tradingPage }) => {
    const assetTexts = await tradingPage.getCryptoAssetTexts();
    // Asset texts should contain dollar signs (price info)
    const textsWithPrice = assetTexts.filter(t => t.includes('$'));
    expect(textsWithPrice.length).toBeGreaterThan(0);
  });

  test('should display percentage change for crypto assets', async ({ tradingPage }) => {
    const assetTexts = await tradingPage.getCryptoAssetTexts();
    // Asset texts should contain percentage signs
    const textsWithPercent = assetTexts.filter(t => t.includes('%'));
    expect(textsWithPercent.length).toBeGreaterThan(0);
  });
});

test.describe('Trading - Explore Page', () => {
  test.beforeEach(async ({ tradingPage }) => {
    await tradingPage.openExplorePage();
  });

  test('should load the explore page', async ({ page }) => {
    const url = page.url().toLowerCase();
    expect(url).toContain('/explore');
  });

  test('should display filter tabs on explore page', async ({ tradingPage }) => {
    const tabCount = await tradingPage.getFilterTabCount();
    expect(tabCount).toBeGreaterThanOrEqual(tradingData.exploreTabs.length);
  });

  test('should display expected filter tabs', async ({ tradingPage }) => {
    const tabTexts = await tradingPage.getFilterTabTexts();
    const combinedText = tabTexts.join(' ').toLowerCase();

    for (const tab of tradingData.exploreTabs) {
      expect.soft(
        combinedText,
        `Should display tab: ${tab}`
      ).toContain(tab.toLowerCase());
    }
  });

  for (const tab of tradingData.exploreTabs) {
    test(`should switch to ${tab} filter tab`, async ({ tradingPage }) => {
      await tradingPage.clickFilterTab(tab);
      // Page should still show asset list after switching tabs
      const isVisible = await tradingPage.isAssetListVisible();
      expect(isVisible).toBe(true);
    });
  }
});

test.describe('Spot Trading - Section Display', () => {
  test.beforeEach(async ({ tradingPage }) => {
    await tradingPage.openExplorePage();
  });

  test('should display "Spot market" heading', async ({ tradingPage }) => {
    const visible = await tradingPage.isSpotMarketHeadingVisible();
    expect(visible).toBe(true);
  });

  test('should display "Today\'s top crypto prices" heading', async ({ tradingPage, page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport !== null && viewport.width < 1024, 'Heading not rendered on mobile/tablet layout');
    const visible = await tradingPage.isTopCryptoPricesHeadingVisible();
    expect(visible).toBe(true);
  });

  test('should display "Market sentiment" heading', async ({ tradingPage }) => {
    const visible = await tradingPage.isMarketSentimentHeadingVisible();
    expect(visible).toBe(true);
  });

  test('should display expected explore page headings', async ({ tradingPage }) => {
    const headings = await tradingPage.getExplorePageHeadings();
    const combined = headings.join(' ').toLowerCase();

    for (const heading of tradingData.spotMarket.headings) {
      expect.soft(
        combined,
        `Explore page should contain heading: "${heading}"`
      ).toContain(heading.toLowerCase());
    }
  });
});

test.describe('Spot Trading - Trading Pair Data Structure', () => {
  test.beforeEach(async ({ tradingPage }) => {
    await tradingPage.openExplorePage();
  });

  test('should display trading pairs with correct card structure', async ({ tradingPage }) => {
    const pairs = await tradingPage.getTradingPairDetails();
    expect(pairs.length).toBeGreaterThanOrEqual(tradingData.spotMarket.minimumAssetsPerCategory);

    for (const pair of pairs) {
      // Each card must have a symbol
      if (tradingData.spotMarket.cardStructure.hasSymbol) {
        expect.soft(pair.symbol, `Pair should have a symbol`).toBeTruthy();
      }
      // Each card must have a full name
      if (tradingData.spotMarket.cardStructure.hasName) {
        expect.soft(pair.name, `Pair ${pair.symbol} should have a name`).toBeTruthy();
      }
      // Each card must have an icon image
      if (tradingData.spotMarket.cardStructure.hasIcon) {
        expect.soft(pair.hasIcon, `Pair ${pair.symbol} should have an icon`).toBe(true);
      }
    }
  });

  test('should have trading pair links with correct href format', async ({ tradingPage }) => {
    const pairs = await tradingPage.getTradingPairDetails();

    for (const pair of pairs) {
      expect.soft(
        pair.href,
        `${pair.symbol} href should contain ${tradingData.spotMarket.expectedHrefPattern}`
      ).toContain(tradingData.spotMarket.expectedHrefPattern);

      // Verify href matches /explore/{SYMBOL}
      expect.soft(
        pair.href,
        `${pair.symbol} href should end with its symbol`
      ).toContain(`/explore/${pair.symbol}`);
    }
  });

  test('should display expected crypto assets in trading pairs', async ({ tradingPage }) => {
    const pairs = await tradingPage.getTradingPairDetails();
    const symbols = pairs.map(p => p.symbol.toUpperCase());

    for (const asset of tradingData.expectedCryptoAssets) {
      expect.soft(
        symbols,
        `Spot market should include ${asset.symbol}`
      ).toContain(asset.symbol.toUpperCase());
    }
  });
});

test.describe('Spot Trading - Category Tabs Display Trading Pairs', () => {
  test.beforeEach(async ({ tradingPage }) => {
    await tradingPage.openExplorePage();
  });

  for (const tab of tradingData.exploreTabs) {
    test(`"${tab}" tab should display trading pairs`, async ({ tradingPage }) => {
      const count = await tradingPage.getAssetCountForTab(tab);
      expect(count).toBeGreaterThanOrEqual(tradingData.spotMarket.minimumAssetsPerCategory);
    });

    test(`"${tab}" tab trading pairs should have valid structure`, async ({ tradingPage }) => {
      await tradingPage.clickFilterTab(tab);
      await tradingPage.cryptoAssetItems.first().waitFor({ state: 'visible', timeout: 5000 });
      const pairs = await tradingPage.getTradingPairDetails();

      expect(pairs.length).toBeGreaterThan(0);
      // Verify first pair has all required fields
      const first = pairs[0];
      expect(first.symbol).toBeTruthy();
      expect(first.name).toBeTruthy();
      expect(first.href).toContain('/explore/');
      expect(first.hasIcon).toBe(true);
    });
  }

  test('different tabs should display different trading pairs', async ({ tradingPage }) => {
    // Get first pair from Hot tab
    await tradingPage.clickHotTab();
    await tradingPage.cryptoAssetItems.first().waitFor({ state: 'visible', timeout: 5000 });
    const hotPairs = await tradingPage.getTradingPairDetails();
    const hotSymbols = hotPairs.map(p => p.symbol).join(',');

    // Get first pair from Gainers tab
    await tradingPage.clickGainersTab();
    await tradingPage.cryptoAssetItems.first().waitFor({ state: 'visible', timeout: 5000 });
    const gainersPairs = await tradingPage.getTradingPairDetails();
    const gainersSymbols = gainersPairs.map(p => p.symbol).join(',');

    // Hot and Gainers should show different ordering/pairs
    console.log(`[Test] Hot symbols: ${hotSymbols}`);
    console.log(`[Test] Gainers symbols: ${gainersSymbols}`);
    expect(hotSymbols).not.toEqual(gainersSymbols);
  });
});
