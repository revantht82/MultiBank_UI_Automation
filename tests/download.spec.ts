import { test, expect } from '../src/fixtures/test-fixtures';
import { loadTestData } from '../src/utils/helpers';

interface DownloadData {
  downloadApp: {
    linkText: string;
    expectedUrlPattern: string;
    shouldBeVisible: boolean;
  };
  signUpLink: {
    linkText: string;
    expectedUrlPattern: string;
    shouldBeVisible: boolean;
  };
  openAccountLink: {
    linkText: string;
    expectedUrlPattern: string;
    shouldBeVisible: boolean;
  };
  footer: {
    expectedLegalLinks: string[];
    expectedSupportLinks: string[];
    hackenAuditUrl: string;
    paymentIcons: string[];
    copyrightPattern: string;
    varaDisclosure: string;
    minimumFooterLinks: number;
  };
}

const downloadData = loadTestData<DownloadData>('download-links.json');

test.describe('Download & App Links', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should display the Download the app link', async ({ page }) => {
    const link = page.locator(`a:has-text("${downloadData.downloadApp.linkText}")`).first();
    await expect(link).toBeVisible();
  });

  test('should have Download link pointing to app deep link', async ({ page }) => {
    const link = page.locator(`a:has-text("${downloadData.downloadApp.linkText}")`).first();
    await expect(link).toBeVisible({ timeout: 15000 });
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href!.toLowerCase()).toContain(downloadData.downloadApp.expectedUrlPattern);
  });

  test('Download the app link should have valid URL format', async ({ page }) => {
    const link = page.locator(`a:has-text("${downloadData.downloadApp.linkText}")`).first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
  });

  test('should display the Sign Up link in header', async ({ page }) => {
    const link = page.locator(`header a:has-text("${downloadData.signUpLink.linkText}")`).first();
    await expect(link).toBeVisible();
  });

  test('should have Sign Up link pointing to registration', async ({ page }) => {
    const link = page.locator(`header a:has-text("${downloadData.signUpLink.linkText}")`).first();
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href!.toLowerCase()).toContain(downloadData.signUpLink.expectedUrlPattern);
  });

  test('should display the Open an account link', async ({ page }) => {
    const link = page.locator(`a:has-text("${downloadData.openAccountLink.linkText}")`).first();
    await expect(link).toBeVisible();
  });

  test('should have Open an account link pointing to registration', async ({ page }) => {
    const link = page.locator(`a:has-text("${downloadData.openAccountLink.linkText}")`).first();
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href!.toLowerCase()).toContain(downloadData.openAccountLink.expectedUrlPattern);
  });
});

test.describe('Footer - Structure & Links', () => {
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
    expect(linkCount).toBeGreaterThanOrEqual(downloadData.footer.minimumFooterLinks);
  });

  test('should display all expected legal links', async ({ footer }) => {
    await footer.scrollToFooter();
    const linkTexts = await footer.getFooterLinkTexts();
    const combinedText = linkTexts.join(' ').toLowerCase();

    for (const link of downloadData.footer.expectedLegalLinks) {
      expect.soft(
        combinedText,
        `Footer should contain legal link: "${link}"`
      ).toContain(link.toLowerCase());
    }
  });

  test('legal links should have valid hrefs', async ({ footer }) => {
    await footer.scrollToFooter();
    const links = await footer.getLegalLinkDetails();
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      expect.soft(
        link.href,
        `Legal link "${link.text}" should have a valid href`
      ).toBeTruthy();
      expect.soft(
        link.href.toLowerCase(),
        `Legal link "${link.text}" href should contain "about/"`
      ).toContain('about/');
    }
  });

  test('should display Contact Us link', async ({ footer }) => {
    const isVisible = await footer.isContactUsVisible();
    expect(isVisible).toBe(true);
  });

  test('Contact Us link should have correct href', async ({ footer }) => {
    const href = await footer.getContactUsHref();
    expect(href.toLowerCase()).toContain('contact');
  });

  test('should display Hacken audit link', async ({ footer }) => {
    const isVisible = await footer.isHackenAuditVisible();
    expect(isVisible).toBe(true);
  });

  test('Hacken audit link should point to correct URL', async ({ footer }) => {
    const href = await footer.getHackenAuditHref();
    expect(href.toLowerCase()).toContain(downloadData.footer.hackenAuditUrl);
  });
});

test.describe('Footer - Payment Methods & Compliance', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should display payment method icons', async ({ footer }) => {
    await footer.scrollToFooter();
    const count = await footer.getPaymentIconCount();
    expect(count).toBe(downloadData.footer.paymentIcons.length);
  });

  test('should display all expected payment icons', async ({ footer }) => {
    await footer.scrollToFooter();
    const alts = await footer.getPaymentIconAlts();
    for (const expected of downloadData.footer.paymentIcons) {
      expect.soft(
        alts,
        `Should display ${expected} payment icon`
      ).toContain(expected);
    }
  });

  test('should display copyright notice', async ({ footer }) => {
    const copyright = await footer.getCopyrightText();
    expect(copyright.toLowerCase()).toContain(downloadData.footer.copyrightPattern.toLowerCase());
  });

  test('should contain VARA regulatory disclosure', async ({ footer }) => {
    const contains = await footer.footerContainsText(downloadData.footer.varaDisclosure);
    expect(contains).toBe(true);
  });

  test('footer should contain "mb.io" branding', async ({ footer }) => {
    const contains = await footer.footerContainsText('mb.io');
    expect(contains).toBe(true);
  });
});
