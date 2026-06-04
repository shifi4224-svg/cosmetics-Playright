require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const RegulationItemPage = require('../Pages/RegulationItem');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const ProperNotificationPage = require('../Pages/properNotification');

test.describe('בדיקות הקמת נוטיפיקציה נאותה', () => {
    let po;
    let env;
    let loginPage;
    let properNotificationPage;
    let regulationItemPage;
    let regulationNotificationPage;

    test.setTimeout(300000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charNotification: 'W-,ף.ץת43dדA'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        loginPage = new LoginPage(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        properNotificationPage = new ProperNotificationPage(page, po, env, console);

        po.regulationNotification = regulationNotificationPage;

        await loginPage.LoginDev();
    });

    test('הקמת נוטיפיקציה נאותה עם ולידציות מלאות', async ({ page }) => {
        await properNotificationPage.CreateProperNotification(true);
    });

    test('הקמת נוטיפיקציה נאותה עם שמירת טיוטה אחרי כל שלב', async ({ page }) => {
        test.setTimeout(3600000); // שעה — הטסט כולל מילוי רב שלבים
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `נוטיפיקציה נאות טיוטות ${uniqueId}`;
        const itemNameE = `Proper Draft ${uniqueId}`;

        await regulationItemPage.AddItem(itemNameH, itemNameE, 1, false);

        const dialogText = await properNotificationPage.CreateProperNotificationWithDrafts(itemNameH);

        try {
            expect(dialogText).toContain('נוטיפיקציה נשמרה בהצלחה');
        } catch (err) {
            await page.pause();
            throw err;
        }
    });

    test('הקמת נוטיפיקציה נאותה - בדיקת תווים מאופשרים + מקסימום תווים ושמירה', async ({ page }) => {
        test.setTimeout(3600000); // שעה — הטסט בודק כל תו ומקסימום בכל שדה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `בדיקת תווים נאות ${uniqueId}`;
        const itemNameE = `Proper Char Test ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט נאות למאגר — כולל בדיקת תווים בשדות השם
        await regulationItemPage.AddItemCharTest(itemNameH, itemNameE, 1);

        // שלב 2: בודק תווים + מקסימום תווים בכל שדה וממלא מקסימום תווים מאופשרים
        await properNotificationPage.CreateProperNotificationCharAndMaxTest(itemNameH);

        // מוודא שהופיעה הודעת הצלחה וסוגר את הדיאלוג
        try {
            const text = await regulationNotificationPage.dialog.textContent();
            expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
            await regulationNotificationPage.okEnd.click();
        } catch (err) {
            await page.pause();
            throw err;
        }
    });
});