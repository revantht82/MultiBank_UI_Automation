import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class Footer extends BasePage {
  readonly footerContainer: Locator;
  readonly footerLinks: Locator;
  readonly legalLinks: Locator;
  readonly contactUsLink: Locator;
  readonly hackenAuditLink: Locator;
  readonly paymentIcons: Locator;
  readonly copyrightText: Locator;
  readonly downloadAppLink: Locator;

  constructor(page: Page) {
    super(page);

    this.footerContainer = page.locator('footer').first();
    this.footerLinks = page.locator('footer a');

    // Legal section links
    this.legalLinks = page.locator('footer a[href*="about/"]');
    this.contactUsLink = page.locator('footer a[href*="contact"]').first();
    this.hackenAuditLink = page.locator('footer a[href*="hacken"]').first();

    // Payment method icons in footer
    this.paymentIcons = page.locator('footer img[alt="Mastercard"], footer img[alt="Visa"], footer img[alt="American Express"], footer img[alt="Swift"]');

    // Copyright text
    this.copyrightText = page.locator('footer').first();

    // Download app link (homepage)
    this.downloadAppLink = page.locator('a:has-text("Download the app")').first();
  }

  async isFooterVisible(): Promise<boolean> {
    await this.scrollToElement(this.footerContainer);
    const visible = await this.isVisible(this.footerContainer);
    console.log(`[Footer] Footer visible: ${visible}`);
    return visible;
  }

  async getFooterLinkTexts(): Promise<string[]> {
    await this.scrollToElement(this.footerContainer);
    const texts = await this.getAllTexts(this.footerLinks);
    console.log(`[Footer] Link texts: ${texts.map(t => t.trim()).filter(t => t).join(' | ')}`);
    return texts;
  }

  async getFooterLinkCount(): Promise<number> {
    const count = await this.countElements(this.footerLinks);
    console.log(`[Footer] Total footer links: ${count}`);
    return count;
  }

  async getLegalLinkTexts(): Promise<string[]> {
    await this.scrollToElement(this.footerContainer);
    const texts = await this.getAllTexts(this.legalLinks);
    console.log(`[Footer] Legal links: ${texts.map(t => t.trim()).filter(t => t).join(' | ')}`);
    return texts;
  }

  async getLegalLinkDetails(): Promise<{ text: string; href: string }[]> {
    await this.scrollToElement(this.footerContainer);
    const links: { text: string; href: string }[] = [];
    const count = await this.legalLinks.count();
    for (let i = 0; i < count; i++) {
      const link = this.legalLinks.nth(i);
      const text = ((await link.textContent()) || '').trim();
      const href = (await link.getAttribute('href')) || '';
      links.push({ text, href });
    }
    console.log(`[Footer] Legal link details (${links.length}):`);
    links.forEach((l, i) => console.log(`  [${i}] "${l.text}" → ${l.href}`));
    return links;
  }

  async getFooterLinkDetails(): Promise<{ text: string; href: string }[]> {
    await this.scrollToElement(this.footerContainer);
    const links: { text: string; href: string }[] = [];
    const count = await this.footerLinks.count();
    for (let i = 0; i < count; i++) {
      const link = this.footerLinks.nth(i);
      const text = ((await link.textContent()) || '').trim();
      const href = (await link.getAttribute('href')) || '';
      links.push({ text, href });
    }
    console.log(`[Footer] All footer link details (${links.length}):`);
    links.forEach((l, i) => console.log(`  [${i}] "${l.text}" → ${l.href}`));
    return links;
  }

  async isContactUsVisible(): Promise<boolean> {
    await this.scrollToElement(this.footerContainer);
    const visible = await this.isVisible(this.contactUsLink);
    console.log(`[Footer] Contact Us visible: ${visible}`);
    return visible;
  }

  async getContactUsHref(): Promise<string> {
    await this.scrollToElement(this.footerContainer);
    const href = await this.getHref(this.contactUsLink);
    console.log(`[Footer] Contact Us href: ${href}`);
    return href;
  }

  async isHackenAuditVisible(): Promise<boolean> {
    await this.scrollToElement(this.footerContainer);
    const visible = await this.isVisible(this.hackenAuditLink);
    console.log(`[Footer] Hacken audit link visible: ${visible}`);
    return visible;
  }

  async getHackenAuditHref(): Promise<string> {
    await this.scrollToElement(this.footerContainer);
    const href = await this.getHref(this.hackenAuditLink);
    console.log(`[Footer] Hacken audit href: ${href}`);
    return href;
  }

  async scrollToFooter(): Promise<void> {
    await this.scrollToElement(this.footerContainer);
    console.log('[Footer] Scrolled to footer');
  }

  async getFooterText(): Promise<string> {
    await this.scrollToElement(this.footerContainer);
    const text = await this.getText(this.footerContainer);
    console.log(`[Footer] Footer text (200): ${text.substring(0, 200)}`);
    return text;
  }

  // --- Payment Icons ---

  async getPaymentIconCount(): Promise<number> {
    await this.scrollToElement(this.footerContainer);
    const count = await this.countElements(this.paymentIcons);
    console.log(`[Footer] Payment icons count: ${count}`);
    return count;
  }

  async getPaymentIconAlts(): Promise<string[]> {
    await this.scrollToElement(this.footerContainer);
    const alts: string[] = [];
    const count = await this.paymentIcons.count();
    for (let i = 0; i < count; i++) {
      const alt = (await this.paymentIcons.nth(i).getAttribute('alt')) || '';
      alts.push(alt);
    }
    console.log(`[Footer] Payment icons: ${alts.join(', ')}`);
    return alts;
  }

  // --- Copyright ---

  async getCopyrightText(): Promise<string> {
    await this.scrollToElement(this.footerContainer);
    const text = (await this.footerContainer.textContent()) || '';
    // textContent() concatenates text nodes without whitespace, so match flexibly
    const match = text.match(/\d{4}\s*Copyright[^M]*/i);
    const copyright = match ? match[0].trim() : '';
    console.log(`[Footer] Copyright: ${copyright}`);
    return copyright;
  }

  async footerContainsText(pattern: string): Promise<boolean> {
    await this.scrollToElement(this.footerContainer);
    const text = (await this.footerContainer.textContent()) || '';
    const contains = text.toLowerCase().includes(pattern.toLowerCase());
    console.log(`[Footer] Contains "${pattern}": ${contains}`);
    return contains;
  }

  // --- Download Link ---

  async isDownloadAppLinkVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.downloadAppLink);
    console.log(`[Footer] Download app link visible: ${visible}`);
    return visible;
  }

  async getDownloadAppHref(): Promise<string> {
    const href = await this.getHref(this.downloadAppLink);
    console.log(`[Footer] Download app href: ${href}`);
    return href;
  }
}
