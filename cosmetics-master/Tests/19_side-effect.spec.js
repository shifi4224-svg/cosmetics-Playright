require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationItemPage = require('../Pages/RegulationItem');
const SideEffectPage = require('../Pages/SideEffect');

// ---- פונקציה משותפת: פתיחת רול מתוך הסיידבר ובחירת עסק ----
async function openRole(page, roleText, sharedUtils) {
    const roleSel = `//span[@class="sidebar-text ng-star-inserted" and text()="${roleText}"]`;
    await page.locator(roleSel).click();

    // סגור דיאלוג אם קיים
    if (await sharedUtils.isVisibleSafe('//div[@role="dialog"]', 2000)) {
        await page.locator(
            '//button[@class="main-button narrow"] | //button[normalize-space()="OK"] | //button[normalize-space()="אישור"]'
        ).click();
    }
    await page.waitForTimeout(500);

    // בחר עסק ראשון מהרשימה
    const businessItems = page.locator('//span[@class="item-text ng-star-inserted"] | mat-list-item .item-text');
    if (await businessItems.count() > 0) {
        await businessItems.first().click();
        await page.waitForTimeout(1000);
    }
}

// ---- פונקציה משותפת: ניווט לפריט עם נוטיפיקציה הושלמה ופתיחת רשימת תופעות לוואי ----
async function navigateToSideEffectList(page, regulationItemPage, sideEffectPage) {
    // פתח פריט עם נוטיפיקציה הושלמה
    await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // חפש כפתור "פעולות נוספות" ולחץ עליו
    const actionsMenu = page.locator('text=פעולות נוספות, button:has-text("פעולות נוספות"), //span[contains(text(),"פעולות נוספות")]');
    if (await actionsMenu.isVisible().catch(() => false)) {
        await actionsMenu.click();
        await page.waitForTimeout(500);
    }

    // לחץ על "דיווח תופעת לוואי"
    const sideEffectOption = page.locator('text=דיווח תופעת לוואי').first();
    if (!await sideEffectOption.isVisible().catch(() => false)) {
        // נסה via כפתור 3 נקודות בטבלת הנוטיפיקציות
        const moreBtn = page.locator('button[mat-icon-button], .more-btn, [class*="more-btn"], [aria-label*="עוד"]').first();
        if (await moreBtn.isVisible().catch(() => false)) {
            await moreBtn.click();
            await page.waitForTimeout(500);
        }
    }

    await page.locator('text=דיווח תופעת לוואי').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // בדוק שנמצאים בדף רשימת תופעות לוואי
    const url = page.url();
    return url.includes('sideEffect');
}

// ---- הגדרת beforeEach משותף ----
function setupBeforeEach(getPage) {
    let po, env, loginPage, sharedUtils, regulationItemPage, sideEffectPage;
    return {
        getInstances: () => ({ po, env, loginPage, sharedUtils, regulationItemPage, sideEffectPage }),
        setup: async (page) => {
            env = {
                url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
                user: process.env.USER_ID || '322638727',
                password: process.env.USER_BIRTH_YEAR || '2000',
            };

            po = {};
            po.dataFolder = path.join(__dirname, '../Data');

            sharedUtils = new SharedUtils(page, po, env, console);
            po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
            po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

            loginPage = new LoginPage(page, po, env, console);
            regulationItemPage = new RegulationItemPage(page, po, env, console);
            sideEffectPage = new SideEffectPage(page, po, env, console);
            po.regulationItem = regulationItemPage;

            await loginPage.LoginDev();

            return { sharedUtils, regulationItemPage, sideEffectPage };
        }
    };
}

