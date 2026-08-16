require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות
const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationRPPage = require('../Pages/RegulationRP');
const AddressPage = require('../Pages/Address');
const FilesPage = require('../Pages/Files');
const DealerPage = require('../Pages/Dealer');
const RegulationTaagidRPPage = require('../Pages/RegulationTaagidRP');
test.setTimeout(1200000);

// ─────────────────────────────────────────────
// עזר: אתחול סביבה משותפת לכל הסוויטות
// ─────────────────────────────────────────────
function buildEnv() {
    return {
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
}

function buildPo(page, env) {
    const po = {};
    po.dataFolder = path.join(__dirname, '../Data');
    po.utils = {
        pressF12: async () => await page.keyboard.press('F12'),
        pressTAB: async () => await page.keyboard.press('Tab'),
    };
    po.ReadFile = async () => 'שם עסק או תאגיד דמה';
    po.ReadFileUpdate = async () => ['123456789', 'שם עסק', ' טסט'];
    po.CheckCharacters = async () => { };
    po.CheckMaxLength = async () => { };
    po.CheckCharactersEmail = async () => { };
    po.CheckMaxEmail = async () => { };
    po.TestIsraeliPhoneNumberValidation = async () => { };
    po.loginPage = new LoginPage(page, po, env, console);
    po.address = new AddressPage(page, po, env, console);
    po.files = new FilesPage(page, po, env, console);
    return po;
}

// ─────────────────────────────────────────────
// 1. תאגיד נציג אחראי
// ─────────────────────────────────────────────
test.describe('רישום תאגיד נציג אחראי', () => {
    let po;
    let env;
    let regulationTaagidRP;
    let dealerPage;

    test.beforeEach(async ({ page }) => {
        env = buildEnv();
        po = buildPo(page, env);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage;
        po.regulationRP = new RegulationRPPage(page, po, env, console);
        regulationTaagidRP = new RegulationTaagidRPPage(page, po, env, console);
        await po.loginPage.LoginDev();
    });

    test('הקמת תאגיד נציג אחראי ע"י מנכל', async ({ page }) => {
        await regulationTaagidRP.LoginToDeaker(false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
        const su = new SharedUtils(page, po, buildEnv(), console);
        su.WriteBusiness('rp_taagid_rp', true);
    });

    test('הקמת תאגיד נציג אחראי ע"י לא מנכל', async ({ page }) => {
        await regulationTaagidRP.LoginToDeakerNoMancal();
        await expect(dealerPage.errorNoMancal).toBeVisible();
        const errorText = await dealerPage.errorNoMancal.textContent();
        expect(errorText).toContain('אינך מורשה להמשיך בתהליך');
    });

    /* test('הקמת תאגיד נציג אחראי עם תוים מיוחדים', async ({ page }) => {
        await regulationTaagidRP.LoginToDeaker(false, this.charBusinessName);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    }); */

    test('רישום תאגיד נציג אחראי פעמיים עם אותו מספר מזהה - הרישום השני מוחזר שגיאה', async () => {
        // רישום ראשון — אמור לעבור
        await regulationTaagidRP.LoginToDeaker(false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text1 = await dealerPage.dialog.textContent();
        expect(text1).toContain('בהצלחה');
        await dealerPage.okEnd.click();

        // רישום שני עם אותו מספר מזהה — אמור להיכשל
        let gotError = false;
        try {
            await regulationTaagidRP.LoginToDeaker(false);
        } catch (err) {
            gotError = true;
            console.log('שגיאה שהתקבלה בניסיון שני:', err.message);
            await dealerPage.okEnd.click().catch(() => {});
        }
        expect(gotError).toBe(true);
    });

    test('הקמת תאגיד נציג אחראי - בדיקת תווים מאופשרים + מקסימום תווים ושמירה', async ({ page }) => {
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

// ─────────────────────────────────────────────
// 2. נציג אחראי בודד
// ─────────────────────────────────────────────
test.describe('נציג אחראי בודד', () => {
    let po;
    let env;
    let regulationRPPage;
    let dealerPage;

    test.beforeEach(async ({ page }) => {
        env = buildEnv();
        po = buildPo(page, env);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage;
        regulationRPPage = new RegulationRPPage(page, po, env, console);
        po.regulationRP = regulationRPPage;
        await po.loginPage.LoginDev();
    });

    test('רישום נציג אחראי בודד', async ({ page }) => {
        await regulationRPPage.RegulationToRP('', false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
        const su = new SharedUtils(page, po, buildEnv(), console);
        su.WriteBusiness('taagid_rp', true);
    });

    test('רישום נציג אחראי בודד - בדיקת מקסימום תווים ושמירה', async ({ page }) => {
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

    test('בדיקת קבצים - סוגי קבצים מותרים ואסורים (pdf/png/jpg/gif/docx/zip)', async () => {
        test.setTimeout(3600000);
        const bugs = await regulationRPPage.FileTypeValidationTest();
        expect(bugs).toBe(0);
    });

    test('בדיקת קבצים - שם קובץ: תווים מיוחדים ואורך מקסימלי (100 תווים)', async () => {
        test.setTimeout(3600000);
        const bugs = await regulationRPPage.FileNameValidationTest();
        expect(bugs).toBe(0);
    });

    test('בדיקת קבצים - גודל קובץ: קובץ מעל 10MB נדחה, קובץ 9.5MB מתקבל', async () => {
        test.setTimeout(3600000);
        const bugs = await regulationRPPage.FileSizeValidationTest();
        expect(bugs).toBe(0);
    });

    test('בדיקת קבצים - כמות קבצים: צירוף 2 קבצים מציג שגיאה "הינך מורשה לעלות עד 1 קבצים"', async () => {
        const bugs = await regulationRPPage.FileCountValidationTest();
        expect(bugs).toBe(0);
    });

    /* test('רישום נציג אחראי בודד עם תוים מיוחדים', async ({ page }) => {
        await regulationRPPage.RegulationToRP(" - בודד");
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    }); */

    test('פרטי פרסום - ולידציה: שליחה ללא שום שדה פרסום מציגה הודעת שגיאה', async () => {
        const hasError = await regulationRPPage.PublicCheckValidation();
        expect(hasError).toBe(true);
    });

    test('פרטי פרסום - טלפון לפרסום בלבד מאפשר שליחה', async () => {
        await regulationRPPage.PublicCheckPhoneOnly();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

    test('פרטי פרסום - מייל לפרסום בלבד מאפשר שליחה', async () => {
        await regulationRPPage.PublicCheckEmailOnly();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

    test('פרטי פרסום - כתובת לפרסום בלבד מאפשרת שליחה', async () => {
        await regulationRPPage.PublicCheckAddressOnly();
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });
});

// ─────────────────────────────────────────────
// 3. נציג אחראי מקושר ליצרן או יבואן
// ─────────────────────────────────────────────
test.describe('נציג אחראי מקושר ליצרן או יבואן', () => {
    let po;
    let env;
    let regulationRPPage;
    let dealerPage;

    test.beforeEach(async ({ page }) => {
        env = buildEnv();
        po = buildPo(page, env);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage;
        regulationRPPage = new RegulationRPPage(page, po, env, console);
        po.regulationRP = regulationRPPage;
        await po.loginPage.LoginDev();
    });

    test('רישום נציג אחראי מקושר ליצרן או יבואן', async ({ page }) => {
        await regulationRPPage.RegulationToBusiness('', false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

    test('ניסיון שני לקשר נציג אחראי לאותו יצרן/יבואן - מתקבלת שגיאה שהוא כבר משויך', async () => {
        await regulationRPPage.RegulationToBusiness('', false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('איש הקשר כבר משוייך לתאגיד');
        await dealerPage.okEnd.click();
    });

    test('קישור נציג אחראי לעסק לא תאגיד', async ({ page }) => {
        const sharedUtils = new SharedUtils(page, po, env, console);
        const businessName = sharedUtils.ReadBusiness('lo_taagid');
        await regulationRPPage.RegulationToBusiness(businessName, false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
        sharedUtils.WriteBusiness('lo_taagid_rp', true);
    });
});

// ─────────────────────────────────────────────
// 4. נציג אחראי מקושר לתאגיד
// ─────────────────────────────────────────────
test.describe('נציג אחראי מקושר לתאגיד', () => {
    let po;
    let env;
    let regulationRPPage;
    let dealerPage;

    test.beforeEach(async ({ page }) => {
        env = buildEnv();
        po = buildPo(page, env);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage;
        regulationRPPage = new RegulationRPPage(page, po, env, console);
        po.regulationRP = regulationRPPage;
        await po.loginPage.LoginDev();
    });

    test('רישום נציג אחראי מקושר לתאגיד', async ({ page }) => {
        await regulationRPPage.RegulationToCorpuration('', false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();
    });

    test('ניסיון שני לקשר נציג אחראי לאותו תאגיד - מתקבלת שגיאה שהוא כבר משויך', async () => {
        await regulationRPPage.RegulationToCorpuration('', false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        const text = await dealerPage.dialog.textContent();
        expect(text).toContain('איש הקשר כבר משוייך לתאגיד');
        await dealerPage.okEnd.click();
    });
});
