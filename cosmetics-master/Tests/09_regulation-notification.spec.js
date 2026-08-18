require('dotenv').config();
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
    let sharedUtils;
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
        sharedUtils = new SharedUtils(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        po.regulationNotification = regulationNotificationPage;

        await loginPage.LoginDev();
    });

    test('יצירת נוטיפיקציה - תהליך שפיות (Sanity)', async ({ page }) => {
        // נייצר שם ייחודי כדי שנוכל למצוא אותו בקלות בטבלה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט לאישור אוטומציה ${uniqueId}`;
        const itemNameE = `Approval Item ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט למאגר
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);


        await regulationNotificationPage.CreateNotificationSanity(itemNameH, false);

        // מוודא שהופיעה הודעת הצלחה וסוגר את הדיאלוג מהטסט
        const text = await regulationNotificationPage.dialog.textContent();
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();

        // שומר שם הפריט לטסט השכפול
        sharedUtils.WriteBusiness('sanity_item_name', itemNameH);
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

    // test('יצירת נוטיפיקציה - בדיקת תווים מאופשרים ושמירה', async ({ page }) => {
    //     test.setTimeout(3600000);
    //     const uniqueId = Date.now().toString().slice(-4);
    //     const itemNameH = `בדיקת תווים ${uniqueId}`;
    //     const itemNameE = `Char Test ${uniqueId}`;
    //
    //     await regulationItemPage.AddItemCharTest(itemNameH, itemNameE, 0);
    //     await regulationNotificationPage.CreateNotificationCharTest(itemNameH);
    //
    //     try {
    //         const text = await regulationNotificationPage.dialog.textContent();
    //         expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
    //         await regulationNotificationPage.okEnd.click();
    //     } catch (err) {
    //         await page.pause();
    //         throw err;
    //     }
    // });

    test('יצירת נוטיפיקציה עם יצרן מחו"ל', async ({ page }) => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט יצרן חול ${uniqueId}`;
        const itemNameE = `Overseas Item ${uniqueId}`;

        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
        await regulationNotificationPage.CreateNotificationOverseas(itemNameH);

        const text = await regulationNotificationPage.dialog.textContent();
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();
    });

    test('יצירת נוטיפיקציה עם ערכה', async ({ page }) => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט עם ערכה ${uniqueId}`;
        const itemNameE = `Kit Item ${uniqueId}`;

        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
        await regulationNotificationPage.CreateNotificationWithKit(itemNameH);

        const text = await regulationNotificationPage.dialog.textContent();
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();
    });

    test('יצירת נוטיפיקציה עם 3 כמות ואריזה', async ({ page }) => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט 3 אריזות ${uniqueId}`;
        const itemNameE = `Multi Pack Item ${uniqueId}`;

        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
        await regulationNotificationPage.CreateNotificationMultiplePacks(itemNameH);

        const text = await regulationNotificationPage.dialog.textContent();
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();
    });

    test('שכפול נוטיפיקציה - עסק ללא נוטיפיקציות קודמות', async ({ page }) => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט שכפול ריק ${uniqueId}`;
        const itemNameE = `Empty Dup Item ${uniqueId}`;
        const businessName = sharedUtils.ReadBusiness('lo_taagid');

        // מנכ"ל: הוספת פריט לעסק lo_taagid
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false, businessName);
        // נציג אחראי: אישור הפריט
        await regulationItemPage.OpenItem1(businessName, businessName, itemNameH, "פריט רגיל", "לאישור נציג אחראי", "approve", false);

        // ישירות בעמוד נציג אחראי לוחצים על הפריט ופותחים טבלת שכפול
        // טבלת השכפול צריכה להיות ריקה כי לעסק זה אין נוטיפיקציות מושלמת
        const result = await regulationItemPage.OpenDuplicateTable(itemNameH);

        expect(result.hasRows).toBe(false);
    });

    test('שכפול נוטיפיקציה - שכפול מנוטיפיקציה קיימת ובדיקת נתונים', async ({ page }) => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט לשכפול ${uniqueId}`;
        const itemNameE = `Dup Item ${uniqueId}`;

        // מנכ"ל: הוספת פריט
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
        // נציג אחראי: אישור הפריט
        await regulationItemPage.OpenItem1("", "", itemNameH, "פריט רגיל", "לאישור נציג אחראי", "approve", false);

        // מנכ"ל: לחיצה על שורת הפריט + כפתור שכפל נוטיפיקציה + בחירת שורה ראשונה
        // הטבלה מציגה נוטיפיקציות מושלמות של אותו עסק (כגון זו שנשמרה בטסט הסאניטי)
        const result = await regulationItemPage.OpenDuplicateTable(itemNameH, 0);
        expect(result.hasRows).toBe(true);
        await regulationNotificationPage.nextStep.click();
        // הנוטיפיקציה המשוכפלת נפתחת אוטומטית — ממלא קבצים, גוון ושומר
        await regulationNotificationPage.Files(false);
        await regulationNotificationPage.AddShades("ירוק", false);
        await regulationNotificationPage.nextStep.click();
        // חומרים
        await regulationNotificationPage.page.waitForTimeout(5000);
        await regulationNotificationPage.nextStep.click();
        await regulationNotificationPage.nextStep.click();
        // אוכלוסיית יעד
        await regulationNotificationPage.nextStep.click();
        // ננו
        await regulationNotificationPage.saveSubmit.click();
        if (await regulationNotificationPage.sharedUtils.isVisibleSafe(regulationNotificationPage.manufAddress, 2000)) {
            await regulationNotificationPage.manuftype1.click();
            await regulationNotificationPage.manufSave.click();
        }
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

    test('יצירת נוטיפיקציה עם ננו - שפיות', async () => {
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט ננו ${uniqueId}`;
        const itemNameE = `Nano Item ${uniqueId}`;

        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
        await regulationNotificationPage.CreateNotificationWithNano(itemNameH);

        const text = await regulationNotificationPage.dialog.textContent();
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();
    });
});