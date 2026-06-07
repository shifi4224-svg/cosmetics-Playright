const SharedUtils = require('./SharedUtils');
const ItemsPage = require('./Items');

class RegulationItemPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.itemsPage = new ItemsPage(page, po, env, log);

        // Locators
        this.addNew = this.page.locator('//moh-button[@class="addItemBtn"]');
        this.basicRoute = this.page.locator('//mat-radio-button[.//input[@value="basic"]] | //input[@value="basic"]');
        this.europeanRoute = this.page.locator('//mat-radio-button[.//input[@value="european"]] | //input[@value="european"]');
        this.hebrewCosmetics = this.page.locator('//input[@aria-label="שם תמרוק בעברית"]');
        this.englishCosmetics = this.page.locator('//input[@aria-label="שם תמרוק באנגלית"]');
        this.business = this.page.locator('//input[@aria-label="עסק/תאגיד"]');
        this.rPCosmetics = this.page.locator('//input[@aria-label="נציג אחראי/איש קשר"]');
        this.save = this.page.locator('//moh-button[@textkey="שמירה"]');
        this.back = this.page.locator('//moh-button[@textkey="ביטול"]');
        this.option = this.page.locator('//mat-option');
        this.okEnd = this.page.locator('//button[@class="main-button wide"] | //button[normalize-space()="אישור"] | //button[normalize-space()="OK"]').first();
        this.dialog = this.page.locator('//div[@role="dialog"]');
        this.sadeBar = this.page.locator('//*[@class="sidebar-items"]');
        this.mancal = this.page.locator('//*[contains(text(), "מנכל")]');
        this.rpRole = this.page.locator('//*[contains(text(), "נציג אחראי")]');
        this.points3 = this.page.locator('//button[@class="more-btn ng-star-inserted"]');
        this.edit = this.page.locator('//span[text()="עריכה" or text()= "תיקון נוטיפיקציה"]');

        // External locators used in ClickOnItem directly implemented to avoid 'po' dependency
        this.extOkItem = this.page.locator('//mat-row[@role="row"][1]//button[@title="אשר פריט"]');
        this.extRow = this.page.locator('//mat-row[@role="row"][1]');
        this.extCreateN = this.page.locator('//button[@class="primary-btn"]');
        this.extOkEndNarrow = this.page.locator('//button[@class="main-button narrow"] | //button[normalize-space()="OK"] | //button[normalize-space()="אישור"]');

    }

    async AddItem(nameH, nameE, euro = 0, flug = true) {
        const b = await this.sharedUtils.OpenPageMancal();
        await this.addNew.click();

        if (euro === 1) {
            await this.europeanRoute.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
                throw new Error("הכפתור 'מסלול אירופאי' לא נמצא במסך. יוצא מהפונקציה ומכשיל את הטסט.");
            });
            await this.europeanRoute.first().click({ force: true });
            await this.okEnd.click();
        } else {
            await this.basicRoute.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
                throw new Error("הכפתור 'מסלול בסיסי' לא נמצא במסך. יוצא מהפונקציה ומכשיל את הטסט.");
            });
            await this.basicRoute.first().click({ force: true });
        }

        await this.hebrewCosmetics.waitFor({ state: 'visible', timeout: 5000 });

        if (flug) {
            await this.sharedUtils.CheckCharacters(this.hebrewCosmetics, "שם פריט בעברית", "!%&*)(_+\"W-\\[]ףץת43dדA");
            await this.sharedUtils.CheckMaxLength(this.hebrewCosmetics, 100, "שם פריט בעברית");
            await this.sharedUtils.CheckCharacters(this.englishCosmetics, "שם פריט באנגלית", "!%&*)(_+\"'W-\\[],.43dA");
            await this.sharedUtils.CheckMaxLength(this.englishCosmetics, 100, "שם פריט באנגלית");
        }

        await this.hebrewCosmetics.fill(nameH);
        await this.englishCosmetics.fill(nameE);
        await this.business.click();
        await this.business.fill(b);
        await this.option.click();
        await this.rPCosmetics.click();
        await this.rPCosmetics.fill(this.env.name || "שפרה הקר");
        await this.option.click();
        await this.save.click();
        await this.dialog.waitFor({ state: 'visible', timeout: 10000 });
        const dialogText = await this.dialog.textContent();
        if (dialogText.includes("אנא נסה שוב")) {
            this.log.info("⚠️ שגיאת שרת בהוספת פריט - ממתין להמשך ידני...");
            await this.okEnd.click();
            await this.page.pause();
            await this.save.click();
            await this.dialog.waitFor({ state: 'visible', timeout: 30000 });
        }
        await this.okEnd.click();
        await this.addNew.waitFor({ state: 'visible', timeout: 10000 });
    }

    async AddItemCharTest(nameH, nameE, euro = 0) {
        const b = await this.sharedUtils.OpenPageMancal();
        await this.addNew.click();

        if (euro === 1) {
            await this.europeanRoute.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
                throw new Error("הכפתור 'מסלול אירופאי' לא נמצא במסך.");
            });
            await this.europeanRoute.first().click({ force: true });
            await this.okEnd.click();
        } else {
            await this.basicRoute.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
                throw new Error("הכפתור 'מסלול בסיסי' לא נמצא במסך.");
            });
            await this.basicRoute.first().click({ force: true });
        }

        await this.hebrewCosmetics.waitFor({ state: 'visible', timeout: 5000 });

        // בדיקת תווים בעברית + מילוי: טקסט הבסיס + התווים המאופשרים
        const hebrewAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.hebrewCosmetics, "שם פריט בעברית");
        await this.hebrewCosmetics.fill(nameH + (hebrewAllowed || ""));

        // בדיקת תווים באנגלית + מילוי: טקסט הבסיס + התווים המאופשרים
        const englishAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.englishCosmetics, "שם פריט באנגלית");
        await this.englishCosmetics.fill(nameE + (englishAllowed || ""));

        await this.business.click();
        await this.business.fill(b);
        await this.option.click();
        await this.rPCosmetics.click();
        await this.rPCosmetics.fill(this.env.name || "שפרה הקר");
        await this.option.click();
        await this.save.click();
        await this.okEnd.waitFor({ state: 'visible', timeout: 5000 });
        await this.okEnd.click();
        await this.addNew.waitFor({ state: 'visible', timeout: 10000 });
    }

    async AddMultipleItems(nameH, nameE, totalItems = 20, euro = 0) {
        this.log.info(`מתחיל להוסיף ${totalItems} פריטים`);

        for (let i = 1; i <= totalItems; i++) {
            const itemNameH = `${nameH} ${i}`;
            const itemNameE = `${nameE} ${i}`;

            this.log.info(`מוסיף פריט ${i}/${totalItems}: ${itemNameH}`);
            const b = await this.sharedUtils.OpenPageMancal();

            await this.addNew.click();
            await this.page.waitForTimeout(2000);

            if (euro === 1) {
                await this.europeanRoute.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
                    throw new Error("הכפתור 'מסלול אירופאי' לא נמצא במסך. יוצא מהפונקציה ומכשיל את הטסט.");
                });
                await this.europeanRoute.first().click({ force: true });
                await this.okEnd.click();
                this.log.info("פריט נאות");
            } else {
                await this.basicRoute.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
                    throw new Error("הכפתור 'מסלול בסיסי' לא נמצא במסך. יוצא מהפונקציה ומכשיל את הטסט.");
                });
                await this.basicRoute.first().click({ force: true });
            }

            await this.page.waitForTimeout(2000);
            await this.hebrewCosmetics.fill(itemNameH);
            await this.englishCosmetics.fill(itemNameE);
            await this.business.click();
            await this.business.fill(b);
            await this.option.click();
            await this.rPCosmetics.click();
            await this.rPCosmetics.fill(this.env.name || "שפרה הקר");
            await this.option.click();
            await this.save.click();
            await this.okEnd.click();
            await this.page.reload();

            if (this.po && this.po.properNotification && typeof this.po.properNotification.Step1 === 'function') {
                await this.po.properNotification.Step1();
            }
        }
        await this.page.reload();
        this.log.info(`הושלמה הוספת ${totalItems} פריטים!`);
    }

    async _openRowItem(row) {
        await row.click();

        if (await this.sharedUtils.isVisibleSafe(this.extCreateN, 2000)) {
            await this.extCreateN.click();
        } else if (await this.sharedUtils.isVisibleSafe(this.points3, 2000)) {
            await this.points3.click();
            await this.edit.click();
        } else {
            this.log.info('לא מצאתי איך לפתוח את הפריט');
        }
    }

    /**
 * לוחצת על פריט בשורה — אישור / דחייה / פתיחה
 *
 * @param {Locator|string|null} rowLocator  - לוקייטור השורה (ברירת מחדל: this.extRow)
 * @param {string}              action      - "approve" | "reject"
 * @param {boolean}             openAfter   - האם לפתוח את הנוטיפיקציה אחרי האישור
 */
    async ClickOnItem(rowLocator = null, action = "approve", openAfter = true) {
        console.log("ClickOnItem נקראה  151עם:", { action, openAfter }); // ← תוסיפי את זה

        try {
            const row = rowLocator
                ? (typeof rowLocator === 'string' ? this.page.locator(rowLocator) : rowLocator)
                : this.extRow;

            const approveBtn = row.locator('//button[@title="אשר פריט"]');
            const rejectItemBtn = row.locator('//button[@title="דחה פריט"]');

            const hasApproveBtn = await this.sharedUtils.isVisibleSafe(approveBtn, 2000);

            if (hasApproveBtn) {

                // ---- דחייה ----
                if (action === "reject") {
                    await rejectItemBtn.click();
                    return;
                }

                // ---- אישור ----
                if (action === "approve") {
                    await approveBtn.click();
                    await this.extOkEndNarrow.click();
                    if (!openAfter) {
                        console.log("לא נפתח נוטיפיקציה אחרי האישור, יוצא מהפונקציה. 176");
                        return; // תסריט 1: רק אישור — יוצאים
                    }
                }
                console.log("אחרי האופן 179")
                await this.extOkEndNarrow.click();

                // תסריט 2: אישור + פתיחת הנוטיפיקציה
                await this._openRowItem(row);
                return;
            }

            // ---- אין כפתור אישור — פתיחה ישירה ----
            await this._openRowItem(row);

        } catch (err) {
            this.log.error('שגיאה ב-ClickOnItem:', err.message);
        }
    }

    /**
     * פונקציית עזר פנימית — פותחת שורה לאחר לחיצה עליה
     */


    /**
     * מחפשת ופותחת פריט לפי שם / סוג / סטטוס
     *
     * @param {string}  b1           - פרמטר לפתיחת העמוד
     * @param {string}  b2           - פרמטר נוסף לפתיחת העמוד
     * @param {string|null} itemName - שם הפריט לחיפוש (אופציונלי)
     * @param {string}  itemType     - סוג הפריט לחיפוש
     * @param {string}  statusFilter - סטטוס לסינון
     * @param {string}  action       - "approve" | "reject"
     * @param {boolean} openAfter    - האם לפתוח את הנוטיפיקציה אחרי האישור
     */
    async OpenItem1(
        b1 = "",
        b2 = "",
        itemName = null,
        itemType = "פריט רגיל",
        statusFilter = 'התקבל ע"י נציג אחראי',
        action = "approve",
        openAfter = true
    ) {
        await this.po.regulationNotification.Open(b1, b2);
        // במקום waitForTimeout(2000) סתמי אחרי הפתיחה, תוסיפי:
        console.log("מחכה שהטבלה תטען אחרי פתיחת העמוד... 221");
        const rowsSelector = this.page.locator("//mat-row");
        const paginationNext = this.page.locator("//*[@class='grid_ar_prev md moh-icon page-button']");
        const page1Button = this.page.locator('(//button[@class="page-button md ng-star-inserted"])[1]');
        await rowsSelector.first().waitFor({ state: 'visible', timeout: 5000 });

        // ---- חיפוש לפי שם ----
        if (itemName) {
            this.log.info(`מחפש לפי שם: ${itemName}`);
            let currentPage = 1;

            do {
                const totalRows = await rowsSelector.count();

                for (let i = 0; i < totalRows; i++) {
                    const rowText = await rowsSelector.nth(i).textContent();

                    if (rowText.includes(itemName)) {
                        this.log.info(`נמצא לפי שם בעמוד ${currentPage}, שורה ${i + 1}`);
                        console.log("נמצא פריט לפי שם, מנסה ללחוץ עליו... 240");
                        await this.ClickOnItem(rowsSelector.nth(i), action, openAfter);
                        return true;
                    }
                }

                if (await this.itemsPage.HasNextPage(paginationNext)) {
                    // במקום waitForTimeout(2000) סתמי אחרי הפתיחה, תוסיפי:
                    await paginationNext.click();
                    await rowsSelector.first().waitFor({ state: 'visible', timeout: 5000 });

                    currentPage++;
                    await this.page.waitForTimeout(2000);
                } else {
                    this.log.warn(`לא נמצא פריט בשם: ${itemName}`);
                    break;
                }

            } while (true);
        }

        // ---- חזרה לעמוד 1 ----
        if (await this.sharedUtils.isVisibleSafe(page1Button, 1000)) {
            await page1Button.click();
            await this.page.waitForTimeout(2000);
        }

        // ---- חיפוש לפי סוג + סטטוס ----
        this.log.info(`מחפש לפי סוג: ${itemType} וסטטוס: ${statusFilter}`);
        let currentPage = 1;

        do {
            const totalRows = await rowsSelector.count();

            for (let i = 0; i < totalRows; i++) {
                const rowText = await rowsSelector.nth(i).textContent();

                if (rowText.includes(itemType) && rowText.includes(statusFilter)) {
                    this.log.info(`נמצא לפי סוג וסטטוס בעמוד ${currentPage}, שורה ${i + 1}`);
                    console.log("נמצא פריט לפי סוג וסטטוס, מנסה ללחוץ עליו... 279");
                    await this.ClickOnItem(rowsSelector.nth(i), action, openAfter);
                    return true;
                }
            }

            if (await this.itemsPage.HasNextPage(paginationNext)) {
                await paginationNext.click();
                currentPage++;
                await this.page.waitForTimeout(2000);
            } else {
                break;
            }

        } while (true);

        this.log.warn('לא נמצא פריט מתאים');
        return false;
    }

    /**
     * מחזירה את הסטטוס של פריט לפי שם
     *
     * @param {string}  itemName - שם הפריט
     * @param {string}  b1       - פרמטר לפתיחת העמוד
     * @param {boolean} yesOpen  - האם לפתוח את העמוד לפני החיפוש
     */
    async GetItemStatus(itemName, b1 = "", yesOpen = true) {
        if (yesOpen) {
            await this.sharedUtils.OpenPageMancal(b1);
            await this.page.waitForTimeout(2000);
        }

        const rowsSelector = this.page.locator("//mat-row");
        const paginationNext = this.page.locator("//*[@class='grid_ar_prev md moh-icon page-button']");
        let currentPage = 1;

        do {
            const totalRows = await rowsSelector.count();

            for (let i = 0; i < totalRows; i++) {
                const row = rowsSelector.nth(i);
                const rowText = await row.textContent();

                if (rowText.includes(itemName)) {
                    const statusCell = row.locator('mat-cell').nth(6);
                    const status = (await statusCell.textContent()).trim();
                    this.log.info(`נמצא פריט "${itemName}" בעמוד ${currentPage}, סטטוס: ${status}`);
                    return status;
                }
            }

            if (await this.itemsPage.HasNextPage(paginationNext)) {
                await paginationNext.click();
                currentPage++;
                await this.page.waitForTimeout(2000);
            } else {
                break;
            }

        } while (true);

        this.log.warn(`לא נמצא פריט בשם: ${itemName}`);
        return null;
    }
}

module.exports = RegulationItemPage;