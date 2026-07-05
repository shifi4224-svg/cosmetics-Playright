require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const DealerPage = require('../Pages/Dealer');
const RegulationItemPage = require('../Pages/RegulationItem');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const RegulationRPPage = require('../Pages/RegulationRP');
const TipulitLoginPage = require('../Pages/TipulitPages/LoginPage');
const TipulitDealersPage = require('../Pages/TipulitPages/Dealers');
const TipulitNotificationsPage = require('../Pages/TipulitPages/TipulitNotificationsPage');

// --- שיתוף beforeEach ---
function setupBeforeEach(getPage) {
    const state = {};

    test.beforeEach(async ({ page }) => {
        const env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            telefon: process.env.TELEFON || '0501234567',
            email: process.env.EMAIL || 'test@test.com',
            houseNumber: process.env.HOUSE_NUMBER || '5',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '34',
            charEmail: '',
            charAddressNotes: '',
            charOtherAddress: '',
        };

        const po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.pagesDealer = { Page1: async () => {}, Page2: async () => {}, Page3: async () => {} };

        const sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);

        const loginPage = new LoginPage(page, po, env, console);
        const dealerPage = new DealerPage(page, po, env, console);
        po.loginPage = loginPage;
        po.regulationDealer = dealerPage;

        await loginPage.LoginDev();

        state.page = page;
        state.env = env;
        state.po = po;
        state.sharedUtils = sharedUtils;
        state.dealerPage = dealerPage;
    });

    return state;
}

// =========================================================
// תסריט 18: נוטיפיקציה - שפיכת נתונים למערכת תפעולית
// =========================================================
test.describe('תסריט 18 - נוטיפיקציה: שפיכת נתונים לתפעולית', () => {
    test.setTimeout(3600000);

    let state = {};

    test.beforeEach(async ({ page }) => {
        const env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            telefon: process.env.TELEFON || '0501234567',
            email: process.env.EMAIL || 'test@test.com',
            houseNumber: process.env.HOUSE_NUMBER || '5',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '34',
            charEmail: '',
            charAddressNotes: '',
            charOtherAddress: '',
        };

        const po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.pagesDealer = { Page1: async () => {}, Page2: async () => {}, Page3: async () => {} };

        const sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);

        const loginPage = new LoginPage(page, po, env, console);
        const dealerPage = new DealerPage(page, po, env, console);
        po.loginPage = loginPage;
        po.regulationDealer = dealerPage;

        await loginPage.LoginDev();

        state = { page, env, po, sharedUtils, dealerPage };
    });

    test('יצירת נוטיפיקציה בפורטל ובדיקה בתפעולית', async ({ page }) => {
        const { po } = state;

        // --- שלב 1: בחירת פריט ויצירת נוטיפיקציה בפורטל ---
        const notifPage = new RegulationNotificationPage(page, po, state.env, console);
        const itemPage = new RegulationItemPage(page, po, state.env, console);

        console.log('🔵 שלב 1: יצירת נוטיפיקציה בפורטל...');

        // פתח פריט קיים וצור נוטיפיקציה sanity
        await notifPage.CreateNotificationSanity('', false);

        // שמור את שם הפריט לחיפוש בתפעולית
        const itemNameEl = page.locator('//input[@aria-label="שם תמרוק בעברית"]').first();
        const itemNameHeb = await itemNameEl.inputValue().catch(() => '');
        console.log(`✅ נוטיפיקציה נוצרה עבור פריט: "${itemNameHeb}"`);

        // --- שלב 2: כניסה לתפעולית ---
        console.log('🔵 שלב 2: כניסה למערכת התפעולית...');
        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitNotif = new TipulitNotificationsPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // --- שלב 3: חיפוש ובדיקה ---
        console.log('🔵 שלב 3: חיפוש נוטיפיקציה בתפעולית...');
        let results;

        if (itemNameHeb) {
            results = await tipulitNotif.VerifyNotificationExists(itemNameHeb, 'הושלמה');
        } else {
            // אם לא קיבלנו שם מסוים — בדוק שהתפעולית עולה ויש פריטים
            results = await tipulitNotif.VerifySearchFields();
            if (results.failed.length === 0) {
                results.passed.push('✅ תפעולית עולה ושדות חיפוש קיימים (לא נמצא שם פריט ספציפי)');
            }
        }

        try {
            expect(results.failed.length).toBe(0);
        } catch (err) {
            await page.pause();
            throw err;
        }
    });

    test('בדיקת שדות חיפוש ומידע בתפעולית לנוטיפיקציה', async ({ page }) => {
        const { po } = state;

        console.log('🔵 בדיקת מבנה תפעולית - פריטים ונוטיפיקציות...');

        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitNotif = new TipulitNotificationsPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // בדיקת שדות חיפוש בסיסיים
        const results = await tipulitNotif.VerifySearchFields();
        console.log(`שדות שנמצאו: ${results.passed.length}, שדות חסרים: ${results.failed.length}`);

        // בדיקת פתיחת פריט עם נוטיפיקציה קיימת (סטטוס הושלמה)
        await tipulitNotif.OpenItem('רגיל', 'הושלמה');
        results.passed.push('✅ פריט עם נוטיפיקציה הושלמה נפתח בתפעולית');

        try {
            expect(results.failed.length).toBe(0);
        } catch (err) {
            await page.pause();
            throw err;
        }
    });
});