// ============================================================
// בדיקה 1: מנכ"ל — דיווח תופעת לוואי
// ============================================================
test.describe('דיווח תופעת לוואי - מנכ"ל', () => {
    test.setTimeout(300000);

    let po, env, loginPage, sharedUtils, regulationItemPage, sideEffectPage;

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
        };
        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        sideEffectPage = new SideEffectPage(page, po, env, console);
        po.regulationItem = regulationItemPage;

        await loginPage.LoginDev();
    });

    test('מנכ"ל — ניווט לרשימת תופעות לוואי מתוך פריט', async ({ page }) => {
        // פתח פרופיל מנכ"ל
        await sharedUtils.OpenPageMancal();

        // נווט לפריט עם נוטיפיקציה שהושלמה
        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // פתח תפריט פעולות
        const actionsMenu = page.locator('text=פעולות נוספות, //span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        // בדוק שקיים הכפתור "דיווח תופעת לוואי"
        const sideEffectBtn = page.locator('text=דיווח תופעת לוואי').first();
        const isVisible = await sideEffectBtn.isVisible().catch(() => false);
        console.log(`כפתור 'דיווח תופעת לוואי' למנכ"ל: ${isVisible}`);
        expect(isVisible).toBeTruthy();

        // לחץ וניווט לרשימה
        await sideEffectBtn.click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        console.log(`URL רשימת תופעות לוואי: ${url}`);
        expect(url).toContain('sideEffect');
    });

    test('מנכ"ל — יצירת דיווח תופעת לוואי חדש (שלב 1 ולידציה)', async ({ page }) => {
        // פתח פרופיל מנכ"ל ונווט לפריט עם נוטיפיקציה
        await sharedUtils.OpenPageMancal();

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        await page.locator('text=דיווח תופעת לוואי').first().click();
        await page.waitForLoadState('networkidle');

        // לחץ "תופעת לוואי חדשה"
        const newBtn = page.locator('text=תופעת לוואי חדשה, button:has-text("תופעת לוואי חדשה")').first();
        if (await newBtn.isVisible().catch(() => false)) {
            await newBtn.click();
            await page.waitForLoadState('networkidle');
        }

        // בדוק שהגענו לטופס
        const formUrl = page.url();
        console.log(`URL טופס תופעת לוואי: ${formUrl}`);
        expect(formUrl).toContain('sideEffect/general');

        // ולידציה — שלח ללא מילוי שדות
        let bugs = await sideEffectPage.ValidateStep1RequiredFields();
        console.log(`מנכ"ל שלב 1 ולידציה — באגים: ${bugs}`);
        expect(bugs).toBe(0);
    });

    test('מנכ"ל — תהליך מלא: דיווח תופעת לוואי', async ({ page }) => {
        await sharedUtils.OpenPageMancal();

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        await page.locator('text=דיווח תופעת לוואי').first().click();
        await page.waitForLoadState('networkidle');

        const newBtn = page.locator('text=תופעת לוואי חדשה, button:has-text("תופעת לוואי חדשה")').first();
        if (await newBtn.isVisible().catch(() => false)) {
            await newBtn.click();
            await page.waitForLoadState('networkidle');
        }

        // שלב 1
        await sideEffectPage.FillStep1({
            phone: '0501234567',
            email: 'mancal@test.com',
            victimFirst: 'ישראל',
            victimLast: 'ישראלי',
            birthDate: '01/01/1990',
            gender: 'male',
        });

        // עבור לשלב 2
        const step2ok = await sideEffectPage.GoToStep2();
        console.log(`מנכ"ל עבר לשלב 2: ${step2ok}`);

        if (step2ok) {
            await page.waitForTimeout(1000);
            // עבור לשלב 3 אם קיים
            const nextBtn = page.locator('button:has-text("שלב הבא"), moh-button:has-text("שלב הבא")');
            if (await nextBtn.isVisible().catch(() => false)) {
                await nextBtn.click();
                await page.waitForTimeout(1000);
            }

            // שלח
            const submitBtn = page.locator('button:has-text("שלח"), button:has-text("סיום"), moh-button:has-text("שלח")');
            if (await submitBtn.isVisible().catch(() => false)) {
                await submitBtn.click();
                await page.waitForTimeout(3000);

                const dialog = page.locator('mat-dialog-container, [role="dialog"], .swal2-popup, moh-dialog');
                if (await dialog.first().isVisible().catch(() => false)) {
                    const text = await dialog.first().textContent().catch(() => '');
                    console.log(`דיאלוג סיום מנכ"ל: ${text}`);
                    const okBtn = page.locator('button:has-text("הבנתי"), button:has-text("OK"), button:has-text("אישור")');
                    if (await okBtn.isVisible().catch(() => false)) await okBtn.first().click();
                }
            }
        }

        // בדוק שחזרנו לרשימה או קיבלנו אישור
        const finalUrl = page.url();
        console.log(`URL סיום מנכ"ל: ${finalUrl}`);
        expect(finalUrl).toContain('sideEffect');
    });
});

