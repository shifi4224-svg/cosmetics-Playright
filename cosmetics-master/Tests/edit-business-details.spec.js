const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const EditBussinesDetailsPage = require('../Pages/EditBussinesDetails');

test.describe('בדיקות פרטי עסק - עריכת פרטי עסק', () => {
    let po;
    let env;
    let loginPage;
    let editBussinesDetailsPage;
    let sharedUtils;

    // נותנים לטסט 3 דקות לרוץ בגלל בדיקות התווים
    test.setTimeout(180000);

    // רץ לפני כל טסט בסוויטה ומכין את הסביבה
    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charEmail: '%_-.+W43dA',
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);

        // אתחול אובייקטי דפים (Pages)
        loginPage = new LoginPage(page, po, env, console);
        editBussinesDetailsPage = new EditBussinesDetailsPage(page, po, env, console);

        // התחברות לסביבת פיתוח
        await loginPage.LoginDev();
    });

    test('עדכון פרטי עסק כולל הרצת כל הולידציות לשדות', async ({ page }) => {
        await editBussinesDetailsPage.UpdateBusinessDetails(1, "עסק מעודכן אוטומציה", "0501111111", "new_email@test.com");
    });

    test('עדכון פרטי עסק מהיר ללא ולידציות', async ({ page }) => {
        await editBussinesDetailsPage.UpdateBusinessDetails(0, "עסק מעודכן מהיר", "0502222222", "fast_email@test.com");
    });
});