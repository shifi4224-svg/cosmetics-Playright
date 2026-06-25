require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const GeneralRequestPage = require('../Pages/GeneralRequest');
const RegulationItemPage = require('../Pages/RegulationItem');

test.describe('פניות - יצירת פניה מעסק', () => {
    let po, env, loginPage, generalRequestPage, regulationItemPage;

    test.setTimeout(300000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        loginPage = new LoginPage(page, po, env, console);
        generalRequestPage = new GeneralRequestPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);

        await loginPage.LoginDev();
    });

    test('פניה - בדיקת ולידציה: שליחה ללא שדות חובה', async ({ page }) => {
        // נווט ישירות לדף יצירת פניה
        await page.goto(`${env.url}/general-request/open`);
        await page.waitForLoadState('networkidle');

        const bugs = await generalRequestPage.ValidateRequiredFields();
        expect(bugs).toBe(0);
    });

    test('פניה - בדיקת כל הנושאים ב-dropdown', async ({ page }) => {
        await page.goto(`${env.url}/general-request/open`);
        await page.waitForLoadState('networkidle');

        const bugs = await generalRequestPage.ValidateAllSubjects();
        expect(bugs).toBe(0);
    });

    test('פניה - בדיקת כל סוגי הפניה ב-dropdown', async ({ page }) => {
        await page.goto(`${env.url}/general-request/open`);
        await page.waitForLoadState('networkidle');

        const bugs = await generalRequestPage.ValidateAllTypes('איפור וטיפוח');
        expect(bugs).toBe(0);
    });

    test('פניה - יצירת פניה תופעת לוואי - בירור סטטוס', async ({ page }) => {
        await page.goto(`${env.url}/general-request/open`);
        await page.waitForLoadState('networkidle');

        const bugs = await generalRequestPage.CreateRequest(
            'תופעת לוואי',
            'בירור סטטוס',
            'בדיקת אוטומציה — פניה תופעת לוואי',
            null,
            false
        );
        expect(bugs).toBe(0);
    });

    test('פניה - יצירת פניה עם קובץ מצורף', async ({ page }) => {
        await page.goto(`${env.url}/general-request/open`);
        await page.waitForLoadState('networkidle');

        const bugs = await generalRequestPage.CreateRequest(
            'איפור וטיפוח',
            'השלמת מסמכים',
            'בדיקת אוטומציה — פניה עם קובץ מצורף',
            null,
            true
        );
        expect(bugs).toBe(0);
    });

    test('פניה - ביטול פניה בלחיצה על ביטול', async ({ page }) => {
        await page.goto(`${env.url}/general-request/open`);
        await page.waitForLoadState('networkidle');

        // מלא שדות ואז לחץ ביטול
        await generalRequestPage.subjectDropdown.click();
        await generalRequestPage.subjectAipur.click();
        await generalRequestPage.typeDropdown.click();
        await generalRequestPage.typeStatusCheck.click();
        await generalRequestPage.descriptionInput.fill('טקסט לא אמור להישמר');

        await generalRequestPage.cancelBtn.click();
        await page.waitForTimeout(1000);

        // צפה שהדף חזר לרשימה או לדף הבית
        const url = page.url();
        const backToHome = url.includes('/home') || url.includes('/item') || url.includes('/register');
        expect(backToHome).toBeTruthy();
    });
});
