// @ts-check
import { test, expect } from '@playwright/test';
import data from './data.js';

test('טופס רכישה או מכירה של כלי הצלה', async ({ page }) => {
  // הגדרת משתנים לאלמנטים
const buyOrSale= page.locator('//*[text()=" לרכישה/מכירה של כלי הצלה "]');

  // לחץ על כפתור ההגשה
  await buyOrSale.click();
  // Expect a title "to contain" a substring.
  //await expect(page).toHaveTitle(/cnpdev.health.gov.il/);
});