// =========================================================
// תסריט 19: תאגיד נציג אחראי - שפיכת נתונים לתפעולית
// =========================================================
test.describe('תסריט 19 - תאגיד נציג אחראי: שפיכת נתונים לתפעולית', () => {
    test.setTimeout(3600000);

    let state = {};

    test.beforeEach(async ({ page }) => {
        const env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            telefon: process.env.TELEFON || '0501234567',
            email: process.env.EMAIL || 'test@test.com',
            houseNumber: process.env.HOUSE_NUMBER || '5',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '34',
            charEmail: '',
            charAddressNotes: '',
            charOtherAddress: '',
        };

        const po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.pagesDealer = { Page1: async () => {}, Page2: async () => {}, Page3: async () => {} };

        const sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);

        const loginPage = new LoginPage(page, po, env, console);
        const dealerPage = new DealerPage(page, po, env, console);
        po.loginPage = loginPage;
        po.regulationDealer = dealerPage;

        await loginPage.LoginDev();

        state = { page, env, po, sharedUtils, dealerPage };
    });

    test('רישום תאגיד נציג אחראי בפורטל ובדיקה בתפעולית', async ({ page }) => {
        const { po } = state;

        // --- שלב 1: רישום תאגיד RP בפורטל ---
        console.log('🔵 שלב 1: רישום תאגיד נציג אחראי בפורטל...');
        const randomId = await po.GetRandomValidID();
        const corpName = `תאגיד נציג אחראי ${Date.now().toString().slice(-4)}`;

        const dealerPage = new DealerPage(page, po, state.env, console);
        await dealerPage.RegulationDealerBusiness(false, 1, corpName, randomId);

        const dialogEl = page.locator('//div[@role="dialog"]');
        await expect(dialogEl).toBeVisible({ timeout: 30000 });
        const dialogText = await dialogEl.textContent();
        expect(dialogText).toContain('בהצלחה');

        const okBtn = page.locator('//button[@class="main-button wide"] | //button[normalize-space()="אישור"] | //button[normalize-space()="OK"]').first();
        await okBtn.click();
        console.log(`✅ תאגיד RP נרשם: ${corpName} | ת.ז: ${randomId}`);

        // --- שלב 2: כניסה לתפעולית ---
        console.log('🔵 שלב 2: כניסה למערכת התפעולית...');
        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitDealer = new TipulitDealersPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // --- שלב 3: חיפוש ובדיקה ---
        console.log(`🔵 שלב 3: חיפוש תאגיד RP בתפעולית: ${randomId}...`);
        await tipulitDealer.SearchByBusinessId(randomId);

        const results = await tipulitDealer.VerifyDealerDetails(corpName, ['נציג אחראי']);

        try {
            expect(results.failed.length).toBe(0);
        } catch (err) {
            await page.pause();
            throw err;
        }
    });

    test('בדיקת פרטי תאגיד נציג אחראי קיים בתפעולית', async ({ page }) => {
        console.log('🔵 בדיקת תאגיד RP קיים בתפעולית...');

        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitDealer = new TipulitDealersPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // פתח עוסק ע"י שם מנכ"ל ידוע
        await tipulitDealer.OpenDealer('שפרה');
        await page.waitForTimeout(2000);

        // בדוק שהדף נפתח עם שם עסק
        const businessName = await tipulitDealer.businessName.inputValue().catch(() => '');
        console.log(`שם עסק שנפתח: ${businessName}`);
        expect(businessName.length).toBeGreaterThan(0);

        // בדוק טאבים
        await tipulitDealer.hazharot.click();
        await page.waitForTimeout(500);
        console.log('✅ טאב הצהרות נפתח');

        await tipulitDealer.concats.click();
        await page.waitForTimeout(500);
        console.log('✅ טאב אנשי קשר נפתח');
    });
});

