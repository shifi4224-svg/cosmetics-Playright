const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקה
const BackendLoginPage = require('../Pages/BackendLoginPage');

test.describe('בדיקות מערכת תפעולית (Backend)', () => {
    let po;
    let env;
    let backendLoginPage;

    // ניתן לטסט זמן ריצה ארוך (5 דקות) כי הוא מריץ לולאה של 20 איטרציות עם השהיות
    test.setTimeout(300000);

    test.beforeEach(async ({ page }) => {
        env = {};
        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        // אתחול אובייקט הדף
        backendLoginPage = new BackendLoginPage(page, po, env, console);
    });

    test('התחברות ל-Backend ושינוי סטטוס עוסק בלולאה', async ({ page }) => {
        // הפעלת הפונקציה שמבצעת את החיפוש והלחיצות 20 פעמים
        await backendLoginPage.LoginToBackend();
    });
});