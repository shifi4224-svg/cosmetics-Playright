const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const ProperNotificationPage = require('../Pages/properNotification');

test.describe('בדיקות הקמת נוטיפיקציה נאותה', () => {
    let po;
    let env;
    let loginPage;
    let properNotificationPage;
    let sharedUtils;

    test.setTimeout(300000); // 5 דקות זמן הרצה בגלל הוולידציות והקבצים

    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            charNotification: 'W-,ף.ץת43dדA'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        
        // מוק זמני לדף שעוד לא הומר לגמרי
        po.regulationNotification = require('../oxygen.po').regulationNotification;

        loginPage = new LoginPage(page, po, env, console);
        properNotificationPage = new ProperNotificationPage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('הקמת נוטיפיקציה נאותה עם ולידציות מלאות', async ({ page }) => {
        await properNotificationPage.CreateProperNotification(true);
    });
});