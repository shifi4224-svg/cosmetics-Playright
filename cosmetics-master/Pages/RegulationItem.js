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
        this.basicRoute = this.page.locator('//input[@value="basic"]');
        this.europeanRoute = this.page.locator('//input[@value="european"]');
        this.hebrewCosmetics = this.page.locator('//input[@aria-label="שם תמרוק בעברית"]');
        this.englishCosmetics = this.page.locator('//input[@aria-label="שם תמרוק באנגלית"]');
        this.business = this.page.locator('//input[@aria-label="עסק/תאגיד"]');
        this.rPCosmetics = this.page.locator('//input[@aria-label="נציג אחראי/איש קשר"]');
        this.save = this.page.locator('//moh-button[@textkey="שמירה"]');
        this.back = this.page.locator('//moh-button[@textkey="ביטול"]');
        this.option = this.page.locator('//mat-option');
        this.okEnd = this.page.locator('//button[@class="main-button wide"]');
        this.sadeBar = this.page.locator('//*[@class="sidebar-items"]');
        this.mancal = this.page.locator('//*[contains(text(), "מנכל")]');
        this.rpRole = this.page.locator('//*[contains(text(), "נציג אחראי")]');
        this.points3 = this.page.locator('//button[@class="more-btn ng-star-inserted"]');
        this.edit = this.page.locator('//span[text()="עריכה" or text()= "תיקון נוטיפיקציה"]');
        
        // External locators used in ClickOnItem directly implemented to avoid 'po' dependency
        this.extOkItem = this.page.locator('//mat-row[@role="row"][1]//button[@title="אשר פריט"]');
        this.extRow = this.page.locator('//mat-row[@role="row"][1]');
        this.extCreateN = this.page.locator('//button[@class="primary-btn"]');
        this.extOkEndNarrow = this.page.locator('//button[@class="main-button narrow"]');
    }

    async AddItem(nameH, nameE, euro = 0, flug = true) {
        const b = await this.sharedUtils.OpenPageMancal();
        await this.addNew.click();
        
        if (euro === 1) {
            await this.europeanRoute.click();
            await this.okEnd.click();
        } else {
            await this.basicRoute.click();
        }
        
        await this.page.waitForTimeout(2000);
        
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
        await this.rPCosmetics.fill(this.env.name || "שם נציג דמה");
        await this.option.click();
        await this.save.click();
        await this.okEnd.click();
        await this.page.reload();
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
                await this.europeanRoute.click();
                await this.okEnd.click();
                this.log.info("פריט נאות");
            } else {
                await this.basicRoute.click();
            }

            await this.page.waitForTimeout(2000);
            await this.hebrewCosmetics.fill(itemNameH);
            await this.englishCosmetics.fill(itemNameE);
            await this.business.click();
            await this.business.fill(b);
            await this.option.click();
            await this.rPCosmetics.click();
            await this.rPCosmetics.fill(this.env.name || "שם נציג דמה");
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

    async ClickOnItem(rowLocator = null) {
        try {
            if (await this.sharedUtils.isVisibleSafe(this.extOkItem, 2000)) {
                await this.extOkItem.click();
                await this.extOkEndNarrow.click();
            }
            
            if (rowLocator) {
                const loc = typeof rowLocator === 'string' ? this.page.locator(rowLocator) : rowLocator;
                await loc.click();
            } else {
                await this.extRow.click();
            }
            
            if (await this.sharedUtils.isVisibleSafe(this.extCreateN, 2000)) {
                await this.extCreateN.click();
            } else if (await this.sharedUtils.isVisibleSafe(this.points3, 2000)) {
                await this.points3.click();
                await this.edit.click();
            } else {
                this.log.info("לא מצאתי איך לפתוח");
            }

        } catch (err) { 
            this.log.error('no aprove:', err.message); 
        }
    }

    async OpenItem1(b1 = "", b2 = "", itemName = null, itemType = "פריט רגיל", statusFilter = 'התקבל ע"י נציג אחראי', yesOpen = true) {
        if (yesOpen && this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.Open(b1, b2);
            await this.page.waitForTimeout(2000);
        }
        
        const rowsSelector = this.page.locator("//mat-row");
        const paginationNext = this.page.locator("//*[@class='grid_ar_prev md moh-icon page-button']");
        const page1 = this.page.locator('(//button[@class="page-button md ng-star-inserted"])[1]');

        // ---- חיפוש לפי שם ----
        if (itemName) {
            this.log.info(`🔍 מחפש לפי שם: ${itemName}`);
            let currentPage = 1;

            do {
                const totalRows = await rowsSelector.count();

                for (let i = 1; i <= totalRows; i++) {
                    const rowText = await rowsSelector.nth(i - 1).textContent();

                    if (rowText.includes(itemName)) {
                        this.log.info(`✅ נמצא לפי שם בעמוד ${currentPage}, שורה ${i}`);
                        await this.ClickOnItem(rowsSelector.nth(i - 1));
                        return true;
                    }
                }

                if (await this.itemsPage.HasNextPage(paginationNext)) {
                    await paginationNext.click();
                    currentPage++;
                    await this.page.waitForTimeout(2000);
                } else {
                    this.log.info(`⚠️ לא נמצא פריט בשם: ${itemName}`);
                    break;
                }

            } while (true);
        }

        // ---- חזרה לעמוד 1 ----
        if (await this.sharedUtils.isVisibleSafe(page1, 1000)) {
            await page1.click();
            await this.page.waitForTimeout(2000);
        }
        
        // ---- חיפוש לפי סוג + סטטוס ----
        this.log.info(`🔍 מחפש לפי סוג: ${itemType} וסטטוס: ${statusFilter}`);
        let currentPage = 1;

        do {
            const totalRows = await rowsSelector.count();

            for (let i = 1; i <= totalRows; i++) {
                const rowText = await rowsSelector.nth(i - 1).textContent();

                if (rowText.includes(itemType) && rowText.includes(statusFilter)) {
                    this.log.info(`✅ נמצא לפי סוג וסטטוס בעמוד ${currentPage}, שורה ${i}`);
                    await this.ClickOnItem(rowsSelector.nth(i - 1));
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

        // ---- לא נמצא ----
        this.log.warn(`❌ לא נמצא פריט מתאים`);
        return false;
    }
}

module.exports = RegulationItemPage;