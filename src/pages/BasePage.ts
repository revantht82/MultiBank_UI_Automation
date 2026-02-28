import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  private _overlayDismissed = false;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = '/'): Promise<void> {
    // Retry navigation once on transient network errors (ERR_CONNECTION_CLOSED)
    try {
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    } catch {
      await this.page.waitForTimeout(1000);
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }
    this._overlayDismissed = false;
    await this.dismissOverlays();
  }

  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async clickElement(locator: Locator): Promise<void> {
    if (!this._overlayDismissed) {
      await this.dismissMoEngageOverlay();
    }
    await locator.waitFor({ state: 'visible' });
    await locator.click({ force: false });
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) || '';
  }

  async getHref(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.getAttribute('href')) || '';
  }

  async isVisible(locator: Locator, timeout?: number): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout || 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Dismiss the MoEngage push notification overlay and any alert prompts that block clicks.
   * First tries to click "Don't Allow" to permanently dismiss, then hides remaining elements via CSS.
   * Uses a single page.evaluate() call for speed — avoids separate getByRole/isVisible round-trips.
   */
  async dismissMoEngageOverlay(): Promise<void> {
    const dismissed = await this.page.evaluate(() => {
      let acted = false;
      // Click "Don't Allow" button if present
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        if (/don.t allow/i.test(btn.textContent || '')) {
          btn.click();
          acted = true;
          break;
        }
      }
      // CSS-hide MoEngage elements and alert overlays
      const moePushDiv = document.querySelector('#moe-push-div');
      if (moePushDiv) {
        (moePushDiv as HTMLElement).style.display = 'none';
        acted = true;
      }
      document.querySelectorAll('[class*="moe-"], [role="alert"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
        acted = true;
      });
      return acted;
    }).catch(() => false);

    if (dismissed) {
      await this.page.waitForTimeout(100);
    }
    this._overlayDismissed = true;
  }

  async dismissOverlays(): Promise<void> {
    await this.dismissMoEngageOverlay();

    // Dismiss cookie/modal overlays — single fast check with short timeout
    const combined = this.page.locator(
      'button:has-text("Accept"), button:has-text("Got it"), button:has-text("I agree"), ' +
      '[data-testid="cookie-accept"], .cookie-banner button, .modal-close, [aria-label="Close"], button.close'
    ).first();
    const visible = await combined.isVisible().catch(() => false);
    if (visible) {
      await combined.click().catch(() => {});
    }
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async countElements(locator: Locator): Promise<number> {
    return locator.count();
  }

  async getAllTexts(locator: Locator): Promise<string[]> {
    return locator.allTextContents();
  }

  async getAllHrefs(locator: Locator): Promise<string[]> {
    const elements = await locator.all();
    const hrefs: string[] = [];
    for (const el of elements) {
      const href = await el.getAttribute('href');
      if (href) hrefs.push(href);
    }
    return hrefs;
  }
}
