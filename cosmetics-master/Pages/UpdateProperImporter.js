const SharedUtils = require('./SharedUtils');
const DealerPage = require('./Dealer');

class UpdateProperImporterPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.regulationDealer = new DealerPage(page, po, env, log);

        // Locators
        this.businessDetails = this.page.locator('//a[contains(text(),"פרטי העסק")]');
        this.actions = this.page.locator('//span[contains(text(),"פעולות נוספות")]');
        this.updateProperImporterButton = this.page.locator('//span[contains(text(),"עדכון יבואן נאות")]');
        this.properImporterDeclaration1 = this.page.locator('//*[contains(text(), "התייחסות")]//..//input[@type="checkbox"]');
        this.properImporterDeclaration2 = this.page.locator('//*[contains(text(), "ליישם")]//..//input[@type="checkbox"]');
        this.properImporterDeclaration3 = this.page.locator('//*[contains(text(), "לאחסן")]//..//input[@type="checkbox"]');
        this.accuracyOfData1 = this.page.locator('//*[contains(text(), "לא בוטל")]//..//input[@type="checkbox"]');
        this.accuracyOfData2 = this.page.locator('//*[contains(text(), "הפרטים ")]//..//input[@type="checkbox"]');
        this.saveButton = this.page.locator('//button[@type="submit"]');
        this.okEnd = this.page.locator('//button[@id="confirm-btn"]');
    }

    async Update() {
        try {
            if (!(await this.sharedUtils.OpenDetails(this.updateProperImporterButton))) { 
                return; 
            }
            await this.properImporterDeclaration1.click();
            await this.page.waitForTimeout(2000);
            await this.properImporterDeclaration2.click();
            await this.page.waitForTimeout(2000);
            await this.properImporterDeclaration3.click();
            await this.accuracyOfData1.click();
            await this.accuracyOfData2.click();
            await this.saveButton.click();
            
            await this.regulationDealer.dialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            if (await this.regulationDealer.dialog.isVisible()) {
                let textDialog = await this.regulationDealer.dialog.textContent();
                this.log.info(textDialog);
            }
            
            await this.okEnd.click();
        } catch (err) {
            this.log.error("Error in Update Proper Importer: ", err);
            throw err;
        }
    }
}

module.exports = UpdateProperImporterPage;