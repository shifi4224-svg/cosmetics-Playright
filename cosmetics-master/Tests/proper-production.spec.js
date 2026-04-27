const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const ProperProductionPage = require('../Pages/ProperProduction');
const DealerPage = require('../Pages/Dealer');

test.describe('בדיקות תנאי ייצור נאותים', () => {
    let po;
    let env;
    let loginPage;
    let properProductionPage;
    let sharedUtils;
    let dealerPage;

    // הגדרת זמן ריצה גבוה כי התהליך כולל המתנות ארוכות של שמירה
    test.setTimeout(240000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        dealerPage = new DealerPage(page, po, env, console);
        loginPage = new LoginPage(page, po, env, console);
        properProductionPage = new ProperProductionPage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('הוספת כתובת תנאי ייצור נאותים בודדת', async ({ page }) => {
        await properProductionPage.AddAddressesForProperProduction(1);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 100000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

    test('הוספת ריבוי כתובות תנאי ייצור נאותים (3 כתובות)', async ({ page }) => {
        await properProductionPage.AddAddressesForProperProduction(3);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
});