require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const FilesPage = require('../Pages/Files');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const RegulationItemPage = require('../Pages/RegulationItem');
const ProperNotificationPage = require('../Pages/properNotification');
const After72HBasicPage = require('../Pages/After72HBasic');

test.describe('בדיקות אחרי 72 שעות', () => {
    let po;
    let env;
    let loginPage;
    let regulationNotificationPage;
    let regulationItemPage;
    let properNotificationPage;
    let after72hPage;

    test.setTimeout(3600000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charNotification: 'W-,ף.ץת43dדA',
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        const sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        properNotificationPage = new ProperNotificationPage(page, po, env, console);
        after72hPage = new After72HBasicPage(page, po, env, console);

        po.regulationNotification = regulationNotificationPage;
        po.properNotification = properNotificationPage;
        po.files = new FilesPage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('אחרי 72 שעות - בדיקת עריכת שדות נוטיפיקציה רגילה', async ({ page }) => {
        // הטסט מניח שיש נוטיפיקציה קיימת פתוחה בדף
        // ClickOnForm בודק אילו שדות פתוחים לעריכה ומבצע nextStep בכל שלב
        await after72hPage.ClickOnForm();
    });

    test('אחרי 72 שעות - עדכון נוטיפיקציה נאותה עם סיבות שינוי', async ({ page }) => {
        // הטסט מניח שיש נוטיפיקציה נאותה קיימת פתוחה בדף
        // Reasons מעדכנת שדות שונים ומוסיפה סיבת שינוי לכל אחד
        await after72hPage.Reasons();
    });

    test('אחרי 72 שעות - פתיחת שדות לעריכה ובדיקת הפורטל', async ({ page }) => {
        // שלב 1: פתיחת כל השדות לעריכה דרך הבקאנד
        await after72hPage.ValidateFieldEditability("check");

        // שלב 2: כניסה לנוטיפיקציה קיימת ובדיקה שכל השדות פתוחים לעריכה
        await page.goto(env.url);
        await after72hPage.ClickOnForm();

        const allEditable = await after72hPage.checkAllFieldsEditable(true);
        expect(allEditable).toBe(true);
    });

    test('אחרי 72 שעות - נעילת שדות לעריכה ובדיקת הפורטל', async ({ page }) => {
        // שלב 1: נעילת כל השדות דרך הבקאנד
        await after72hPage.ValidateFieldEditability("uncheck");

        // שלב 2: כניסה לנוטיפיקציה קיימת ובדיקה שכל השדות נעולים
        await page.goto(env.url);
        const allLocked = await after72hPage.checkAllFieldsEditable(false);
        expect(allLocked).toBe(true);
    });
});
