require('dotenv').config();
const { test } = require('@playwright/test');
const path = require('path');

const LoginPage = require('../Pages/LoginPage');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationItemPage = require('../Pages/RegulationItem');
const RegulationNotificationPage = require('../Pages/RegulationNotification');

// פונקציית עזר: מחזירה כמות גוונים קיימים מהפגינטור
async function getExistingShades(page) {
    const paginatorText = await page.locator('//div[@aria-live="polite"]').first().textContent().catch(() => '');
    const match = paginatorText.match(/(\d+)\s*תוצאות/);
    return match ? parseInt(match[1]) : 0;
}

// פונקציית עזר: לוגיקה משותפת לכל הטסטים
async function runShadesLoop({ page, regulationNotificationPage, rama2, rama3, itemNumber, iterations, isProper, stepsAfterShades, roundLabel, actionText = 'תיקון נוטיפיקציה' }) {
    await regulationNotificationPage.Open(rama2, rama3);

    for (let round = 1; round <= iterations; round++) {
        console.log(`\n--- ${roundLabel} מחזור ${round}/${iterations} ---`);

        // חיפוש פריט בטבלה
        const rows = page.locator('//mat-row');
        await rows.first().waitFor({ state: 'visible', timeout: 10000 });
        const total = await rows.count();
        let found = false;

        for (let i = 0; i < total; i++) {
            const rowText = await rows.nth(i).textContent();
            if (rowText.includes(itemNumber)) {
                console.log(`נמצא פריט ${itemNumber} בשורה ${i + 1}`);
                await rows.nth(i).click();
                found = true;
                break;
            }
        }

        if (!found) {
            console.error(`פריט ${itemNumber} לא נמצא`);
            await page.pause();
            break;
        }

        // פתיחת הנוטיפיקציה
        if (await regulationNotificationPage.sharedUtils.isVisibleSafe(regulationNotificationPage.regulationItemPage.extCreateN, 2000)) {
            await regulationNotificationPage.regulationItemPage.extCreateN.click();
        } else if (await regulationNotificationPage.sharedUtils.isVisibleSafe(regulationNotificationPage.regulationItemPage.points3, 2000)) {
            await regulationNotificationPage.regulationItemPage.points3.click();
            await page.locator(`//span[text()="${actionText}"]`).click();
        }

        // שלב הבא לשלב פרטי התמרוק
        await regulationNotificationPage.nextStep.click();

        // בדיקה כמה גוונים יש כבר
        const existingShades = await getExistingShades(page);
        console.log(`גוונים קיימים: ${existingShades}`);

        if (existingShades >= 150) {
            console.log('הגיע ל-150 גוונים - מסיים');
            break;
        }

        const shadesToAdd = Math.min(5, 150 - existingShades);
        console.log(`מוסיף ${shadesToAdd} גוונים`);

        await regulationNotificationPage.AddXSades(shadesToAdd, shadesToAdd, "ירוק", false, isProper);

        for (let s = 0; s < stepsAfterShades; s++) {
            await regulationNotificationPage.nextStep.click();
            await page.waitForTimeout(500);
        }

        await regulationNotificationPage.saveSubmit.click();

        if (await regulationNotificationPage.sharedUtils.isVisibleSafe(regulationNotificationPage.noteEdit, 3000)) {
            await regulationNotificationPage.noteEdit.fill(`עדכון גוונים ${roundLabel} מחזור ${round}`);
            await regulationNotificationPage.manufSave.click();
        }

        await regulationNotificationPage.dialog.waitFor({ state: 'visible', timeout: 30000 });
        const dialogText = await regulationNotificationPage.dialog.textContent();
        console.log(`תוצאה מחזור ${round}: ${dialogText}`);

        if (dialogText.includes('בהצלחה')) {
            console.log(`מחזור ${round} הצליח`);
            await regulationNotificationPage.okEnd.click();
            await page.waitForTimeout(2000);
        } else {
            console.error(`מחזור ${round} נכשל: ${dialogText}`);
            await page.pause();
            await regulationNotificationPage.okEnd.click();
            break;
        }
    }
}

test.describe('בדיקות גוונים', () => {
    let po;
    let env;
    let loginPage;
    let regulationItemPage;
    let regulationNotificationPage;

    test.setTimeout(3600000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charNotification: 'W-,ף.ץת43dדA',
            charBusinessId: '0123456789',
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        loginPage = new LoginPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        po.regulationNotification = regulationNotificationPage;

        await loginPage.LoginDev();
    });

    test('בדיקת גוונים בנוטיפיקציה נאותה לפני 72 שעות', async ({ page }) => {
        await runShadesLoop({
            page,
            regulationNotificationPage,
            rama2: 'עסק אוטומציה 129תאגיד E2E 3587',
            rama3: 'עסק אוטומציה 129תאגיד E2E 3587',
            itemNumber: '3871',
            iterations: 30,
            isProper: true,
            stepsAfterShades: 2,
            roundLabel: 'נאות לפני 72 שעות',
        });
    });

    test('בדיקת גוונים בנוטיפיקציה רגילה לפני 72 שעות', async ({ page }) => {
        await runShadesLoop({
            page,
            regulationNotificationPage,
            rama2: 'עסק אוטומציה 129תאגיד E2E 3587',
            rama3: 'עסק אוטומציה 129תאגיד E2E 3587',
            itemNumber: '3871',
            iterations: 30,
            isProper: false,
            stepsAfterShades: 4,
            roundLabel: 'רגיל לפני 72 שעות',
        });
    });

    test('בדיקת גוונים בנוטיפיקציה נאותה אחרי 72 שעות', async ({ page }) => {
        await runShadesLoop({
            page,
            regulationNotificationPage,
            rama2: 'שפרה הקר נציג 7',
            rama3: 'עסק 66 שינוי',
            itemNumber: '3383',
            iterations: 30,
            isProper: true,
            stepsAfterShades: 2,
            roundLabel: 'נאות אחרי 72 שעות',
            actionText: 'עריכה',
        });
    });

    test('בדיקת גוונים בנוטיפיקציה רגילה אחרי 72 שעות', async ({ page }) => {
        await runShadesLoop({
            page,
            regulationNotificationPage,
            rama2: 'שפרה הקר נציג 7',
            rama3: 'עסק 66 שינוי',
            itemNumber: '3383',
            iterations: 30,
            isProper: false,
            stepsAfterShades: 4,
            roundLabel: 'רגיל אחרי 72 שעות',
            actionText: 'עריכה',
        });
    });
});
