require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const DealerPage = require('../Pages/Dealer');
const TipulitLoginPage = require('../Pages/TipulitPages/LoginPage');
const TipulitDealersPage = require('../Pages/TipulitPages/Dealers');

test.describe('בדיקת סנכרון פורטל-תפעולית - רישום עוסק', () => {
    let po;
    let env;
    let loginPage;
    let dealerPage;
    let sharedUtils;

    test.setTimeout(3600000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
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

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        po.pagesDealer = {
            Page1: async () => {},
            Page2: async () => {},
            Page3: async () => {},
        };

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);

        po.loginPage = new LoginPage(page, po, env, console);
        dealerPage = new DealerPage(page, po, env, console);
        po.regulationDealer = dealerPage;

        await po.loginPage.LoginDev();
    });

    test('רישום עוסק בפורטל ובדיקת הפרטים במערכת התפעולית', async ({ page }) => {
        // --- שלב 1: רישום עוסק בפורטל ---
        const randomId = await po.GetRandomValidID();
        const dealerName = `תאגיד סנכרון ${Date.now().toString().slice(-4)}`;
        console.log(`רושם עוסק: ${dealerName} | ת.ז: ${randomId}`);

        await dealerPage.RegulationDealerBusiness(false, 1, dealerName, randomId);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        const portalText = await dealerPage.dialog.textContent();
        expect(portalText).toContain('בהצלחה');
        await dealerPage.okEnd.click();
        console.log('✅ עוסק נרשם בפורטל בהצלחה');

        // --- שלב 2: כניסה למערכת התפעולית ---
        const tipulitLogin = new TipulitLoginPage(page, console);
        const tipulitDealer = new TipulitDealersPage(page, console);
        console.log('נכנס למערכת התפעולית...');
        await tipulitLogin.Login(
            process.env.TIPULIT_USER || '322638727',
            process.env.TIPULIT_PASSWORD || '1234'
        );

        // --- שלב 3: חיפוש העוסק בתפעולית ---
        console.log(`מחפש עוסק לפי מספר מזהה: ${randomId}`);
        await tipulitDealer.SearchByBusinessId(randomId);

        // --- שלב 4: בדיקת הפרטים ---
        console.log('בודק פרטי עוסק...');
        const results = await tipulitDealer.VerifyDealerDetails(
            dealerName,
            ['יבואן', 'נציג אחראי']
        );

        // הטסט עובר רק אם אין כשלונות
        try {
            expect(results.failed.length).toBe(0);
        } catch (err) {
            await page.pause();
            throw err;
        }
    });
});
