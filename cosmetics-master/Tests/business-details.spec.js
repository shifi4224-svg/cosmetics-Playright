const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const ChageActivityBussinesPage = require('../Pages/ChageActivityBussines');

test.describe('בדיקות פרטי עסק - שינוי פעילות', () => {
    let po;
    let env;
    let loginPage;
    let chageActivityBussinesPage;
    let sharedUtils;

    // נותנים לטסט 3 דקות (180,000 אלפיות שנייה) לרוץ
    test.setTimeout(180000);

    // רץ לפני כל טסט בסוויטה ומכין את הסביבה
    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        
        // מוקים או פונקציות עזר למקרה שמחלקות אחרות צריכות אותם
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        // אתחול אובייקטי דפים (Pages)
        loginPage = new LoginPage(page, po, env, console);
        chageActivityBussinesPage = new ChageActivityBussinesPage(page, po, env, console);

        // התחברות לסביבת פיתוח
        await loginPage.LoginDev();
    });

    test('שינוי פעילות עסק ליבואן ומפיץ', async ({ page }) => {
        await chageActivityBussinesPage.ChangeActivity(["יבואן", "מפיץ"]);
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();

    });

    test('בדיקת שמירה ללא שינוי בפעילות העסק', async ({ page }) => {
        await chageActivityBussinesPage.NoChange();
    });
});