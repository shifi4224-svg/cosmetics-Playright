require('dotenv').config();
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
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            name: process.env.USER_NAME || 'שפרה הקר'
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

    test('הוספת פריט רגיל (מסלול בסיסי)', async ({ page }) => {
        if (!sharedUtils.ReadBusiness('taagid_rp')) {
            test.skip(true, 'עסק taagid אין לו נציג אחראי מקושר — הרץ תחילה 03_rp-registration');
        }
        await regulationItemPage.AddItem("פריט רגיל אוטומציה", "Regular Item Automation", 0, false);
    });

    test('הוספת פריט נאות (מסלול אירופאי) ללא ולידציות מיותרות', async ({ page }) => {
        if (!sharedUtils.ReadBusiness('taagid_naot_rp')) {
            test.skip(true, 'עסק taagid_naot אין לו נציג אחראי מקושר — הרץ תחילה 03_rp-registration');
        }
        const businessName = sharedUtils.ReadBusiness('taagid_naot');
        await sharedUtils.OpenPageMancal(businessName);
        await regulationItemPage.addNew.click();
        await regulationItemPage.europeanRoute.first().waitFor({ state: 'attached', timeout: 5000 });
        await regulationItemPage.europeanRoute.first().click({ force: true });
        await regulationItemPage.okEnd.click();
        await regulationItemPage.hebrewCosmetics.waitFor({ state: 'visible', timeout: 5000 });
        await regulationItemPage.hebrewCosmetics.fill("פריט נאות אוטומציה");
        await regulationItemPage.englishCosmetics.fill("European Item Automation");
        await regulationItemPage.business.click();
        await regulationItemPage.business.fill(businessName);
        await regulationItemPage.option.click();
        await regulationItemPage.rPCosmetics.click();
        await regulationItemPage.rPCosmetics.fill(env.name || "שפרה הקר");
        await regulationItemPage.option.click();
        await regulationItemPage.save.click();
        await regulationItemPage.dialog.waitFor({ state: 'visible', timeout: 10000 });
        await regulationItemPage.okEnd.click();
        await page.reload();
        await sharedUtils.OpenPageMancal(businessName);
        await regulationItemPage.addNew.waitFor({ state: 'visible', timeout: 10000 });
    });

    test('הוספת פריט ע"י מנכל ואישור ע"י נציג אחראי', async ({ page }) => {
        if (!sharedUtils.ReadBusiness('taagid_rp')) {
            test.skip(true, 'עסק taagid אין לו נציג אחראי מקושר — הרץ תחילה 03_rp-registration');
        }
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט לאישור אוטומציה ${uniqueId}`;
        const itemNameE = `Approval Item ${uniqueId}`;

        
        // שלב 1: מנכ"ל מוסיף פריט
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);

        // שלב 2: מעבר לנציג אחראי ואישור הפריט (openAfter=false — לא פותח נוטיפיקציה)
        await regulationItemPage.OpenItem1("", "", itemNameH, "פריט רגיל", "לאישור נציג אחראי", "approve", false);

        // שלב 3: חזרה למנכ"ל ובדיקת סטטוס
        const status = await regulationItemPage.GetItemStatus(itemNameH, "", true);
        expect(status).toContain("התקבל ע'י נציג אחראי");
    });

    test('הוספת פריט ע"י מנכל ודחייה ע"י נציג אחראי', async ({ page }) => {
        if (!sharedUtils.ReadBusiness('taagid_rp')) {
            test.skip(true, 'עסק taagid אין לו נציג אחראי מקושר — הרץ תחילה 03_rp-registration');
        }
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

    test('הוספת פריט רגיל - בדיקת תווים מאופשרים + מקסימום תווים ושמירה', async ({ page }) => {
        if (!sharedUtils.ReadBusiness('taagid_rp')) {
            test.skip(true, 'עסק taagid אין לו נציג אחראי מקושר — הרץ תחילה 03_rp-registration');
        }
        test.setTimeout(3600000);
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `בדיקת תווים פריט ${uniqueId}`;
        const itemNameE = `Char Max Item ${uniqueId}`;

        await regulationItemPage.AddItemCharTest(itemNameH, itemNameE, 0);
    });

    test('הוספת פריט נאות - בדיקת תווים מאופשרים + מקסימום תווים ושמירה', async ({ page }) => {
        if (!sharedUtils.ReadBusiness('taagid_naot_rp')) {
            test.skip(true, 'עסק taagid_naot אין לו נציג אחראי מקושר — הרץ תחילה 03_rp-registration');
        }
        test.setTimeout(3600000);
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `בדיקת תווים פריט נאות ${uniqueId}`;
        const itemNameE = `Char Max Proper Item ${uniqueId}`;
        const businessName = sharedUtils.ReadBusiness('taagid_naot');

        await regulationItemPage.AddItemCharTest(itemNameH, itemNameE, 1, businessName);
    });

    test('עסק ללא יבואן נאות - אפשרות מסלול אירופי לא מוצגת', async ({ page }) => {
        const businessName = sharedUtils.ReadBusiness('lo_taagid');
        await sharedUtils.OpenPageMancal(businessName);
        await regulationItemPage.addNew.click();
        await expect(regulationItemPage.europeanRoute.first()).not.toBeVisible({ timeout: 5000 });
        await regulationItemPage.back.click();
    });

    test('עסק עם יבואן נאות - אפשרות מסלול אירופי מוצגת', async ({ page }) => {
        const businessName = sharedUtils.ReadBusiness('taagid_naot');
        await sharedUtils.OpenPageMancal(businessName);
        await regulationItemPage.addNew.click();
        await expect(regulationItemPage.europeanRoute.first()).toBeVisible({ timeout: 5000 });
        await regulationItemPage.back.click();
    });
});