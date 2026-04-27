const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationNotificationPage = require('../Pages/RegulationNotification');

test.describe('בדיקות נוטיפיקציות - יצירת נוטיפיקציה מלאה ושפיות', () => {
    let po;
    let env;
    let loginPage;
    let regulationNotificationPage;
    let sharedUtils;

    // נותנים לטסט 5 דקות לרוץ עקב הזנת נתונים מרובה
    test.setTimeout(300000);

    // מכין את הסביבה לפני כל טסט
    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            charNotification: 'W-,ף.ץת43dדA',
            charManufactor: '&"\'W-,ף.ץת_ 43 ()dדA',
            charBusinessId: '0123456789',
            charOtherAddress: '\/()-\'".,AWdתץדף43'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);

        loginPage = new LoginPage(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        po.regulationNotification = regulationNotificationPage; // במקרה שיש תלות מעגלית

        await loginPage.LoginDev();
    });

    test('יצירת נוטיפיקציה - תהליך שפיות (Sanity)', async ({ page }) => {
        // מריץ את יצירת הנוטיפיקציה בתהליך השפיות עם הפעלת ולידציות
        await regulationNotificationPage.CreateNotificationSanity(true);
    });
});