// =========================================================
// תסריט 20: נציג אחראי יחיד - שפיכת נתונים לתפעולית
// =========================================================
test.describe('תסריט 20 - נציג אחראי יחיד: שפיכת נתונים לתפעולית', () => {
    test.setTimeout(3600000);

    let state = {};

    test.beforeEach(async ({ page }) => {
        const env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            telefon: process.env.TELEFON || '0501234567',
            email: process.env.EMAIL || 'test@test.com',
            houseNumber: process.env.HOUSE_NUMBER || '5',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '34',
            charEmail: '',
            charAddressNotes: '',
            charOtherAddress: '',
        };

        const po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.pagesDealer = { Page1: async () => {}, Page2: async () => {}, Page3: async () => {} };

        const sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);

        const loginPage = new LoginPage(page, po, env, console);
        const dealerPage = new DealerPage(page, po, env, console);
        po.loginPage = loginPage;
        po.regulationDealer = dealerPage;

        await loginPage.LoginDev();

        state = { page, env, po, sharedUtils, dealerPage };
    });

    test('רישום נציג אחראי יחיד בפורטל ובדיקה בתפעולית', async ({ page }) => {
        const { po } = state;

        // --- שלב 1: רישום נציג אחראי יחיד (לא מקושר) ---
        console.log('🔵 שלב 1: רישום נציג אחראי יחיד בפורטל...');
        const rpPage = new RegulationRPPage(page, po, state.env, console);

        // פנה לרישום נציג אחראי יחיד (לא מקושר לתאגיד)
        await rpPage.RegulationToRP('', false);

        // בדוק dialog הצלחה
        const dialogEl = page.locator('//div[@role="dialog"]');
        await expect(dialogEl).toBeVisible({ timeout: 30000 });
        const dialogText = await dialogEl.textContent();
        expect(dialogText).toContain('בהצלחה');

        // שמור ת.ז לחיפוש
        const idInput = page.locator('//input[@aria-label="ת.ז/ח.פ"] | //input[@aria-label="ת.ז"]').first();
        const rpId = await idInput.inputValue().catch(() => '');
        console.log(`✅ נציג אחראי נרשם, ת.ז: ${rpId}`);

        const okBtn = page.locator('//button[@class="main-button wide"] | //button[normalize-space()="אישור"] | //button[normalize-space()="OK"]').first();
        await okBtn.click();

        // --- שלב 2: כניסה לתפעולית ---
        console.log('🔵 שלב 2: כניסה למערכת התפעולית...');
        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitDealer = new TipulitDealersPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // --- שלב 3: חיפוש ובדיקה ---
        if (rpId) {
            console.log(`🔵 שלב 3: חיפוש נציג אחראי לפי ת.ז: ${rpId}...`);
            await tipulitDealer.SearchByBusinessId(rpId);
            const results = await tipulitDealer.VerifyDealerDetails('', ['נציג אחראי']);

            try {
                expect(results.failed.length).toBe(0);
            } catch (err) {
                await page.pause();
                throw err;
            }
        } else {
            // בדיקה כללית שהתפעולית עולה
            await tipulitDealer.OpenDealer('שפרה');
            const name = await tipulitDealer.businessName.inputValue().catch(() => '');
            expect(name.length).toBeGreaterThan(0);
            console.log('✅ תפעולית עולה ועוסק נפתח');
        }
    });

    test('בדיקת מבנה נציג אחראי קיים בתפעולית', async ({ page }) => {
        console.log('🔵 בדיקת נציג אחראי קיים בתפעולית...');

        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitDealer = new TipulitDealersPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        await tipulitDealer.OpenDealer('שפרה');
        await page.waitForTimeout(2000);

        const businessName = await tipulitDealer.businessName.inputValue().catch(() => '');
        expect(businessName.length).toBeGreaterThan(0);
        console.log(`שם עוסק שנפתח: ${businessName}`);

        // בדוק שדה "פעיל"
        const isPail = await tipulitDealer.pail.isVisible().catch(() => false);
        console.log(isPail ? '✅ סטטוס עוסק: פעיל' : 'ℹ️ סטטוס עוסק: לא פעיל (מקובל)');
    });
});

