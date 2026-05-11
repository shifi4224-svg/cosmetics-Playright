const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const RegulationItemPage = require('../Pages/RegulationItem');

test.describe('בדיקות נוטיפיקציות - יצירת נוטיפיקציה מלאה ושפיות', () => {
    let po;
    let env;
    let loginPage;
    let regulationNotificationPage;
    let regulationItemPage;
    let sharedUtils;

    // נותנים לטסט 5 דקות לרוץ עקב הזנת נתונים מרובה
    test.setTimeout(1000000);

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
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        po.regulationNotification = regulationNotificationPage; // במקרה שיש תלות מעגלית

        await loginPage.LoginDev();
    });

    test('יצירת נוטיפיקציה - תהליך שפיות (Sanity)', async ({ page }) => {
        // נייצר שם ייחודי כדי שנוכל למצוא אותו בקלות בטבלה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט לאישור אוטומציה ${uniqueId}`;
        const itemNameE = `Approval Item ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט למאגר
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);

        // מריץ את יצירת הנוטיפיקציה בתהליך השפיות עם הפעלת ולידציות
        await regulationNotificationPage.CreateNotificationSanity(itemNameH, true);
    });

    test('יצירת נוטיפיקציה עם שמירת טיוטה אחרי כל שלב', async ({ page }) => {
        // נייצר שם ייחודי כדי שנוכל למצוא אותו בקלות בטבלה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `נוטיפיקציה טיוטות ${uniqueId}`;
        const itemNameE = `Draft Notification ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט למאגר
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);

        // שלב 2: תהליך מילוי מרובה שלבים עם שמירת טיוטות ביניים
        await regulationNotificationPage.CreateNotificationWithDrafts(itemNameH, true);
    });
});