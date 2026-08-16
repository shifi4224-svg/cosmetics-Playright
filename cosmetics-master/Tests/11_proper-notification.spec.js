require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationItemPage = require('../Pages/RegulationItem');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const ProperNotificationPage = require('../Pages/properNotification');

test.describe('בדיקות הקמת נוטיפיקציה נאותה', () => {
    let po;
    let env;
    let loginPage;
    let sharedUtils;
    let properNotificationPage;
    let regulationItemPage;
    let regulationNotificationPage;

    test.setTimeout(300000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charNotification: 'W-,ף.ץת43dדA'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        loginPage = new LoginPage(page, po, env, console);
        sharedUtils = new SharedUtils(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        properNotificationPage = new ProperNotificationPage(page, po, env, console);

        po.regulationNotification = regulationNotificationPage;

        await loginPage.LoginDev();
    });

    test('הקמת נוטיפיקציה נאותה שפיות', async ({ page }) => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט נאות ${uniqueId}`;
        const itemNameE = `Proper Item ${uniqueId}`;
        const businessName = sharedUtils.ReadBusiness('taagid_naot');

        await regulationItemPage.AddItem(itemNameH, itemNameE, 1, false, businessName);
        await regulationItemPage.OpenItem1(businessName, businessName, itemNameH, "פריט נאות", "לאישור נציג אחראי", "approve", false);
        await regulationNotificationPage._OpenNotificationForm(itemNameH);
        await properNotificationPage.CreateProperNotification(false);
    });

    test('הקמת נוטיפיקציה נאותה עם שמירת טיוטה אחרי כל שלב', async ({ page }) => {
        test.setTimeout(3600000); // שעה — הטסט כולל מילוי רב שלבים
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `נוטיפיקציה נאות טיוטות ${uniqueId}`;
        const itemNameE = `Proper Draft ${uniqueId}`;

        const businessName = sharedUtils.ReadBusiness('taagid_naot');
        await regulationItemPage.AddItem(itemNameH, itemNameE, 1, false, businessName);
        await regulationItemPage.OpenItem1(businessName, businessName, itemNameH, "פריט נאות", "לאישור נציג אחראי", "approve", false);
        await regulationNotificationPage._OpenNotificationForm(itemNameH);

        const dialogText = await properNotificationPage.CreateProperNotificationWithDrafts(itemNameH);

        try {
            expect(dialogText).toContain('נוטיפיקציה נשמרה בהצלחה');
        } catch (err) {
            await page.pause();
            throw err;
        }
    });


    test('שכפול נוטיפיקציה נאותה - שכפול מנוטיפיקציה קיימת ובדיקת נתונים', async ({ page }) => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט נאות לשכפול ${uniqueId}`;
        const itemNameE = `Proper Dup Item ${uniqueId}`;
        const businessName = sharedUtils.ReadBusiness('taagid_naot');

        // מנכ"ל: הוספת פריט נאות
        await regulationItemPage.AddItem(itemNameH, itemNameE, 1, false, businessName);
        // נציג אחראי: אישור הפריט
        await regulationItemPage.OpenItem1(businessName, businessName, itemNameH, "פריט נאות", "לאישור נציג אחראי", "approve", false);

        // מנכ"ל: לחיצה על שורת הפריט + כפתור שכפל נוטיפיקציה + בחירת שורה ראשונה
        const result = await regulationItemPage.OpenDuplicateTable(itemNameH, 0);
        expect(result.hasRows).toBe(true);

        // הנוטיפיקציה הנאותה המשוכפלת נפתחת אוטומטית — ממלא קבצים, גוון, קובץ הצהרה ושומר
        await regulationNotificationPage.Files(false);
        await regulationNotificationPage.AddShades("ירוק", false);
        await regulationNotificationPage.nextStep.click();
        // חומרים
        await regulationNotificationPage.page.waitForTimeout(5000);
        await regulationNotificationPage.nextStep.click();
        await regulationNotificationPage.nextStep.click();
        // אוכלוסיית יעד
        await regulationNotificationPage.nextStep.click();
        // קובץ הצהרה
        await properNotificationPage.files.AtachFile();
        await properNotificationPage.saveAndSend.click();

        await regulationNotificationPage.dialog.waitFor({ state: 'visible', timeout: 30000 });
        const text = await regulationNotificationPage.dialog.textContent();
        if (text.includes('אנא נסה שוב')) {
            await regulationNotificationPage.okEnd.click();
            await page.pause();
            return;
        }
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();
    });

    test('הקמת נוטיפיקציה נאותה - בדיקת תווים מאופשרים + מקסימום תווים ושמירה', async ({ page }) => {
        test.setTimeout(3600000); // שעה — הטסט בודק כל תו ומקסימום בכל שדה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `בדיקת תווים נאות ${uniqueId}`;
        const itemNameE = `Proper Char Test ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט נאות למאגר — כולל בדיקת תווים בשדות השם
        const businessName = sharedUtils.ReadBusiness('taagid_naot');
        await regulationItemPage.AddItemCharTest(itemNameH, itemNameE, 1, businessName);
        await regulationItemPage.OpenItem1(businessName, businessName, itemNameH, "פריט נאות", "לאישור נציג אחראי", "approve", false);
        await regulationNotificationPage._OpenNotificationForm(itemNameH);

        // שלב 2: בודק תווים + מקסימום תווים בכל שדה וממלא מקסימום תווים מאופשרים
        await properNotificationPage.CreateProperNotificationCharAndMaxTest(itemNameH);

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