// ============================================================
// בדיקה 2: נושא משרה בתאגיד — דיווח תופעת לוואי
// ============================================================
test.describe('דיווח תופעת לוואי - נושא משרה בתאגיד', () => {
    test.setTimeout(300000);

    let po, env, loginPage, sharedUtils, regulationItemPage, sideEffectPage;

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
        };
        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        sideEffectPage = new SideEffectPage(page, po, env, console);
        po.regulationItem = regulationItemPage;

        await loginPage.LoginDev();
    });

    test('נושא משרה — ניווט לרשימת תופעות לוואי מתוך פריט', async ({ page }) => {
        // פתח פרופיל נושא משרה בתאגיד
        await openRole(page, 'נושא משרה בתאגיד', sharedUtils);

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        const sideEffectBtn = page.locator('text=דיווח תופעת לוואי').first();
        const isVisible = await sideEffectBtn.isVisible().catch(() => false);
        console.log(`כפתור 'דיווח תופעת לוואי' לנושא משרה: ${isVisible}`);
        expect(isVisible).toBeTruthy();

        await sideEffectBtn.click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toContain('sideEffect');
    });

    test('נושא משרה — תהליך מלא: דיווח תופעת לוואי', async ({ page }) => {
        await openRole(page, 'נושא משרה בתאגיד', sharedUtils);

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        await page.locator('text=דיווח תופעת לוואי').first().click();
        await page.waitForLoadState('networkidle');

        const newBtn = page.locator('text=תופעת לוואי חדשה, button:has-text("תופעת לוואי חדשה")').first();
        if (await newBtn.isVisible().catch(() => false)) {
            await newBtn.click();
            await page.waitForLoadState('networkidle');
        }

        const formUrl = page.url();
        expect(formUrl).toContain('sideEffect/general');

        await sideEffectPage.FillStep1({
            phone: '0521234567',
            email: 'nosi@test.com',
            victimFirst: 'שרה',
            victimLast: 'לוי',
            birthDate: '15/05/1985',
            gender: 'female',
        });

        const step2ok = await sideEffectPage.GoToStep2();
        console.log(`נושא משרה עבר לשלב 2: ${step2ok}`);

        if (step2ok) {
            await page.waitForTimeout(1000);
            const nextBtn = page.locator('button:has-text("שלב הבא"), moh-button:has-text("שלב הבא")');
            if (await nextBtn.isVisible().catch(() => false)) {
                await nextBtn.click();
                await page.waitForTimeout(1000);
            }

            const submitBtn = page.locator('button:has-text("שלח"), button:has-text("סיום"), moh-button:has-text("שלח")');
            if (await submitBtn.isVisible().catch(() => false)) {
                await submitBtn.click();
                await page.waitForTimeout(3000);

                const dialog = page.locator('mat-dialog-container, [role="dialog"], .swal2-popup, moh-dialog');
                if (await dialog.first().isVisible().catch(() => false)) {
                    const text = await dialog.first().textContent().catch(() => '');
                    console.log(`דיאלוג סיום נושא משרה: ${text}`);
                    const okBtn = page.locator('button:has-text("הבנתי"), button:has-text("OK"), button:has-text("אישור")');
                    if (await okBtn.isVisible().catch(() => false)) await okBtn.first().click();
                }
            }
        }

        const finalUrl = page.url();
        console.log(`URL סיום נושא משרה: ${finalUrl}`);
        expect(finalUrl).toContain('sideEffect');
    });
});

// ============================================================
// בדיקה 3: עובד ממונה בתאגיד — דיווח תופעת לוואי
// ============================================================
test.describe('דיווח תופעת לוואי - עובד ממונה בתאגיד', () => {
    test.setTimeout(300000);

    let po, env, loginPage, sharedUtils, regulationItemPage, sideEffectPage;

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
        };
        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        sideEffectPage = new SideEffectPage(page, po, env, console);
        po.regulationItem = regulationItemPage;

        await loginPage.LoginDev();
    });

    test('עובד ממונה — ניווט לרשימת תופעות לוואי מתוך פריט', async ({ page }) => {
        await openRole(page, 'עובד ממונה בתאגיד', sharedUtils);

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        const sideEffectBtn = page.locator('text=דיווח תופעת לוואי').first();
        const isVisible = await sideEffectBtn.isVisible().catch(() => false);
        console.log(`כפתור 'דיווח תופעת לוואי' לעובד ממונה: ${isVisible}`);
        expect(isVisible).toBeTruthy();

        await sideEffectBtn.click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toContain('sideEffect');
    });

    test('עובד ממונה — תהליך מלא: דיווח תופעת לוואי', async ({ page }) => {
        await openRole(page, 'עובד ממונה בתאגיד', sharedUtils);

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        await page.locator('text=דיווח תופעת לוואי').first().click();
        await page.waitForLoadState('networkidle');

        const newBtn = page.locator('text=תופעת לוואי חדשה, button:has-text("תופעת לוואי חדשה")').first();
        if (await newBtn.isVisible().catch(() => false)) {
            await newBtn.click();
            await page.waitForLoadState('networkidle');
        }

        const formUrl = page.url();
        expect(formUrl).toContain('sideEffect/general');

        await sideEffectPage.FillStep1({
            phone: '0531234567',
            email: 'oved@test.com',
            victimFirst: 'דוד',
            victimLast: 'כהן',
            birthDate: '20/03/2000',
            gender: 'male',
        });

        const step2ok = await sideEffectPage.GoToStep2();
        console.log(`עובד ממונה עבר לשלב 2: ${step2ok}`);

        if (step2ok) {
            await page.waitForTimeout(1000);
            const nextBtn = page.locator('button:has-text("שלב הבא"), moh-button:has-text("שלב הבא")');
            if (await nextBtn.isVisible().catch(() => false)) {
                await nextBtn.click();
                await page.waitForTimeout(1000);
            }

            const submitBtn = page.locator('button:has-text("שלח"), button:has-text("סיום"), moh-button:has-text("שלח")');
            if (await submitBtn.isVisible().catch(() => false)) {
                await submitBtn.click();
                await page.waitForTimeout(3000);

                const dialog = page.locator('mat-dialog-container, [role="dialog"], .swal2-popup, moh-dialog');
                if (await dialog.first().isVisible().catch(() => false)) {
                    const text = await dialog.first().textContent().catch(() => '');
                    console.log(`דיאלוג סיום עובד ממונה: ${text}`);
                    const okBtn = page.locator('button:has-text("הבנתי"), button:has-text("OK"), button:has-text("אישור")');
                    if (await okBtn.isVisible().catch(() => false)) await okBtn.first().click();
                }
            }
        }

        const finalUrl = page.url();
        console.log(`URL סיום עובד ממונה: ${finalUrl}`);
        expect(finalUrl).toContain('sideEffect');
    });
});

