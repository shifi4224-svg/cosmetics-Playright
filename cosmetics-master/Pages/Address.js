class AddressPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        // Locators
        this.telefon = page.locator('//input[@aria-label="טלפון ראשי"]');
        this.areaCode = page.locator('//input[@placeholder="קידומת"]');
        this.code050 = page.locator('//*[contains(text(), "050")]//..//span');
        this.doal = page.locator('//*[contains(text(), "דואר אלקטרוני")]//..//..//input');
        this.city = page.locator('//input[@aria-label="עיר/יישוב"]');
        this.nameCity = page.locator('//*[contains(text(), "שחר")]//..//span');
        this.street = page.locator('//*[contains(text(), "רחוב")]//..//..//input');
        this.nameStreet = page.locator('//span[contains(text(), "הבציר")]');
        this.houseNumber = page.locator('//input[@aria-label="מספר בית"]');
        this.zipCode = page.locator('//input[@aria-label="מיקוד"]');
        this.addressNotes = page.locator('//input[@aria-label="הערות לכתובת"]');
        this.mailBox = page.locator('//input[@aria-label="ת.ד."]');
        this.errorEmail = page.locator('//*[contains(text(), "כתובת דואר אלקטרוני לא חוקית")]');
        this.errorTelefonNo = page.locator('//span[contains(text(), "מספר הטלפון אינו תקין")]');
        this.errorTelefonNum = page.locator('//span[contains(text(), "יש להזין ספרות בלבד")]');
        this.errorTelefonArea = page.locator('//span[contains(text(), "קידומת לא תקינה")]');
        this.error = page.locator('//*[@class="error-message ng-star-inserted"]');
        this.addressType = page.locator('//input[@aria-label="סוג כתובת"]');
        this.otherAddress = page.locator('//*[text() = " אחר "]');
        this.productionSiteAddress = page.locator('//*[text() = " כתובת אתר הייצור "]');
        this.officeAddress = page.locator('//*[text() = " כתובת משרד "]');
        this.otherAddressType = page.locator('//input[(@aria-label="סוג כתובת")and not(@aria-haspopup="listbox")]');
        this.publicTelefon = page.locator('//*[@formcontrolname="publicationPhone"]//..//input[@aria-label="טלפון ראשי"]');
        this.email = page.locator('//input[@aria-label="דואר אלקטרוני"]');
        this.publicEmail = page.locator('//*[@formcontrolname="publicationEmail"]//..//input');
    }

    // מתודת עזר להמתנה ובדיקת נראות אלמנט שתומכת ב-Locators וגם במחרוזות
    async isVisibleSafe(locatorOrString, timeout = 0) {
        const loc = typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)
            : locatorOrString;
        const firstLoc = loc.first();
        if (timeout > 0) {
            await firstLoc.waitFor({ state: 'visible', timeout }).catch(() => {});
        }
        return await firstLoc.isVisible();
    }

    async AddAddress(checks = true) {
        try {
            if (checks) {
                await this.po.TestIsraeliPhoneNumberValidation();
            }
            
            // שימוש ב-first() כדי למנוע קריסה אם יש כמה שדות טלפון/מייל פתוחים במסך
            await this.telefon.first().fill(this.env.telefon);
            
            if (checks) {
                await this.po.CheckCharactersEmail(this.email, "מייל", this.env.charEmail);
                await this.po.CheckMaxEmail(this.email, 100, "מייל");
            }
            
            await this.email.first().fill(this.env.email);
            
            try {
                // בפליירייט עדיף להקליד חלק מהטקסט כדי לסנן את הרשימה הנפתחת (Autocomplete)
                await this.city.first().fill("שחר");
                await this.nameCity.first().waitFor({ state: 'visible', timeout: 5000 });
                await this.nameCity.first().click();
                
                await this.street.first().fill("הבציר");
                await this.nameStreet.first().waitFor({ state: 'visible', timeout: 5000 });
                await this.nameStreet.first().click();
            } catch (err) {
                this.log.error('תקלה בבחירת עיר או רחוב מהרשימה', err);
                throw err; // חייבים לזרוק את השגיאה כדי שהטסט ידווח על כשל ולא יסיים בשקט!
            }
            
            await this.houseNumber.first().fill(this.env.houseNumber);
            
            if (checks) {
                await this.po.CheckCharacters(this.addressNotes, "הערות לכתובת", this.env.charAddressNotes);
                await this.po.CheckMaxLength(this.addressNotes, 100, "הערות לכתובת");
            }
            
            await this.addressNotes.first().fill("ארר"); 
            await this.page.waitForTimeout(3000);
            
            await this.addressType.first().click();
            await this.otherAddress.first().waitFor({ state: 'visible' });
            await this.otherAddress.first().click();
            
            if (checks) {
                if (!(await this.isVisibleSafe(this.otherAddressType, 1000))) {
                    this.log.error('סוג כתובת אחר לא הופיע, מנסה שוב');
                    await this.addressType.first().click();
                    await this.otherAddress.first().waitFor({ state: 'visible' });
                    await this.otherAddress.first().click();
                }
                await this.po.CheckCharacters(this.otherAddressType, "סוג כתובת אחר", this.env.charOtherAddress);
                await this.po.CheckMaxLength(this.otherAddressType, 400, "סוג כתובת אחר");
            }
            
            await this.otherAddressType.first().fill("עעע"); 
            
        } catch (err) {
            this.log.error('AddAddress error', err);
            throw err;
        }
    }

    async AddressNoChecks() {
        return await this.AddAddress(false);
    }

    async RPaddress() {
        await this.po.TestIsraeliPhoneNumberValidation();
        await this.telefon.first().fill(this.env.telefon);
        
        await this.po.CheckCharactersEmail(this.email, "מייל", this.env.charEmail);
        await this.po.CheckMaxEmail(this.email, 100, "מייל");
        await this.email.first().fill(this.env.email);
        
        await this.po.TestIsraeliPhoneNumberValidation(this.publicTelefon);
        await this.publicTelefon.first().fill(this.env.telefon);
        
        await this.po.CheckCharactersEmail(this.publicEmail, "מייל לפרסום", this.env.charEmail);
        await this.po.CheckMaxEmail(this.publicEmail, 100, "מייל לפרסום");
        await this.publicEmail.first().fill(this.env.email);
    }

    async RPaddressFast() {
        await this.telefon.first().fill(this.env.telefon);
        await this.email.first().fill(this.env.email);
        await this.publicTelefon.first().fill(this.env.telefon);
        await this.publicEmail.first().fill(this.env.email);
    }
}

module.exports = AddressPage;