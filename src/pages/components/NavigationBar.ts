import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NavigationBar extends BasePage {
  readonly header: Locator;
  readonly logo: Locator;
  readonly hamburgerButton: Locator;

  // Primary nav items — use getByRole to match only visible/accessible elements
  // (hidden elements with display:none are excluded from the accessibility tree)
  readonly exploreLink: Locator;
  readonly featuresLink: Locator;
  readonly companyLink: Locator;
  readonly mbgLink: Locator;

  // Action links
  readonly signInLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.logo = page.locator('header a[href="/"]').first();
    // Hamburger menu button — accessible name "Open menu" on mobile/tablet
    this.hamburgerButton = page.getByRole('button', { name: /open menu/i });

    // Nav items — getByRole queries the accessibility tree, so hidden header links
    // on mobile (display:none) are automatically excluded. Only visible links match.
    this.exploreLink = page.getByRole('link', { name: 'Explore', exact: true }).first();
    this.featuresLink = page.getByRole('link', { name: 'Features', exact: true }).first();
    this.companyLink = page.getByRole('link', { name: 'Company', exact: true }).first();
    this.mbgLink = page.getByRole('link', { name: /\$MBG/ }).first();

    // Auth action links
    this.signInLink = page.getByRole('link', { name: 'Sign in', exact: true }).first();
    this.signUpLink = page.getByRole('link', { name: 'Sign up', exact: true }).first();
  }

  /**
   * Open the mobile hamburger menu if nav links are hidden (mobile/tablet viewports).
   * On mobile, the site renders nav links inside a Radix Dialog (div[role="dialog"]).
   * No-op on desktop where links are always visible in <header>.
   * Includes retry logic to handle MoEngage overlay interference.
   */
  async openMobileMenuIfNeeded(): Promise<void> {
    // Quick check: if dialog is already open, nothing to do
    const dialogAlreadyOpen = await this.page.locator('[role="dialog"]').isVisible().catch(() => false);
    if (dialogAlreadyOpen) return;

    // Check if hamburger exists — if not, we're on desktop where links are always visible
    const hamburgerVisible = await this.hamburgerButton.isVisible().catch(() => false);
    if (!hamburgerVisible) return;

    // Mobile viewport — need to open hamburger menu
    // Retry up to 3 times in case overlays intercept the click
    for (let attempt = 1; attempt <= 3; attempt++) {
      // Dismiss overlays before each attempt
      await this.dismissMoEngageOverlay();

      console.log(`[NavigationBar] Opening hamburger menu (attempt ${attempt})...`);
      await this.hamburgerButton.click({ force: attempt > 1 });

      // Wait for the dialog to appear
      const dialogAppeared = await this.page.locator('[role="dialog"]')
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      if (dialogAppeared) {
        // Wait for dialog entrance animation to settle before interacting
        await this.page.waitForTimeout(300);
        console.log('[NavigationBar] Mobile menu dialog opened successfully');
        return;
      }

      console.log(`[NavigationBar] Dialog did not appear after attempt ${attempt}`);

      // Check if hamburger click actually toggled something unexpected
      // (e.g., dialog opened and immediately closed, or overlay consumed the click)
      if (attempt < 3) {
        await this.page.waitForTimeout(500);
      }
    }

    console.log('[NavigationBar] WARNING: Failed to open mobile menu after 3 attempts');
  }

  /**
   * Close the mobile menu dialog if it's open.
   */
  async closeMobileMenuIfOpen(): Promise<void> {
    const closeButton = this.page.getByRole('button', { name: /close menu/i });
    const closeVisible = await closeButton.isVisible().catch(() => false);
    if (closeVisible) {
      console.log('[NavigationBar] Closing mobile menu dialog');
      await closeButton.click();
      await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }
  }

  async isHeaderVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.header);
    console.log(`[NavigationBar] Header visible: ${visible}`);
    return visible;
  }

  async isLogoVisible(): Promise<boolean> {
    const visible = await this.isVisible(this.logo);
    console.log(`[NavigationBar] Logo visible: ${visible}`);
    return visible;
  }

  async getLogoHref(): Promise<string> {
    const href = await this.getHref(this.logo);
    console.log(`[NavigationBar] Logo href: ${href}`);
    return href;
  }

  /**
   * Get the correct link locator based on viewport.
   * Desktop: header a | Mobile (dialog open): [role="dialog"] a
   */
  private async getActiveNavLinks(): Promise<Locator> {
    const dialogOpen = await this.page.locator('[role="dialog"]').isVisible().catch(() => false);
    return dialogOpen
      ? this.page.locator('[role="dialog"] a')
      : this.page.locator('header a');
  }

  async getHeaderLinkTexts(): Promise<string[]> {
    await this.waitForElement(this.header);
    await this.openMobileMenuIfNeeded();
    const navLinks = await this.getActiveNavLinks();
    const texts = await navLinks.allTextContents();
    console.log(`[NavigationBar] Header links: ${texts.map(t => t.trim()).filter(t => t).join(' | ')}`);
    return texts;
  }

  async getHeaderLinkCount(): Promise<number> {
    await this.openMobileMenuIfNeeded();
    const navLinks = await this.getActiveNavLinks();
    const count = await navLinks.count();
    console.log(`[NavigationBar] Header link count: ${count}`);
    return count;
  }

  /**
   * Get all header link details: text, href pairs.
   */
  async getHeaderLinkDetails(): Promise<{ text: string; href: string }[]> {
    await this.openMobileMenuIfNeeded();
    const navLinks = await this.getActiveNavLinks();
    const links: { text: string; href: string }[] = [];
    const count = await navLinks.count();

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const text = ((await link.textContent()) || '').trim();
      const href = (await link.getAttribute('href')) || '';
      links.push({ text, href });
    }

    console.log(`[NavigationBar] Header link details (${links.length}):`);
    links.forEach((l, i) => console.log(`  [${i}] "${l.text}" → ${l.href}`));
    return links;
  }

  async clickNavItem(itemName: string): Promise<void> {
    console.log(`[NavigationBar] Clicking nav item: ${itemName}...`);
    await this.openMobileMenuIfNeeded();
    const link = this.page.getByRole('link', { name: itemName, exact: true }).first();
    await link.waitFor({ state: 'visible', timeout: 5000 });
    await link.click();
    // Wait for navigation to settle after SPA transition
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for mobile dialog to close after navigation so next menu open works correctly
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    console.log(`[NavigationBar] Nav item "${itemName}" clicked — URL: ${this.page.url()}`);
  }

  async navigateToExplore(): Promise<void> {
    console.log('[NavigationBar] Navigating to Explore...');
    await this.openMobileMenuIfNeeded();
    await this.exploreLink.waitFor({ state: 'visible', timeout: 5000 });
    await this.exploreLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    console.log(`[NavigationBar] Explore clicked — URL: ${this.page.url()}`);
  }

  async navigateToFeatures(): Promise<void> {
    console.log('[NavigationBar] Navigating to Features...');
    await this.openMobileMenuIfNeeded();
    await this.featuresLink.waitFor({ state: 'visible', timeout: 5000 });
    await this.featuresLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    console.log(`[NavigationBar] Features clicked — URL: ${this.page.url()}`);
  }

  async navigateToCompany(): Promise<void> {
    console.log('[NavigationBar] Navigating to Company...');
    await this.openMobileMenuIfNeeded();
    await this.companyLink.waitFor({ state: 'visible', timeout: 5000 });
    await this.companyLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    console.log(`[NavigationBar] Company clicked — URL: ${this.page.url()}`);
  }

  async getNavItemHref(itemName: string): Promise<string> {
    await this.openMobileMenuIfNeeded();
    const link = this.page.getByRole('link', { name: itemName, exact: true }).first();
    const href = await this.getHref(link);
    console.log(`[NavigationBar] "${itemName}" href: ${href}`);
    return href;
  }

  async getSignInHref(): Promise<string> {
    await this.openMobileMenuIfNeeded();
    const href = await this.getHref(this.signInLink);
    console.log(`[NavigationBar] Sign In href: ${href}`);
    return href;
  }

  async getSignUpHref(): Promise<string> {
    await this.openMobileMenuIfNeeded();
    const href = await this.getHref(this.signUpLink);
    console.log(`[NavigationBar] Sign Up href: ${href}`);
    return href;
  }

  async isSignInVisible(): Promise<boolean> {
    await this.openMobileMenuIfNeeded();
    const visible = await this.isVisible(this.signInLink);
    console.log(`[NavigationBar] Sign In visible: ${visible}`);
    return visible;
  }

  async isSignUpVisible(): Promise<boolean> {
    await this.openMobileMenuIfNeeded();
    const visible = await this.isVisible(this.signUpLink);
    console.log(`[NavigationBar] Sign Up visible: ${visible}`);
    return visible;
  }

  /**
   * Check if the header is sticky (position: sticky or fixed).
   */
  async isHeaderSticky(): Promise<boolean> {
    const position = await this.header.evaluate((el) => {
      return window.getComputedStyle(el).position;
    });
    const sticky = position === 'sticky' || position === 'fixed';
    console.log(`[NavigationBar] Header position: ${position}, sticky: ${sticky}`);
    return sticky;
  }
}
