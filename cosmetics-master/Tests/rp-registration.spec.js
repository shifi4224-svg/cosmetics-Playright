require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const RegulationRPPage = require('../Pages/RegulationRP');
const AddressPage = require('../Pages/Address');
const FilesPage = require('../Pages/Files');
const DealerPage = require('../Pages/Dealer');
const RegulationTaagidRPPage = require('../Pages/RegulationTaagidRP');
test.setTimeout(1200000);

test.describe('רישום תאגיד נציג אחראי', () => {
    let po;
    let env;
    let regulationTaagidRP;
    let dealerPage;

    // רץ לפני כל טסט בסוויטה ומכין את הסביבה
    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charBusinessName: 'אבגדהוזחטיכלמנסעפצקרשת',
            charBusinessId: '0123456789',
            telefon: process.env.TELEFON || '0504444444',
            email: process.env.EMAIL || 'test@moh.gov.il',
            houseNumber: process.env.HOUSE_NUMBER || '89',
            charEmail: '%_-.+W43dA',
            charAddressNotes: '()"W-,ף.ץת43dדA',
            charOtherAddress: '\/()-\'".,AWdתץדף43'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.utils = {
            pressF12: async () => await page.keyboard.press('F12'),
            pressTAB: async () => await page.keyboard.press('Tab'),
        };

        // מוקים לפונקציות קריאת קבצים ובדיקות שקיימות ב-Oxygen במקור
        po.ReadFile = async (path) => 'שם עסק או תאגיד דמה';
        po.ReadFileUpdate = async (path) => ['123456789', 'שם עסק', ' טסט'];
        po.CheckCharacters = async () => { };
        po.CheckMaxLength = async () => { };
        po.CheckCharactersEmail = async () => { };
        po.CheckMaxEmail = async () => { };
        po.TestIsraeliPhoneNumberValidation = async () => { };

        // אתחול אובייקטי דפים (Pages)
        po.loginPage = new LoginPage(page, po, env, console);
        po.address = new AddressPage(page, po, env, console);
        po.files = new FilesPage(page, po, env, console);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage;
        po.regulationRP = new RegulationRPPage(page, po, env, console);
        regulationTaagidRP = new RegulationTaagidRPPage(page, po, env, console);

        // התחברות לסביבת פיתוח
        await po.loginPage.LoginDev();
    });
    test('הקמת תאגיד נציג אחראי ע"י מנכל', async ({ page }) => {
        await regulationTaagidRP.LoginToDeaker();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('הקמת תאגיד נציג אחראי ע"י לא מנכל', async ({ page }) => {
        // מריץ את מתודת הרישום עבור נציג המקושר לתאגיד
        await regulationTaagidRP.LoginToDeakerNoMancal();
        await expect(dealerPage.errorNoMancal).toBeVisible();
        const errorText = await dealerPage.errorNoMancal.textContent();
        expect(errorText).toContain('אינך מורשה להמשיך בתהליך');
    });
    test('הקמת תאגיד נציג אחראי עם תוים מיוחדים', async ({ page }) => {
        await regulationTaagidRP.LoginToDeaker(false, this.charBusinessName);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

    test('הקמת תאגיד נציג אחראי - בדיקת תווים מאופשרים ושמירה', async ({ page }) => {
        test.setTimeout(3600000);
        await regulationTaagidRP.LoginToDeakerCharTest("בדיקת תווים");

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
test.describe('רישום נציג אחראי (3 סוגים)', () => {
    let po;
    let env;
    let regulationRPPage;
    let dealerPage;

    // רץ לפני כל טסט בסוויטה ומכין את הסביבה
    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charBusinessName: 'אבגדהוזחטיכלמנסעפצקרשת',
            charBusinessId: '0123456789',
            telefon: process.env.TELEFON || '0504444444',
            email: process.env.EMAIL || 'test@moh.gov.il',
            houseNumber: process.env.HOUSE_NUMBER || '89',
            charEmail: '%_-.+W43dA',
            charAddressNotes: '()"W-,ף.ץת43dדA',
            charOtherAddress: '\/()-\'".,AWdתץדף43'
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.utils = {
            pressF12: async () => await page.keyboard.press('F12'),
            pressTAB: async () => await page.keyboard.press('Tab'),
        };

        // מוקים לפונקציות קריאת קבצים ובדיקות שקיימות ב-Oxygen במקור
        po.ReadFile = async (path) => 'שם עסק או תאגיד דמה';
        po.ReadFileUpdate = async (path) => ['123456789', 'שם עסק', ' טסט'];
        po.CheckCharacters = async () => { };
        po.CheckMaxLength = async () => { };
        po.CheckCharactersEmail = async () => { };
        po.CheckMaxEmail = async () => { };
        po.TestIsraeliPhoneNumberValidation = async () => { };

        // אתחול אובייקטי דפים (Pages)
        po.loginPage = new LoginPage(page, po, env, console);
        po.address = new AddressPage(page, po, env, console);
        po.regulationRP = regulationRPPage;
        po.files = new FilesPage(page, po, env, console);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage;
        regulationRPPage = new RegulationRPPage(page, po, env, console);

        // התחברות לסביבת פיתוח
        await po.loginPage.LoginDev();
    });
    test('רישום נציג אחראי מקושר לתאגיד', async ({ page }) => {
        // מריץ את מתודת הרישום עבור נציג המקושר לתאגיד
        await regulationRPPage.RegulationToCorpuration();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('רישום נציג אחראי מקושר ליצרן או יבואן', async ({ page }) => {
        // מריץ את מתודת הרישום עבור יצרן/יבואן (flug=true כדי להריץ ולידציות)
        await regulationRPPage.RegulationToBusiness(true);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('רישום נציג אחראי בודד', async ({ page }) => {
        // מריץ את מתודת הרישום לנציג אחראי בודד
        await regulationRPPage.RegulationToRP();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
    test('רישום נציג אחראי בודד עם תוים מיוחדים', async ({ page }) => {
        await regulationRPPage.RegulationToRP(" - בודד");
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

    test('רישום נציג אחראי בודד - בדיקת תווים מאופשרים ושמירה', async ({ page }) => {
        test.setTimeout(3600000);
        await regulationRPPage.RegulationToRPCharTest("בדיקת תווים");

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
    test('בדיקת מקטע פרטי התקשרות', async ({ page }) => {
        // מריץ את מתודת הבדיקה
        await regulationRPPage.PublicCheck(RegulationRPPage.yesCorporation);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

});