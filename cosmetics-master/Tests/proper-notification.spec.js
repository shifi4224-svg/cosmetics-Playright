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
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
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

    test('הקמת נוטיפיקציה נאותה - בדיקת תווים מאופשרים ושמירה', async ({ page }) => {
        test.setTimeout(3600000); // שעה — הטסט בודק כל תו בכל שדה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `בדיקת תווים נאות ${uniqueId}`;
        const itemNameE = `Proper Char Test ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט נאות למאגר
        await regulationItemPage.AddItem(itemNameH, itemNameE, 1, false);

        // שלב 2: ממלא כל שדה בתווים שמאופשרים בפועל ושולח
        await properNotificationPage.CreateProperNotificationCharTest(itemNameH);

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