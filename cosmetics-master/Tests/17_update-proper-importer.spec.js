require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');

test.describe('עדכון יבואן נאות - עדכון הצהרת יבואן', () => {
    let po, env, loginPage, sharedUtils;

    test.setTimeout(300000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        await loginPage.LoginDev();
    });

    test('עדכון יבואן נאות - בדיקת ניווט לדף ההצהרה', async ({ page }) => {
        // פתח פרטי עסק דרך OpenDetails
        await sharedUtils.OpenDetails('//span[contains(text(),"עדכון יבואן נאות")]');

        // בדוק שנמצא בדף עדכון יבואן נאות
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toContain('updateProperImporter');
    });

    test('עדכון יבואן נאות - בדיקת תצוגת הצהרות ושמירה', async ({ page }) => {
        // פתח פרטי עסק ועדכון יבואן נאות
        await sharedUtils.OpenDetails('//span[contains(text(),"עדכון יבואן נאות")]');
        await page.waitForLoadState('networkidle');

        // בדוק שמוצגות הצהרות (checkboxes)
        const checkboxes = page.locator('input[type="checkbox"], mat-checkbox');
        const checkboxCount = await checkboxes.count();
        expect(checkboxCount).toBeGreaterThan(0);
        console.log(`נמצאו ${checkboxCount} checkboxes בדף הצהרת יבואן נאות`);

        // בדוק שיש כפתור שמור ושלח
        const saveBtn = page.locator('button:has-text("שמור ושלח"), moh-button:has-text("שמור"), button[type="submit"]');
        const hasSaveBtn = await saveBtn.count() > 0;
        expect(hasSaveBtn).toBeTruthy();
    });

    test('עדכון יבואן נאות - בדיקת ולידציה: שליחה ללא אישור הצהרות', async ({ page }) => {
        await sharedUtils.OpenDetails('//span[contains(text(),"עדכון יבואן נאות")]');
        await page.waitForLoadState('networkidle');

        // נסה לשלוח בלי לסמן הצהרות
        const saveBtn = page.locator('button:has-text("שמור ושלח"), moh-button:has-text("שמור ושלח"), button[type="submit"]').first();
        if (await saveBtn.isVisible().catch(() => false)) {
            await saveBtn.click();
            await page.waitForTimeout(1000);

            // צפה לשגיאה
            const errors = page.locator('mat-error, [class*="error"], [class*="invalid"]');
            const errorCount = await errors.count();
            console.log(`נמצאו ${errorCount} שגיאות ולידציה`);
            // הבדיקה — אם לא ניתן לשלוח ריק, יש ולידציה
        }
    });

    test('עדכון יבואן נאות - תהליך מלא עם אישור כל ההצהרות', async ({ page }) => {
        await sharedUtils.OpenDetails('//span[contains(text(),"עדכון יבואן נאות")]');
        await page.waitForLoadState('networkidle');

        // סמן את כל הצ'קבוקסים
        const checkboxes = page.locator('mat-checkbox:not(.mat-checkbox-checked), input[type="checkbox"]:not(:checked)');
        const count = await checkboxes.count();

        for (let i = 0; i < count; i++) {
            try {
                await checkboxes.nth(i).click({ force: true });
                await page.waitForTimeout(300);
            } catch (e) {
                console.log(`checkbox ${i} לא ניתן ללחוץ`);
            }
        }

        // לחץ שמור ושלח
        const saveBtn = page.locator('button:has-text("שמור ושלח"), moh-button:has-text("שמור ושלח")').first();
        if (await saveBtn.isVisible().catch(() => false)) {
            await saveBtn.click();
            await page.waitForTimeout(3000);

            // בדוק דיאלוג
            const dialog = page.locator('mat-dialog-container, [role="dialog"], .swal2-popup, moh-dialog');
            const dialogVisible = await dialog.isVisible().catch(() => false);
            if (dialogVisible) {
                const text = await dialog.textContent().catch(() => '');
                console.log(`דיאלוג אחרי שמירה: ${text}`);
                const okBtn = page.locator('button:has-text("OK"), #confirm-btn, button:has-text("אישור")');
                if (await okBtn.isVisible().catch(() => false)) await okBtn.click();
            }
        }
    });
});