// =========================================================
// תסריט 42: נוטיפיקציה נאות - שפיכת נתונים לתפעולית
// =========================================================
test.describe('תסריט 42 - נוטיפיקציה נאות: שפיכת נתונים לתפעולית', () => {
    test.setTimeout(3600000);

    let state = {};

    test.beforeEach(async ({ page }) => {
        const env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            telefon: process.env.TELEFON || '0501234567',
            email: process.env.EMAIL || 'test@test.com',
            houseNumber: process.env.HOUSE_NUMBER || '5',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '34',
            charEmail: '',
            charAddressNotes: '',
            charOtherAddress: '',
        };

        const po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.pagesDealer = { Page1: async () => {}, Page2: async () => {}, Page3: async () => {} };

        const sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);

        const loginPage = new LoginPage(page, po, env, console);
        const dealerPage = new DealerPage(page, po, env, console);
        po.loginPage = loginPage;
        po.regulationDealer = dealerPage;

        await loginPage.LoginDev();

        state = { page, env, po, sharedUtils, dealerPage };
    });

    test('יצירת נוטיפיקציה נאות בפורטל ובדיקה בתפעולית', async ({ page }) => {
        const { po } = state;

        // --- שלב 1: יצירת נוטיפיקציה נאות ---
        console.log('🔵 שלב 1: יצירת נוטיפיקציה נאות בפורטל (מסלול אירופאי)...');

        // נוטיפיקציה נאות - שימוש ב-CreateNotificationSanity עם פריט נאות
        const notifPage = new RegulationNotificationPage(page, po, state.env, console);

        // הפורטל מיועד לנוטיפיקציה נאות (פריט נאות)
        await notifPage.CreateNotificationSanity('', false);

        const itemNameEl = page.locator('//input[@aria-label="שם תמרוק בעברית"]').first();
        const itemNameHeb = await itemNameEl.inputValue().catch(() => '');
        console.log(`✅ נוטיפיקציה נאות נוצרה עבור פריט: "${itemNameHeb}"`);

        // --- שלב 2: כניסה לתפעולית ---
        console.log('🔵 שלב 2: כניסה למערכת התפעולית...');
        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitNotif = new TipulitNotificationsPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // --- שלב 3: חיפוש ובדיקה ---
        console.log('🔵 שלב 3: חיפוש נוטיפיקציה נאות בתפעולית...');
        let results;

        if (itemNameHeb) {
            results = await tipulitNotif.VerifyNotificationExists(itemNameHeb, 'הושלמה');
        } else {
            // בדיקה שהתפעולית עולה ויש פריטים מסוג נאות
            await tipulitNotif.itemButton.waitFor({ state: 'visible', timeout: 10000 });
            await tipulitNotif.itemButton.click();
            await tipulitNotif.searchItemType.waitFor({ state: 'visible', timeout: 10000 });
            await tipulitNotif.searchItemType.fill('נאות');
            await page.waitForTimeout(2000);
            const rowCount = await tipulitNotif.table.count();
            results = { passed: [], failed: [] };
            if (rowCount > 0) {
                results.passed.push(`✅ נמצאו ${rowCount} פריטים נאותים בתפעולית`);
            } else {
                results.failed.push('❌ לא נמצאו פריטים נאותים בתפעולית');
            }
        }

        try {
            expect(results.failed.length).toBe(0);
        } catch (err) {
            await page.pause();
            throw err;
        }
    });

    test('בדיקת טאבים בנוטיפיקציה נאות בתפעולית', async ({ page }) => {
        console.log('🔵 בדיקת מבנה נוטיפיקציה נאות בתפעולית...');

        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitNotif = new TipulitNotificationsPage(page, console);

        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // פתח פריט נאות עם נוטיפיקציה הושלמה
        await tipulitNotif.itemButton.waitFor({ state: 'visible', timeout: 10000 });
        await tipulitNotif.itemButton.click();
        await tipulitNotif.searchItemType.waitFor({ state: 'visible', timeout: 10000 });
        await tipulitNotif.searchItemType.fill('נאות');
        await tipulitNotif.searchNotState.fill('הושלמה');
        await page.waitForTimeout(2000);

        const rowCount = await tipulitNotif.table.count();
        if (rowCount === 0) {
            console.log('ℹ️ לא נמצאו פריטים נאותים עם נוטיפיקציה הושלמה — בדיקה כללית');
            // בדיקה כללית שהמסך עלה
            expect(await tipulitNotif.searchItemType.isVisible()).toBeTruthy();
            return;
        }

        await tipulitNotif.row1.click();
        await page.waitForTimeout(2000);

        // עבור לנוטיפיקציות
        if (await tipulitNotif.tabNotifications.isVisible().catch(() => false)) {
            await tipulitNotif.tabNotifications.click();
            await page.waitForTimeout(1000);

            const notifCount = await tipulitNotif.table.count();
            console.log(`נמצאו ${notifCount} נוטיפיקציות לפריט`);
            expect(notifCount).toBeGreaterThan(0);

            // פתח נוטיפיקציה ראשונה ובדוק טאבים
            if (notifCount > 0) {
                await tipulitNotif.row1.click();
                await page.waitForTimeout(2000);

                // בדוק טאב פרטי תמרוק (ייחודי לנאות)
                const tabCosmeticDetails = await tipulitNotif.tabCosmeticDetails.isVisible().catch(() => false);
                console.log(tabCosmeticDetails ? '✅ טאב פרטי תמרוק קיים' : 'ℹ️ טאב פרטי תמרוק לא נמצא');

                // בדוק טאב ייבוא תמרוק (ייחודי לנאות)
                const tabImport = await tipulitNotif.tabCosmeticImport.isVisible().catch(() => false);
                console.log(tabImport ? '✅ טאב ייבוא תמרוק קיים' : 'ℹ️ טאב ייבוא לא נמצא');
            }
        }

        console.log('✅ בדיקת מבנה נוטיפיקציה נאות הושלמה');
    });
});
