const SharedUtils = require('./SharedUtils');

class ChageActivityBussinesPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.sharedUtils = new SharedUtils(page, po, env, log);

        // Locators
        this.businessDetails = this.page.locator('//a[contains(text(),"פרטי העסק")]');
        this.actions = this.page.locator('//span[contains(text(),"פעולות נוספות")]');
        this.changeButton = this.page.locator('//span[contains(text(),"שינוי פעילות העסק")]');
        this.yesDistributor = this.page.locator('//mat-list-option[@aria-selected="true"]//span[contains(text(), "מפיץ") ]');
        this.noDistributor = this.page.locator('//mat-list-option[@aria-selected="false"]//span[contains(text(), "מפיץ") ]');
        this.yesProper = this.page.locator('//mat-list-option[@aria-selected="true"]//span[contains(text(), "יבואן נאות") ]');
        this.noProper = this.page.locator('//mat-list-option[@aria-selected="false"]//span[contains(text(), "יבואן נאות") ]');
        this.yesImporter = this.page.locator('//mat-list-option[@aria-selected="true"]//span[contains(text(), "יבואן") and not(contains(text(), "נאות"))]');
        this.noImporter = this.page.locator('//mat-list-option[@aria-selected="false"]//span[contains(text(), "יבואן") and not(contains(text(), "נאות"))]');
        this.yesmanufactor = this.page.locator('//mat-list-option[@aria-selected="true"]//span[contains(text(), "יצרן") ]');
        this.nomanufactor = this.page.locator('//mat-list-option[@aria-selected="false"]//span[contains(text(), "יצרן") ]');
        this.yesRP = this.page.locator('//mat-list-option[@aria-selected="true"]//span[contains(text(), "נציג אחראי") ]');
        this.noRP = this.page.locator('//mat-list-option[@aria-selected="false"]//span[contains(text(), "נציג אחראי") ]');
        this.nextStep = this.page.locator('//moh-button[@styletype="primary"]');
        this.businessLicenseRequired = this.page.locator('//*[contains(text(), "ויש בידי המבקש")]');
        this.businessLicenseNotRequired = this.page.locator('//*[contains(text(), "לא נדרש רישיון עסק")]');
        this.updateProperImporterButton = this.page.locator('//span[contains(text(),"עדכון יבואן נאות")]');
        this.properImporterDeclaration1 = this.page.locator('//*[contains(text(), "התייחסות")]');
        this.properImporterDeclaration2 = this.page.locator('//*[contains(text(), "ליישם")]');
        this.properImporterDeclaration3 = this.page.locator('//*[contains(text(), "לאחסן")]');
        this.accuracyOfData1 = this.page.locator('//*[contains(text(), "לא בוטל")]//..//input[@type="checkbox"]');
        this.accuracyOfData2 = this.page.locator('//*[contains(text(), "הפרטים ")]//..//input[@type="checkbox"]');
        this.saveButton = this.page.locator('//button[@type="submit"]');
        this.okEnd = this.page.locator('//button[@id="confirm-btn"]');
        this.dialog = this.page.locator('//div[@role="dialog"]');
        this.errDialogDel = this.page.locator('//div[@role="dialog"]//*[contains(text()," להסיר סוג עסק")]');
        this.errDialogNo = this.page.locator('//div[@role="dialog"]//*[contains(text(),"לא השתנה")]');
    }

    async ChangeActivity(value = "יבואן") {
        try {
            const values = Array.isArray(value) ? value : [value];
            await this.sharedUtils.OpenDetails(this.changeButton);
            let allWereSelected = true;

            for (const v of values) {
                const selectedSelector = `//mat-list-option[@aria-selected="true"]//span[contains(text(), "${v}")]`;
                if (!(await this.sharedUtils.isVisibleSafe(selectedSelector, 2000))) {
                    allWereSelected = false;
                    break;
                }
            }

            if (allWereSelected) {
                this.log.info(`⚠️ כל הערכים כבר היו מסומנים - לא מבצע שמירה`);
                return;
            }
            for (const v of values) {
                const clickSelector = `//mat-list-option[.//span[contains(text(), "${v}")]]`;
                const selectedSelector = `//mat-list-option[@aria-selected="true"]//span[contains(text(), "${v}")]`;
                const isSelected = await this.sharedUtils.isVisibleSafe(selectedSelector, 2000);

                await this.page.locator(clickSelector).click();
                await this.page.waitForTimeout(1000);

                if (isSelected) {
                    // היה מסומן - מצפים לשגיאה
                    if (await this.sharedUtils.isVisibleSafe(this.dialog, 2000)) {
                        this.log.info(`✅ "${v}" היה מסומן והופיע דיאלוג שגיאה כצפוי`);
                        await this.okEnd.click();
                    } else {
                        this.log.error(`❌ "${v}" היה מסומן אך לא הופיע דיאלוג שגיאה`);
                    }
                } else {
                    // לא היה מסומן - מצפים שייבחר
                    if (await this.sharedUtils.isVisibleSafe(selectedSelector, 2000)) {
                        this.log.info(`✅ "${v}" נבחר בהצלחה`);
                    } else {
                        this.log.error(`❌ "${v}" לא נבחר לאחר הלחיצה`);
                    }
                }
            }
            await this.nextStep.click();
            await this.businessLicenseRequired.click();
            if (await this.sharedUtils.isVisibleSafe(this.properImporterDeclaration1, 1000)) {
                await this.properImporterDeclaration1.click();
                await this.properImporterDeclaration2.click();
                await this.properImporterDeclaration3.click();
            }
            await this.accuracyOfData1.click();
            await this.accuracyOfData2.click();
            await this.saveButton.click();
            
            await this.dialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            if (await this.dialog.isVisible()) {
                let textDialog = await this.dialog.textContent();
                this.log.info(textDialog);
            }
            await this.okEnd.click();
            this.log.warn("נשמר");
            await this.page.waitForTimeout(2000);
        } catch (err) {
            this.log.error("Error in Change Activity Bussines: ", err);
            throw err;
        }
    }

    async NoChange() {
        try {
            await this.sharedUtils.OpenPageMancal();
            await this.businessDetails.click();
            await this.actions.click();
            await this.changeButton.click();
            await this.nextStep.click();
            await this.businessLicenseNotRequired.click();
            await this.accuracyOfData1.click();
            await this.accuracyOfData2.click();
            await this.saveButton.click();
            
            if (await this.dialog.isVisible()) {
                this.log.info(await this.dialog.textContent());
            }
            
            await this.okEnd.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            if (await this.sharedUtils.isVisibleSafe(this.errDialogNo, 2000)) {
                this.log.info("errDialogNo הופיע כצפוי עבור אין שינוי");
            }
            await this.page.waitForTimeout(2000);
        } catch (err) {
            this.log.error("Error in No Change Activity Bussines: ", err);
            throw err;
        }
    }
}

module.exports = ChageActivityBussinesPage;