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
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            charBusinessName: 'אבגדהוזחטיכלמנסעפצקרשת',
            charBusinessId: '0123456789',
            telefon: '0504444444',
            email: 'test@moh.gov.il',
            houseNumber: '89',
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
});
test.describe('רישום נציג אחראי (3 סוגים)', () => {
    let po;
    let env;
    let regulationRPPage;
    let dealerPage;

    // רץ לפני כל טסט בסוויטה ומכין את הסביבה
    test.beforeEach(async ({ page }) => {
        env = {
            url: 'https://cnpdev.health.gov.il',
            user: '322638727',
            password: '2000',
            charBusinessName: 'אבגדהוזחטיכלמנסעפצקרשת',
            charBusinessId: '0123456789',
            telefon: '0504444444',
            email: 'test@moh.gov.il',
            houseNumber: '89',
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
        // מריץ את מתודת הרישום לנציג אחראי בודד
        await regulationRPPage.RegulationToRP(" - בודד");
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
});