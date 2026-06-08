require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const RegulationItemPage = require('../Pages/RegulationItem');

test.describe('בדיקות נוטיפיקציות - יצירת נוטיפיקציה מלאה ושפיות', () => {
    let po;
    let env;
    let loginPage;
    let regulationNotificationPage;
    let regulationItemPage;

    // נותנים לטסט 5 דקות לרוץ עקב הזנת נתונים מרובה
    test.setTimeout(1000000);

    // מכין את הסביבה לפני כל טסט
    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charNotification: 'W-,ף.ץת43dדA',
            charManufactor: '&"\'W-,ף.ץת_ 43 ()dדA',
            charBusinessId: '0123456789',
            charOtherAddress: '\/()-\'".,AWdתץדף43'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

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

        // מוודא שהופיעה הודעת הצלחה וסוגר את הדיאלוג מהטסט
        const text = await regulationNotificationPage.dialog.textContent();
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();
    });

    test('יצירת נוטיפיקציה עם שמירת טיוטה אחרי כל שלב', async ({ page }) => {
        // נייצר שם ייחודי כדי שנוכל למצוא אותו בקלות בטבלה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `נוטיפיקציה טיוטות ${uniqueId}`;
        const itemNameE = `Draft Notification ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט למאגר
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);

        // שלב 2: תהליך מילוי מרובה שלבים עם שמירת טיוטות ביניים
        const dialogText = await regulationNotificationPage.CreateNotificationWithDrafts(itemNameH);
        expect(dialogText).toContain('נוטיפיקציה נשמרה בהצלחה');
    });

    test('יצירת נוטיפיקציה - בדיקת תווים מאופשרים ושמירה', async ({ page }) => {
        test.setTimeout(3600000);
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `בדיקת תווים ${uniqueId}`;
        const itemNameE = `Char Test ${uniqueId}`;

        await regulationItemPage.AddItemCharTest(itemNameH, itemNameE, 0);
        await regulationNotificationPage.CreateNotificationCharTest(itemNameH);

        try {
            const text = await regulationNotificationPage.dialog.textContent();
            expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
            await regulationNotificationPage.okEnd.click();
        } catch (err) {
            await page.pause();
            throw err;
        }
    });

    test('יצירת נוטיפיקציה - בדיקת תווים מאופשרים + מקסימום תווים ושמירה', async ({ page }) => {
        test.setTimeout(3600000); // שעה — הטסט בודק כל תו ומקסימום בכל שדה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `בדיקת תווים ${uniqueId}`;
        const itemNameE = `Char Test ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט למאגר — כולל בדיקת תווים בשדות השם
        await regulationItemPage.AddItemCharTest(itemNameH, itemNameE, 0);

        // שלב 2: בודק תווים + מקסימום תווים בכל שדה וממלא מקסימום תווים מאופשרים
        await regulationNotificationPage.CreateNotificationCharAndMaxTest(itemNameH);

        // מוודא שהופיעה הודעת הצלחה וסוגר את הדיאלוג
        try {
            const text = await regulationNotificationPage.dialog.textContent();
            expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
            await regulationNotificationPage.okEnd.click();
        } catch (err) {
            await page.pause();
            throw err;
        }
    });
});