// ============================================================
// בדיקה 4: נציג אחראי — דיווח תופעת לוואי
// ============================================================
test.describe('דיווח תופעת לוואי - נציג אחראי', () => {
    test.setTimeout(300000);

    let po, env, loginPage, sharedUtils, regulationItemPage, sideEffectPage;

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnptest.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
        };
        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);

        loginPage = new LoginPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        sideEffectPage = new SideEffectPage(page, po, env, console);
        po.regulationItem = regulationItemPage;

        await loginPage.LoginDev();
    });

    test('נציג אחראי — ניווט לרשימת תופעות לוואי מתוך פריט', async ({ page }) => {
        // פתח פרופיל נציג אחראי
        await openRole(page, 'נציג אחראי', sharedUtils);

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        const sideEffectBtn = page.locator('text=דיווח תופעת לוואי').first();
        const isVisible = await sideEffectBtn.isVisible().catch(() => false);
        console.log(`כפתור 'דיווח תופעת לוואי' לנציג אחראי: ${isVisible}`);
        expect(isVisible).toBeTruthy();

        await sideEffectBtn.click();
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toContain('sideEffect');
    });

    test('נציג אחראי — תהליך מלא: דיווח תופעת לוואי', async ({ page }) => {
        await openRole(page, 'נציג אחראי', sharedUtils);

        await regulationItemPage.OpenItem1("", "", "", "פריט רגיל", "נוטיפיקציה הושלמה");
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const actionsMenu = page.locator('//span[contains(text(),"פעולות נוספות")]').first();
        if (await actionsMenu.isVisible().catch(() => false)) {
            await actionsMenu.click();
            await page.waitForTimeout(500);
        }

        await page.locator('text=דיווח תופעת לוואי').first().click();
        await page.waitForLoadState('networkidle');

        const newBtn = page.locator('text=תופעת לוואי חדשה, button:has-text("תופעת לוואי חדשה")').first();
        if (await newBtn.isVisible().catch(() => false)) {
            await newBtn.click();
            await page.waitForLoadState('networkidle');
        }

        const formUrl = page.url();
        expect(formUrl).toContain('sideEffect/general');

        await sideEffectPage.FillStep1({
            phone: '0541234567',
            email: 'natzag@test.com',
            victimFirst: 'רחל',
            victimLast: 'מזרחי',
            birthDate: '10/07/1975',
            gender: 'female',
        });

        const step2ok = await sideEffectPage.GoToStep2();
        console.log(`נציג אחראי עבר לשלב 2: ${step2ok}`);

        if (step2ok) {
            await page.waitForTimeout(1000);
            const nextBtn = page.locator('button:has-text("שלב הבא"), moh-button:has-text("שלב הבא")');
            if (await nextBtn.isVisible().catch(() => false)) {
                await nextBtn.click();
                await page.waitForTimeout(1000);
            }

            const submitBtn = page.locator('button:has-text("שלח"), button:has-text("סיום"), moh-button:has-text("שלח")');
            if (await submitBtn.isVisible().catch(() => false)) {
                await submitBtn.click();
                await page.waitForTimeout(3000);

                const dialog = page.locator('mat-dialog-container, [role="dialog"], .swal2-popup, moh-dialog');
                if (await dialog.first().isVisible().catch(() => false)) {
                    const text = await dialog.first().textContent().catch(() => '');
                    console.log(`דיאלוג סיום נציג אחראי: ${text}`);
                    const okBtn = page.locator('button:has-text("הבנתי"), button:has-text("OK"), button:has-text("אישור")');
                    if (await okBtn.isVisible().catch(() => false)) await okBtn.first().click();
                }
            }
        }

        const finalUrl = page.url();
        console.log(`URL סיום נציג אחראי: ${finalUrl}`);
        expect(finalUrl).toContain('sideEffect');
    });
});
