import { test, expect } from '../src/fixtures/test-fixtures';
import { loadTestData } from '../src/utils/helpers';

interface NavItem {
  name: string;
  path: string;
  hrefPattern: string;
}

interface ActionLink {
  name: string;
  url: string;
}

interface NavigationData {
  topNavItems: NavItem[];
  headerActionLinks: ActionLink[];
  logo: { href: string; shouldBeVisible: boolean };
  headerStickyPosition: boolean;
  totalHeaderLinks: number;
  footerLegalLinks: string[];
  footerSupportLinks: string[];
  minimumNavItemCount: number;
  minimumFooterLinkCount: number;
}

const navData = loadTestData<NavigationData>('navigation.json');

test.describe('Navigation - Header Display', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should display the header/navigation bar', async ({ navigationBar }) => {
    const isVisible = await navigationBar.isHeaderVisible();
    expect(isVisible).toBe(true);
  });

  test('should display the company logo', async ({ navigationBar }) => {
    const isVisible = await navigationBar.isLogoVisible();
    expect(isVisible).toBe(true);
  });

  test('should have logo linking to homepage', async ({ navigationBar }) => {
    const href = await navigationBar.getLogoHref();
    expect(href).toBe(navData.logo.href);
  });

  test('should have sticky header position', async ({ navigationBar }) => {
    const isSticky = await navigationBar.isHeaderSticky();
    expect(isSticky).toBe(navData.headerStickyPosition);
  });

  test('should have expected total header links', async ({ navigationBar }) => {
    const linkCount = await navigationBar.getHeaderLinkCount();
    expect(linkCount).toBe(navData.totalHeaderLinks);
  });

  test('should have minimum expected navigation links', async ({ navigationBar }) => {
    const linkCount = await navigationBar.getHeaderLinkCount();
    expect(linkCount).toBeGreaterThanOrEqual(navData.minimumNavItemCount);
  });
});

test.describe('Navigation - Menu Items Display', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should display all expected navigation items', async ({ navigationBar }) => {
    const navTexts = await navigationBar.getHeaderLinkTexts();
    const combinedNavText = navTexts.join(' ').toLowerCase();

    for (const item of navData.topNavItems) {
      expect.soft(
        combinedNavText,
        `Navigation should contain "${item.name}"`
      ).toContain(item.name.toLowerCase());
    }
  });

  for (const item of navData.topNavItems) {
    test(`"${item.name}" link should have correct href pattern`, async ({ navigationBar }) => {
      const href = await navigationBar.getNavItemHref(item.name);
      expect(href.toLowerCase()).toContain(item.hrefPattern.toLowerCase());
    });
  }

  test('should display all header link details with valid hrefs', async ({ navigationBar }) => {
    const links = await navigationBar.getHeaderLinkDetails();
    expect(links.length).toBe(navData.totalHeaderLinks);

    for (const link of links) {
      expect.soft(link.href, `Link "${link.text}" should have a valid href`).toBeTruthy();
    }
  });

  test('should display Sign In link', async ({ navigationBar }) => {
    const isVisible = await navigationBar.isSignInVisible();
    expect(isVisible).toBe(true);
  });

  test('should display Sign Up link', async ({ navigationBar }) => {
    const isVisible = await navigationBar.isSignUpVisible();
    expect(isVisible).toBe(true);
  });

  test('Sign In link should point to login page', async ({ navigationBar }) => {
    const href = await navigationBar.getSignInHref();
    expect(href).toContain(navData.headerActionLinks[0].url);
  });

  test('Sign Up link should point to registration page', async ({ navigationBar }) => {
    const href = await navigationBar.getSignUpHref();
    expect(href).toContain(navData.headerActionLinks[1].url);
  });
});

test.describe('Navigation - Functional Link Destinations', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  for (const item of navData.topNavItems) {
    test(`should navigate to ${item.name} page`, async ({ navigationBar, page }) => {
      await navigationBar.clickNavItem(item.name);
      await page.waitForURL(`**${item.path}*`, { timeout: 30000, waitUntil: 'domcontentloaded' });
      const url = page.url().toLowerCase();
      expect(url).toContain(item.path.toLowerCase());
    });
  }

  test('should navigate back to homepage via logo', async ({ navigationBar, page }) => {
    // First navigate away
    await navigationBar.navigateToFeatures();
    await page.waitForURL('**/features*', { timeout: 30000, waitUntil: 'domcontentloaded' });
    expect(page.url().toLowerCase()).toContain('/features');

    // Click logo to go back
    await navigationBar.clickElement(navigationBar.logo);
    await page.waitForURL('**/en-AE', { timeout: 30000, waitUntil: 'domcontentloaded' });
    const url = page.url().toLowerCase();
    expect(url).not.toContain('/features');
  });

  test('navigation should persist across pages', async ({ navigationBar, page }) => {
    // Navigate to Features
    await navigationBar.navigateToFeatures();
    await page.waitForURL('**/features*', { timeout: 30000, waitUntil: 'domcontentloaded' });

    // Verify header still visible and has same link count
    const isVisible = await navigationBar.isHeaderVisible();
    expect(isVisible).toBe(true);

    const linkCount = await navigationBar.getHeaderLinkCount();
    expect(linkCount).toBe(navData.totalHeaderLinks);

    // Navigate to Company from Features
    await navigationBar.navigateToCompany();
    await page.waitForURL('**/company*', { timeout: 30000, waitUntil: 'domcontentloaded' });
    expect(page.url().toLowerCase()).toContain('/company');

    // Header should still be consistent
    const isStillVisible = await navigationBar.isHeaderVisible();
    expect(isStillVisible).toBe(true);
  });

  test('should navigate through all pages sequentially', async ({ navigationBar, page }) => {
    for (const item of navData.topNavItems) {
      await navigationBar.clickNavItem(item.name);
      await page.waitForURL(`**${item.path}*`, { timeout: 30000, waitUntil: 'domcontentloaded' });
      const url = page.url().toLowerCase();
      expect.soft(url, `URL should contain ${item.path} after clicking ${item.name}`).toContain(item.path.toLowerCase());
    }
  });
});

test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should display the footer section', async ({ footer }) => {
    const isVisible = await footer.isFooterVisible();
    expect(isVisible).toBe(true);
  });

  test('should have minimum expected footer links', async ({ footer }) => {
    await footer.scrollToFooter();
    const linkCount = await footer.getFooterLinkCount();
    expect(linkCount).toBeGreaterThanOrEqual(navData.minimumFooterLinkCount);
  });

  test('should display expected legal links in footer', async ({ footer }) => {
    await footer.scrollToFooter();
    const linkTexts = await footer.getFooterLinkTexts();
    const combinedText = linkTexts.join(' ').toLowerCase();

    for (const link of navData.footerLegalLinks) {
      expect.soft(
        combinedText,
        `Footer should contain "${link}"`
      ).toContain(link.toLowerCase());
    }
  });

  test('should display Contact Us link in footer', async ({ footer }) => {
    const isVisible = await footer.isContactUsVisible();
    expect(isVisible).toBe(true);
  });
});
