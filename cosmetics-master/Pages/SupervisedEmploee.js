const SharedUtils = require('./SharedUtils');

class SupervisedEmploeePage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.sharedUtils = new SharedUtils(page, po, env, log);

        // Locators
        this.businessDetails = this.page.locator('//a[contains(text(),"פרטי העסק")]');
        this.actions = this.page.locator('//span[contains(text(),"פעולות נוספות")]');
        this.addSupervisedEmployee = this.page.locator('//span[contains(text(),"הוספת עובד ממונה")]');
        this.toggle = this.page.locator('//mat-slide-toggle');
        this.firstName = this.page.locator('//input[@aria-label="שם פרטי"]');
        this.lastName = this.page.locator('//input[@aria-label="שם משפחה"]');
        this.idNumber = this.page.locator('//input[@aria-label="ת.ז"]');
        this.telefonNumber = this.page.locator('//input[@aria-label="מספר טלפון"]');
        this.emailAddress = this.page.locator('//input[@aria-label="דואר אלקטרוני"]');
        this.checkBox = this.page.locator('//input[@aria-label="כל המידע והפעולות שהעובד מטעמי יבצע הן על דעתי והסכמתי"]');
        this.saveButton = this.page.locator('//span[text()="שמור ושלח"]');
        this.okEnd = this.page.locator('//button[@id="confirm-btn"]');
        this.points3 = this.page.locator('//*[@class="dots"]');
        this.editContact = this.page.locator('//span[text()="עריכת איש קשר"]');
        this.disconnectContact = this.page.locator('//span[text()="ניתוק איש קשר"]');
        this.dialog = this.page.locator('//div[@role="dialog"]');
    }

    async AddSupervisedEmployee(firstName = "חיים", lastName = "כהן", idNumber = "123456782", telefonNumber = "0533212321", emailAddress = null) {
        if (!emailAddress) emailAddress = this.env.email;
        
        await this.sharedUtils.OpenDetails(this.addSupervisedEmployee);
        await this.toggle.click();
        //await this.sharedUtils.CheckCharacters(this.firstName, "שם פרטי", this.env.charName);
        //await this.sharedUtils.CheckMaxLength(this.firstName, 50, "שם פרטי");
        await this.firstName.fill(firstName);
        //await this.sharedUtils.CheckCharacters(this.lastName, "שם משפחה", this.env.charName);
        //await this.sharedUtils.CheckMaxLength(this.lastName, 50, "שם משפחה");
        await this.lastName.fill(lastName);
        //await this.sharedUtils.CheckCharacters(this.idNumber, "ת.ז", this.env.charBusinessId);
        //await this.sharedUtils.CheckMaxLength(this.idNumber, 9, "ת.ז");
        await this.idNumber.fill(idNumber);
        //await this.sharedUtils.TestIsraeliPhoneNumberValidation(this.telefonNumber);
        await this.telefonNumber.fill(telefonNumber);
        //await this.sharedUtils.CheckCharactersEmail(this.emailAddress, "דואר אלקטרוני", this.env.charEmail);
        //await this.sharedUtils.CheckMaxEmail(this.emailAddress, 100, "דואר אלקטרוני");
        await this.emailAddress.fill(emailAddress);
        await this.checkBox.click();
        await this.saveButton.click();
        await this.okEnd.click();
    }

    async EditSupervisedEmployee(firstName, lastName, telefonNumber, emailAddress) {
        await this.businessDetails.click();
        await this.points3.click();
        await this.editContact.click();
        await this.sharedUtils.CheckCharacters(this.firstName, "שם פרטי", this.env.charName);
        await this.sharedUtils.CheckMaxLength(this.firstName, 50, "שם פרטי");
        await this.firstName.fill(firstName);
        await this.sharedUtils.CheckCharacters(this.lastName, "שם משפחה", this.env.charName);
        await this.sharedUtils.CheckMaxLength(this.lastName, 50, "שם משפחה");
        await this.lastName.fill(lastName);
        await this.sharedUtils.TestIsraeliPhoneNumberValidation(this.telefonNumber);
        await this.telefonNumber.fill(telefonNumber);
        await this.sharedUtils.CheckCharactersEmail(this.emailAddress, "דואר אלקטרוני", this.env.charEmail);
        await this.sharedUtils.CheckMaxEmail(this.emailAddress, 100, "דואר אלקטרוני");
        await this.emailAddress.fill(emailAddress);
        await this.checkBox.click();
        await this.saveButton.click();
        await this.okEnd.click();
    }

    async DisconnectSupervisedEmployee() {
        await this.businessDetails.click();
        await this.points3.click();
        await this.disconnectContact.click();
        await this.dialog.waitFor({ state: 'visible' });
        await this.okEnd.click();
        await this.dialog.waitFor({ state: 'visible' });
        await this.okEnd.click();
    }
}

module.exports = SupervisedEmploeePage;
