const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות שהמרנו מתיקיית Pages
const LoginPage = require('../Pages/LoginPage');
const DealerPage = require('../Pages/Dealer');
const AddressPage = require('../Pages/Address');
const FilesPage = require('../Pages/Files');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationTaagidRPPage = require('../Pages/RegulationTaagidRP.js');

test.describe('רישום עוסק בתמרוק', () => {
    let po;
    let env;
    let dealerPage; // הגדרת משתנה ייעודי לדף כדי לא להשתמש ב-po

    // נותנים לטסט 3 דקות (180,000 אלפיות שנייה) לרוץ כדי שכל בדיקות התווים יספיקו להסתיים
    test.setTimeout(600000);

    // הפונקציה הזו רצה לפני כל טסט ומכינה את הסביבה והאובייקטים
    test.beforeEach(async ({ page }) => {
        // 1. הגדרת משתני הסביבה (env) - אפשר בעתיד לייבא מקובץ חיצוני
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            telefon: '0501234567',
            email: 'test@test.com',
            houseNumber: '5',
            charEmail: '',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '34',
            charAddressNotes: '',
            charOtherAddress: '',
        };

        // 2. בניית אובייקט ה-PO המרכזי כדי שהמחלקות יוכלו לתקשר אחת עם השנייה
        po = {};
        po.dataFolder = path.join(__dirname, '../Data'); // ניתוב לתיקיית ה-Data האמיתית בפרויקט

        // הגדרת פונקציות עזר גלובליות (Utils) שהיו בשימוש באוקסיג'ן
        po.utils = {
            pressF12: async () => await page.keyboard.press('F12'),
            pressTAB: async () => await page.keyboard.press('Tab'),
        };

        // יצירת מופע של מחלקת העזר המרכזית ושיוך הפונקציות לאובייקט po
        const sharedUtils = new SharedUtils(page, po, env, console);

        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);

        // 3. אתחול כל המחלקות והכנסתן לתוך אובייקט ה-po
        po.loginPage = new LoginPage(page, po, env, console);
        po.address = new AddressPage(page, po, env, console);
        po.files = new FilesPage(page, po, env, console);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage; // נשמר ב-po למקרה שמחלקות אחרות מסתמכות עליו
       

        // הגדרת מוק זמני עבור pagesDealer כדי למנוע את קריסת הטסט
        po.pagesDealer = {
            Page1: async (locator) => { console.log('Mock Page1 executed'); },
            Page2: async () => { console.log('Mock Page2 executed'); },
            Page3: async () => { console.log('Mock Page3 executed'); }
        };
        await po.loginPage.LoginDev();
    });


    test('רישום עוסק בתמרוק תאגיד', async ({ page }) => {
        await dealerPage.RegulationDealerBusiness(true, 1);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('רישום עוסק בתמרוק לא תאגיד', async ({ page }) => {
        await dealerPage.RegulationDealerBusiness(true, 0);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
      test('רישום עוסק בתמרוק לא תאגיד מהיר ללא בדיקות', async ({ page }) => {
        await dealerPage.RegulationDealerBusiness(false, 0);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('רישום עוסק בתמרוק תאגיד ע"י לא מנכל, המנכל לא תושב ישראל ולא נושא משרה', async ({ page }) => {
        await dealerPage.NoMancal();
        await expect(dealerPage.errorNoMancal).toBeVisible();
        const errorText = await dealerPage.errorNoMancal.textContent();
        expect(errorText).toContain('אינך מורשה להמשיך בתהליך');
    });
    test('רישום עוסק בתמרוק תאגיד ע"י לא מנכל והמנכל תושב ישראל', async ({ page }) => {
        await dealerPage.NoMancalIsraeliResident();
        await expect(dealerPage.errorNoMancal).toBeVisible();
        const errorText = await dealerPage.errorNoMancal.textContent();
        expect(errorText).toContain('אינך מורשה להמשיך בתהליך');
    });
    test('רישום עוסק בתמרוק מספר זיהוי לא תקין', async ({ page }) => {
        await dealerPage.RegulationDealerBusiness(false, 0, "", "5544");
        await expect(dealerPage.errorIncompatibleId).toBeVisible();
        const errorText = await dealerPage.errorIncompatibleId.textContent();
        expect(errorText).toContain('מספר זהות לא תקין');
    });
    test('רישום עוסק בתמרוק תאגיד עם מספר זיהוי שכבר קיים במאגר', async ({ page }) => {
        // נייצר מספר זיהוי רנדומלי תקין
        const randomId = await po.GetRandomValidID();
        
        // שלב 1: רישום ראשון כדי שהמספר ייווצר ויישמר במערכת (ללא ולידציות של תווים כדי לרוץ מהר)
        await dealerPage.RegulationDealerBusiness(false, 1, "תאגיד מקורי", randomId);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 15000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();

        // שלב 2: ניסיון רישום שני עם אותו מספר זיהוי בדיוק
        await dealerPage.DealerAlreadyRegistered("תאגיד כפול", randomId);
        await expect(dealerPage.errorAlreadyRegistered).toBeVisible();
        const errorText = await dealerPage.errorAlreadyRegistered.textContent();
        expect(errorText).toContain('העסק כבר קיים במערכת');
    });
    test('הקמת עוסק בתמרוק תאגיד ומינוי עובד ממונה ברישום', async ({ page }) => {
        await dealerPage.AuthorizedEmployeeDealer();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('טרם הושלמה');
        await dealerPage.okEnd.click();
    });
    test('הקמת עוסק בתמרוק תאגיד ע"י נושא משרה בתאגיד', async ({ page }) => {
        await dealerPage.OfficerDealer();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('תהליך רישום יצרן', async ({ page }) => {
        await dealerPage.ManufacturerDealer(1);
        await expect(dealerPage.errorManu1).toBeVisible();
        const errorText1 = await dealerPage.errorManu1.textContent();
        expect(errorText1).toContain('עבור ייצור תמרוקים נדרש רישיון עסק לעוסק');
        await dealerPage.okEnd.click();
        await dealerPage.ManufacturerDealer(2);
        await expect(dealerPage.errorManu2).toBeVisible();
        const errorText2 = await dealerPage.errorManu2.textContent();
        expect(errorText2).toContain('עליך לעדכן כתובת מסוג אתר יצור');
        await dealerPage.okEnd.click();
        await dealerPage.ManufacturerDealer(3);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('רישום עוסק בתמרוק - בדיקת תווים מאופשרים ושמירה', async ({ page }) => {
        test.setTimeout(3600000); // שעה — הטסט בודק כל תו בכל שדה
        await dealerPage.RegulationDealerBusinessCharTest(0, "בדיקת תווים");

        try {
            await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
            const text = await dealerPage.dialog.textContent();
            expect(text).toContain('בהצלחה');
            await dealerPage.okEnd.click();
        } catch (err) {
            await page.pause();
            throw err;
        }
    });

});