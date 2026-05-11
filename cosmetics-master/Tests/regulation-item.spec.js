const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationItemPage = require('../Pages/RegulationItem');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const DealerPage = require('../Pages/Dealer');

test.describe('בדיקות פריטים - הוספת פריט (RegulationItem)', () => {
    let po;
    let env;
    let loginPage;
    let regulationItemPage;
    let regulationNotificationPage;
    let sharedUtils;
    let dealerPage;

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
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        po.regulationNotification = regulationNotificationPage; // נשמר ב-po כדי ש-OpenItem1 תוכל להשתמש בו
        dealerPage = new DealerPage(page, po, env, console);

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

    test('הוספת פריט ע"י מנכל ואישור ע"י נציג אחראי', async ({ page }) => {
        // נייצר שם ייחודי כדי שנוכל למצוא אותו בקלות בטבלה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט לאישור אוטומציה ${uniqueId}`;
        const itemNameE = `Approval Item ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט למאגר
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);

        // שלב 2: מעבר לנציג אחראי, חיפוש הפריט לפי שם וסטטוס ואישורו
        await regulationItemPage.OpenItem1("", "", itemNameH, "פריט רגיל", "לאישור נציג אחראי");
        // דיאלוג ראשון - סוגרים
        // await page.pause(); // השהייה כדי לראות את הדיאלוג לפני הסגירה
        await regulationItemPage.extOkEndNarrow.click();
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('הפריט אושר בהצלחה');
        //await regulationItemPage.extOkEndNarrow.click();
        console.log(4)
        // שלב 3: חזרה למנכ"ל ובדיקת סטטוס הפריט בטבלה
        const status = await regulationItemPage.GetItemStatus(itemNameH, "", true);
        expect(status).toContain("התקבל ע'י נציג אחראי");

    });

    test('הוספת פריט ע"י מנכל ודחייה ע"י נציג אחראי', async ({ page }) => {
        // נייצר שם ייחודי כדי שנוכל למצוא אותו בקלות בטבלה
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט לאישור אוטומציה ${uniqueId}`;
        const itemNameE = `Approval Item ${uniqueId}`;

        // שלב 1: מנכ"ל מוסיף פריט למאגר
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);

        // שלב 2: מעבר לנציג אחראי, חיפוש הפריט לפי שם וסטטוס ודחייתו
        await regulationItemPage.OpenItem1("", "", itemNameH, "פריט רגיל", "לאישור נציג אחראי", "reject");
        // דיאלוג ראשון - סוגרים
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('הפריט נדחה בהצלחה');
        await regulationItemPage.extOkEndNarrow.click();
        console.log(4)
        // שלב 3: חזרה למנכ"ל ובדיקת סטטוס הפריט בטבלה
        const status = await regulationItemPage.GetItemStatus(itemNameH, "", true);
        expect(status).toContain("נדחה ע'י נציג אחראי");
    });
});