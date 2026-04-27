import { Page, Locator, expect } from '@playwright/test';
import data from '../pages/data.js';


export class LoginPage {
  readonly page: Page;

  readonly tz: Locator;
  readonly sl: Locator;
  readonly bb: Locator;
  readonly ambulancePortal: Locator;
  readonly main: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tz = page.locator('//*[@aria-label="תעודת זהות"]');
    this.sl = page.locator('//*[@aria-label="שנת לידה"]');
    this.bb = page.locator('//*[@class="submit-login-year-of-birth w-100"]');
    this.ambulancePortal = page.locator('//img[@alt="אמבולנס"]//..//*[text()=" כניסה לפורטל "]')
    this.main = page.locator('//div[@class="container buttons-container"]')
  }
  async login() {
    console.log('התחלת תהליך ההתחברות');
    await this.page.goto('https://licensingtest.health.gov.il');
    try {
      await this.tz.fill(data.id);
    } catch (error) {
      console.log('האתר לא עולה תקין כרגע');
      throw error; // Rethrow the error to fail the test
    }

    await this.sl.fill(data.birthYear);
    await this.bb.click();
    await this.page.pause(); // ← עוצר כאן, תזיני קוד ותלחצי Continue
    if (await this.ambulancePortal.isVisible()) {
      await this.ambulancePortal.click();
    }
    await expect(this.main).toBeVisible();
    console.log('התחברות בוצעה בהצלחה');
  }

}   