const SharedUtils = require('./SharedUtils');

class EditBussinesDetailsPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.sharedUtils = new SharedUtils(page, po, env, log);

        // Locators
        this.businessDetails = this.page.locator('//a[contains(text(),"פרטי העסק")]');
        this.actions = this.page.locator('//span[contains(text(),"פעולות נוספות")]');
        this.editButton = this.page.locator('//span[contains(text(),"עריכת פרטי העסק")]');
        this.businessName = this.page.locator('//input[@aria-label="עסק" or @aria-label="שם התאגיד"]');
        this.businessPhone = this.page.locator('//input[@aria-label="טלפון ראשי"]');
        this.businessEmail = this.page.locator('//input[@aria-label="דואר אלקטרוני"]');
        this.yesCorporation = this.page.locator('//*[text() = "תאגיד"]');
        this.noCorpuration = this.page.locator('//*[text() = "לא תאגיד"]');
        this.saveButton = this.page.locator('//button[normalize-space()="שמירה"]');
        this.okEnd = this.page.locator('//button[@id="confirm-btn"]');
    }

    async UpdateBusinessDetails(flug = 1, name = "דיפולט", phone = "0502222211", email = "shifra@test.com") {
        try {
            await this.sharedUtils.OpenDetails(this.editButton);
            
            if (flug) {
                await this.sharedUtils.CheckCharacters(this.businessName, "שם העסק", this.env.charBusinessName);
                await this.sharedUtils.CheckMaxLength(this.businessName, 100, "שם העסק");
                await this.sharedUtils.TestIsraeliPhoneNumberValidation(this.businessPhone);
                await this.sharedUtils.CheckCharactersEmail(this.businessEmail, "מייל", this.env.charEmail);
                await this.sharedUtils.CheckMaxEmail(this.businessEmail, 100, "מייל");
            }
            
            await this.businessName.fill(name);
            
            const oldfilepath = this.po.dataFolder + '\\RP.txt';
            await this.sharedUtils.WriteFile(oldfilepath, name);
            
            await this.businessPhone.fill(phone);
            await this.businessEmail.fill(email);
            await this.saveButton.click();

            const dialog = this.page.locator('//div[@role="dialog"] | //dialog');
            await dialog.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
            if (await dialog.isVisible()) {
                const textDialog = await dialog.textContent();
                this.log.info(textDialog);
                if (textDialog.includes('בהצלחה')) {
                    this.log.warn("נשמר");
                } else if (textDialog.includes('אנא נסה שוב')) {
                    throw new Error('TryAgain: ' + textDialog);
                } else {
                    throw new Error('UnexpectedDialog: ' + textDialog);
                }
            }
            await this.okEnd.click();
        } catch (err) {
            this.log.error("Error in UpdateBusinessDetails: ", err);
            throw err;
        }
    }
}

module.exports = EditBussinesDetailsPage;