require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationItemPage = require('../Pages/RegulationItem');
const RegulationNotificationPage = require('../Pages/RegulationNotification');

test.describe('בדיקות קבצי נוטיפיקציה', () => {
    let po, env, loginPage, sharedUtils, regulationItemPage, regulationNotificationPage;

    test.setTimeout(600000);

    function buildEnv(page) {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            name: process.env.USER_NAME || 'שפרה הקר',
        };
        po = {};
        po.dataFolder = path.join(__dirname, '../Data');
        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        loginPage = new LoginPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        po.regulationNotification = regulationNotificationPage;
    }

    async function addItemAndGetName(page) {
        const uniqueId = Date.now().toString().slice(-6);
        const itemNameH = `פריט קבצים ${uniqueId}`;
        const itemNameE = `Files Test ${uniqueId}`;
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
        // אישור ע"י נציג אחראי — נשארים בעמוד נציג אחראי
        // _NavigateToKitSection / _NavigateToShadesSection וכו' ימשיכו משם
        await regulationItemPage.OpenItem1("", "", itemNameH, "פריט רגיל", "לאישור נציג אחראי", "approve", false);
        return itemNameH;
    }

    // ─────────────────────────────────────────────
    test.describe('קבצי ערכה', () => {
        let itemName;

        test.beforeEach(async ({ page }) => {
            buildEnv(page);
            await loginPage.LoginDev();
            itemName = await addItemAndGetName(page);
            await regulationNotificationPage._NavigateToKitSection(itemName, true);
        });

        test('ערכה - סוגי קבצים תקינים ולא תקינים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileTypeValidation(
                regulationNotificationPage.typeFileKit, "ערכה"
            );
            expect(bugs).toBe(0);
        });

        test('ערכה - שם קובץ תווים מאופשרים', async () => {
            const result = await regulationNotificationPage.filesPage.TestFileNameValidation(
                regulationNotificationPage.typeFileKit, "ערכה", "Doc1.pdf"
            );
            expect(result.bugs).toBe(0);
        });

        test('ערכה - שם קובץ מקסימום תווים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileNameMaxLength(
                regulationNotificationPage.typeFileKit, "ערכה", "Doc1.pdf", 100
            );
            expect(bugs).toBe(0);
        });

        test('ערכה - גודל קובץ (11MB נדחה, 9MB עובר)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileSizeValidation(
                regulationNotificationPage.typeFileKit, "ערכה"
            );
            expect(bugs).toBe(0);
        });

        test('ערכה - כמות קבצים (מקסימום 1)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileCountValidation(
                regulationNotificationPage.typeFileKit, "ערכה"
            );
            expect(bugs).toBe(0);
        });
    });

    // ─────────────────────────────────────────────
    test.describe('קבצי גוון', () => {
        let itemName;

        test.beforeEach(async ({ page }) => {
            buildEnv(page);
            await loginPage.LoginDev();
            itemName = await addItemAndGetName(page);
            await regulationNotificationPage._NavigateToShadesSection(itemName, true);
        });

        test('גוון - סוגי קבצים תקינים ולא תקינים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileTypeValidation(
                regulationNotificationPage.typeFileShades, "גוון"
            );
            expect(bugs).toBe(0);
        });

        test('גוון - שם קובץ תווים מאופשרים', async () => {
            const result = await regulationNotificationPage.filesPage.TestFileNameValidation(
                regulationNotificationPage.typeFileShades, "גוון", "Doc1.pdf"
            );
            expect(result.bugs).toBe(0);
        });

        test('גוון - שם קובץ מקסימום תווים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileNameMaxLength(
                regulationNotificationPage.typeFileShades, "גוון", "Doc1.pdf", 100
            );
            expect(bugs).toBe(0);
        });

        test('גוון - גודל קובץ (11MB נדחה, 9MB עובר)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileSizeValidation(
                regulationNotificationPage.typeFileShades, "גוון"
            );
            expect(bugs).toBe(0);
        });

        test('גוון - כמות קבצים (מקסימום 1)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileCountValidation(
                regulationNotificationPage.typeFileShades, "גוון"
            );
            expect(bugs).toBe(0);
        });
    });

    // ─────────────────────────────────────────────
    test.describe('תמונת תמרוק', () => {
        let itemName;

        test.beforeEach(async ({ page }) => {
            buildEnv(page);
            await loginPage.LoginDev();
            itemName = await addItemAndGetName(page);
            await regulationNotificationPage._NavigateToStep2(itemName, true);
        });

        test('תמונת תמרוק - סוגי קבצים תקינים ולא תקינים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileTypeValidation(
                regulationNotificationPage.cosmeticsPictures, "תמונות תמרוק"
            );
            expect(bugs).toBe(0);
        });

        test('תמונת תמרוק - שם קובץ תווים מאופשרים', async () => {
            const result = await regulationNotificationPage.filesPage.TestFileNameValidation(
                regulationNotificationPage.cosmeticsPictures, "תמונות תמרוק", "Doc1.pdf"
            );
            expect(result.bugs).toBe(0);
        });

        test('תמונת תמרוק - שם קובץ מקסימום תווים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileNameMaxLength(
                regulationNotificationPage.cosmeticsPictures, "תמונות תמרוק", "Doc1.pdf", 100
            );
            expect(bugs).toBe(0);
        });

        test('תמונת תמרוק - גודל קובץ (11MB נדחה, 9MB עובר)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileSizeValidation(
                regulationNotificationPage.cosmeticsPictures, "תמונות תמרוק"
            );
            expect(bugs).toBe(0);
        });

        test('תמונת תמרוק - צירוף כמה קבצים ביחד (לא אחד אחרי השני)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestMultipleFilesAtOnce(
                regulationNotificationPage.cosmeticsPictures, "תמונות תמרוק", 3
            );
            expect(bugs).toBe(0);
        });

        test('תמונת תמרוק - 2 קבצים (סה"כ ~18MB, כל אחד 9MB) צריכים לעבור', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestCombinedSizePass(
                regulationNotificationPage.cosmeticsPictures, "תמונות תמרוק"
            );
            expect(bugs).toBe(0);
        });

        test('תמונת תמרוק - כמות קבצים (6 עוברים, 7 נדחים)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestMaxFilesCount(
                regulationNotificationPage.cosmeticsPictures, "תמונות תמרוק", 6
            );
            expect(bugs).toBe(0);
        });
    });

    // ─────────────────────────────────────────────
    test.describe('תווית תמרוק', () => {
        let itemName;

        test.beforeEach(async ({ page }) => {
            buildEnv(page);
            await loginPage.LoginDev();
            itemName = await addItemAndGetName(page);
            await regulationNotificationPage._NavigateToStep2(itemName, true);
        });

        test('תווית תמרוק - סוגי קבצים תקינים ולא תקינים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileTypeValidation(
                regulationNotificationPage.cosmeticsLabel, "תווית תמרוק"
            );
            expect(bugs).toBe(0);
        });

        test('תווית תמרוק - שם קובץ תווים מאופשרים', async () => {
            const result = await regulationNotificationPage.filesPage.TestFileNameValidation(
                regulationNotificationPage.cosmeticsLabel, "תווית תמרוק", "Doc1.pdf"
            );
            expect(result.bugs).toBe(0);
        });

        test('תווית תמרוק - שם קובץ מקסימום תווים', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileNameMaxLength(
                regulationNotificationPage.cosmeticsLabel, "תווית תמרוק", "Doc1.pdf", 100
            );
            expect(bugs).toBe(0);
        });

        test('תווית תמרוק - גודל קובץ (11MB נדחה, 9MB עובר)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileSizeValidation(
                regulationNotificationPage.cosmeticsLabel, "תווית תמרוק"
            );
            expect(bugs).toBe(0);
        });

        test('תווית תמרוק - כמות קבצים (מקסימום 1)', async () => {
            const bugs = await regulationNotificationPage.filesPage.TestFileCountValidation(
                regulationNotificationPage.cosmeticsLabel, "תווית תמרוק"
            );
            expect(bugs).toBe(0);
        });
    });
});
