const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const SupervisedEmploeePage = require('../Pages/SupervisedEmploee');

test.describe('בדיקות עובד ממונה (איש קשר)', () => {
    let po;
    let env;
    let loginPage;
    let supervisedEmploeePage;
    let sharedUtils;

    // נותנים לטסט 3 דקות לרוץ עקב המתנות ופתיחת חלונות
    test.setTimeout(180000);

    // מכין את הסביבה לפני כל טסט
    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            charName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '0123456789',
            charEmail: '%_-.+W43dA',
            email: 'test@moh.gov.il'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);

        loginPage = new LoginPage(page, po, env, console);
        supervisedEmploeePage = new SupervisedEmploeePage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('הוספת עובד ממונה חדש', async ({ page }) => {
        await supervisedEmploeePage.AddSupervisedEmployee("ישראל", "ישראלי", "123456782", "0501234567", "israel@test.com");
    });

    test('עריכת פרטי עובד ממונה קיים', async ({ page }) => {
        await supervisedEmploeePage.EditSupervisedEmployee("ישראל מעודכן", "ישראלי מעודכן", "0509876543", "update@test.com");
    });

    test('ניתוק איש קשר (עובד ממונה)', async ({ page }) => {
        await supervisedEmploeePage.DisconnectSupervisedEmployee();
    });
});