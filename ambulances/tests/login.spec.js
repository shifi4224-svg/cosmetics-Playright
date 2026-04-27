// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage.js';
// ייבוא המחלקה מהקובץ החדש (וודא שהנתיב ושם המחלקה תואמים לקוד שלך)
import { ReactivationPage } from '../pages/reactivation.js';

test('תהליך מלא: התחברות ומילוי טופס אישור חידוש הפעלה', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login();
  const reactivationPage = new ReactivationPage(page);
  // קריאה לפונקציה (החלף את 'submitReactivationForm' בשם הפונקציה האמיתי שיצרת)
  await reactivationPage.submitReactivationForm();
});
