const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const ItemsPage = require('../Pages/Items');

test.describe('בדיקות עמוד פריטים וסטטוסים', () => {
    let po;
    let env;
    let loginPage;
    let itemsPage;
    let sharedUtils;

    // נותנים לטסט 5 דקות לרוץ עקב סריקת טבלאות ארוכה מרובת דפים
    test.setTimeout(300000);

    // מכין את הסביבה לפני כל טסט
    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        itemsPage = new ItemsPage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('אימות סכימות הסטטוסים בטבלת הפריטים בהשוואה לכרטיסיות', async ({ page }) => {
        await itemsPage.ValidateStatusSummary();
    });
});