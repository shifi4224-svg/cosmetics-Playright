const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const UpdateProperImporterPage = require('../Pages/UpdateProperImporter');

test.describe('בדיקות עדכון יבואן נאות', () => {
    let po;
    let env;
    let loginPage;
    let updateProperImporterPage;
    let sharedUtils;

    // נותנים לטסט 3 דקות (180,000 אלפיות שנייה) לרוץ
    test.setTimeout(180000);

    // רץ לפני כל טסט ומכין את הסביבה
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
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        updateProperImporterPage = new UpdateProperImporterPage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('עדכון פרטי יבואן נאות בהצלחה', async ({ page }) => {
        await updateProperImporterPage.Update();
    });
});