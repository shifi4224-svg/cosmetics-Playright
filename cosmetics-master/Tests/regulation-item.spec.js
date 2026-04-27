const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationItemPage = require('../Pages/RegulationItem');

test.describe('בדיקות פריטים - הוספת פריט (RegulationItem)', () => {
    let po;
    let env;
    let loginPage;
    let regulationItemPage;
    let sharedUtils;

    // נותנים לטסט 3 דקות לרוץ עקב תהליך ההוספה שיכול לקחת זמן
    test.setTimeout(180000);

    // מכין את הסביבה לפני כל טסט
    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            name: 'שפרה הקר'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('הוספת פריט רגיל (מסלול בסיסי) עם ולידציות מלאות', async ({ page }) => {
        // פרמטרים: שם בעברית, שם באנגלית, מסלול (0 = בסיסי), ולידציות (true)
        await regulationItemPage.AddItem("פריט רגיל אוטומציה", "Regular Item Automation", 0, true);
    });

    test('הוספת פריט נאות (מסלול אירופאי) ללא ולידציות מיותרות', async ({ page }) => {
        // פרמטרים: שם בעברית, שם באנגלית, מסלול (1 = אירופאי), ולידציות (false)
        await regulationItemPage.AddItem("פריט נאות אוטומציה", "European Item Automation", 1, false);
    });
});