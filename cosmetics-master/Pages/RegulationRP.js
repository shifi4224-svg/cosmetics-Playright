const DealerPage = require('./Dealer');
const SharedUtils = require('./SharedUtils');
const AddressPage = require('./Address');
const FilesPage = require('./Files');

class RegulationRPPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        this.regulationDealer = new DealerPage(page, po, env, log);
        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.address = new AddressPage(page, po, env, log);
        this.files = new FilesPage(page, po, env, log);

        this.orderButton = this.page.locator('//*[@href="/register"]');
        this.rpIshKesher3 = this.page.locator('//*[text() = "נציג אחראי/איש קשר"]');
        this.yesCorporation = this.page.locator('//*[text() = "מקושר לתאגיד נציגים אחראיים"]');
        this.noBusiness = this.page.locator('//*[text() = "לא מקושר לתאגיד נציגים אחראיים או ליצרן/יבואן"]');
        this.yesBusiness = this.page.locator('//*[text() = "מקושר ליצרן/יבואן"]');
        this.corpuration = this.page.locator('//input[@aria-label= "שם התאגיד"]');
        this.business = this.page.locator('//input[@aria-label= "עסק"]');
        this.businessId = this.page.locator('//input[@aria-label= "מספר מזהה"]');
        this.option = this.page.locator('//mat-option');
        this.doal = this.page.locator('//*[@formcontrolname="businessEmail"]//..//input');
        this.puplicEmail = this.page.locator('//*[@formcontrolname="publicationEmail"]//..//input');
        this.tazhir = this.page.locator('//*[@type = "file"]');
        this.saveSubmit = this.page.locator('//moh-button[@textkey="saveAndSend"]');
        this.dialog = this.page.locator('//*[@role ="dialog"]');
        this.okEnd = this.page.locator('//button[@class="main-button narrow"] | //button[normalize-space()="OK"] | //button[normalize-space()="אישור"]');
        this.errorFile = this.page.locator('//span[contains(text(), "לא נתמך")]');
        this.delFile = this.page.locator('//i[@class="moh-icon delete"] | //button[normalize-space()="הסרה"]');
        this.error = this.page.locator('//*[@class="error-message ng-star-inserted"]');
        this.errorFileBug = this.page.locator('//span[contains(text(),"העלאת קובץ נכשלה")]');
    }

    async isVisibleSafe(locatorOrString, timeout = 0) {
        const loc = typeof locatorOrString === 'string'
            ? this.locatorOrString
            : locatorOrString;
        const firstLoc = loc.first();
        if (timeout > 0) {
            await firstLoc.waitFor({ state: 'visible', timeout }).catch(() => { });
        }
        return await firstLoc.isVisible();
    }

    async Save(f) {
        if (f === 1) {
            this.log.info("העלאת קובץ לא תקינה, לא ניתן להמשיך");
            return;
        }
        await this.saveSubmit.click();
        try {
            await this.regulationDealer.dialog.waitFor({ state: 'visible', timeout: 30000 });
            const dialogText = await this.regulationDealer.dialog.textContent();
            this.log.info(dialogText);
            if (dialogText.includes("אנא נסה שוב")) {
                this.log.info("⚠️ שגיאת שרת - ממתין להמשך ידני...");
                await this.okEnd.click();
                await this.page.pause();
                await this.saveSubmit.click();
                await this.regulationDealer.dialog.waitFor({ state: 'visible', timeout: 30000 });
                const retryText = await this.regulationDealer.dialog.textContent();
                this.log.info(retryText);
            }
        } catch (err) {
            this.log.error("לא הופיעה הודעה בסיום הרישום: " + err.message);
        }
    }


    async RegulationToCorpuration(name = "", flug = true) {
        this.log.info("רישום נציג אחראי מקושר לתאגיד");
        let corpurationName = name;
        if (name === "") {
            corpurationName = this.sharedUtils.ReadBusiness('rp_taagid');
        }
        await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        await this.rpIshKesher3.waitFor({ state: 'visible', timeout: 10000 });
        await this.rpIshKesher3.click();
        await this.yesCorporation.click();
        await this.corpuration.click();
        await this.corpuration.fill(corpurationName);
        await this.option.click();
        if (flug) {
            await this.address.RPaddress();
            await this.FileAttachmentValidation("נציג אחראי מקושר לתאגיד");
        } else {
            await this.address.RPaddressFast();
        }
        const f = await this.files.AtachFile("", "Doc1.pdf");
        await this.Save(f);
    }

    async RegulationToBusiness(name = "", flug = true) {
        this.log.info("רישום נציג אחראי מקושר ליצרן או יבואן");
        let businessName = name;
        if (name === "") {
            businessName = this.sharedUtils.ReadBusiness('taagid');
        }
        await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        if (await this.isVisibleSafe(this.dialog, 2000)) {
            await this.okEnd.click();
            await this.orderButton.scrollIntoViewIfNeeded();
            try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        }
        await this.rpIshKesher3.waitFor({ state: 'visible', timeout: 10000 });
        await this.rpIshKesher3.click();
        await this.yesBusiness.click();
        await this.page.waitForTimeout(3000);
        await this.business.click();
        await this.business.fill(businessName);
        await this.option.click();
        await this.page.waitForTimeout(3000);
        if (flug) {
            await this.address.RPaddress();
            await this.FileAttachmentValidation("נציג אחראי מקושר ליצרן או יבואן");
        } else {
            await this.address.RPaddressFast();
        }
        const f = await this.files.AtachFile();
        await this.Save(f);
    }

    async RegulationToRP(name = "", flug = true) {
        this.log.info("רישום נציג אחראי בודד");
        const oldfilepath = this.po.dataFolder + '\\linked.txt';
        const t = await this.sharedUtils.ReadFileUpdate(oldfilepath);
        let businessName = t[1] + t[2] + name;
        await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        await this.rpIshKesher3.waitFor({ state: 'visible', timeout: 10000 });
        await this.rpIshKesher3.click();
        await this.noBusiness.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.business, "שם העסק", this.env.charBusinessName);
            await this.sharedUtils.CheckMaxLength(this.business, 100, "שם העסק");
        }
        await this.business.fill(businessName);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.businessId, "מספר מזהה", this.env.charBusinessId);
            await this.sharedUtils.CheckMaxLength(this.businessId, 9, "מספר מזהה");
        }
        await this.businessId.fill(t[0]);
        if (flug) {
            await this.address.RPaddress();
            await this.FileAttachmentValidation("נציג אחראי בודד");
        } else {
            await this.address.RPaddressFast();
        }
        const f = await this.files.AtachFile();
        await this.Save(f);
    }

    GenerateMaxCharString(allowedChars, maxLength) {
        if (!allowedChars) return 'א'.repeat(maxLength);
        let result = '';
        while (result.length < maxLength) result += allowedChars;
        return result.substring(0, maxLength);
    }

    async RegulationToRPCharTest(name = "") {
        this.log.info("רישום נציג אחראי בודד - בדיקת תווים מאופשרים");
        const oldfilepath = this.po.dataFolder + '\\linked.txt';
        const t = await this.sharedUtils.ReadFileUpdate(oldfilepath);

        await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        if (await this.isVisibleSafe(this.dialog, 2000)) {
            await this.okEnd.click();
            await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        }
        await this.rpIshKesher3.click();
        await this.noBusiness.click();

        // שם העסק — בדיקת תווים + מקסימום + מילוי מקסימום תווים מאופשרים
        const businessNameAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.business, "שם העסק");
        await this.sharedUtils.CheckMaxLength(this.business, 100, "שם העסק");
        await this.business.fill(this.GenerateMaxCharString(businessNameAllowed || "א", 100));

        // מספר מזהה — בדיקת תווים בלבד, מכניסים מספר תקין
        await this.sharedUtils.CheckCharactersAndGetAllowed(this.businessId, "מספר מזהה");
        await this.businessId.fill(t[0]);

        // כתובת
        await this.address.telefon.first().fill(this.env.telefon);
        await this.address.email.first().fill(this.env.email);
        await this.address.publicTelefon.first().fill(this.env.telefon);
        await this.address.publicEmail.first().fill(this.env.email);

        const f = await this.files.AtachFile();
        await this.Save(f);
    }

    // ניווט לשדה הקובץ של נציג אחראי בודד (ללא שמירה)
    async _NavigateToFileField() {
        const oldfilepath = this.po.dataFolder + '\\linked.txt';
        const t = await this.sharedUtils.ReadFileUpdate(oldfilepath);
        await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        const confirmBtn = this.page.locator('//button[@id="confirm-btn"]');
        if (await confirmBtn.isVisible().catch(() => false)) await confirmBtn.click();
        await this.rpIshKesher3.waitFor({ state: 'visible', timeout: 10000 });
        await this.rpIshKesher3.click();
        await this.noBusiness.click();
        await this.business.fill(t[1] + t[2]);
        await this.businessId.fill(t[0]);
        await this.address.RPaddressFast();
    }

    async FileTypeValidationTest() {
        this.log.info("בדיקת סוגי קבצים — נציג אחראי בודד");
        await this._NavigateToFileField();
        const bugs = await this.files.TestFileTypeValidation("", "קובץ");
        return bugs;
    }

    async FileNameValidationTest() {
        this.log.info("בדיקת שם קובץ (תווים + אורך) — נציג אחראי בודד");
        await this._NavigateToFileField();
        const charResult = await this.files.TestFileNameValidation("", "קובץ", "Doc1.pdf");
        const maxLenBugs = await this.files.TestFileNameMaxLength("", "קובץ", "Doc1.pdf", 90);
        return charResult.bugs + maxLenBugs;
    }

    async FileSizeValidationTest() {
        this.log.info("בדיקת גודל קובץ — נציג אחראי בודד");
        await this._NavigateToFileField();
        const bugs = await this.files.TestFileSizeValidation("", "קובץ");
        return bugs;
    }

    async FileCountValidationTest() {
        this.log.info("בדיקת כמות קבצים — נציג אחראי בודד");
        await this._NavigateToFileField();
        const bugs = await this.files.TestFileCountValidation("", "קובץ");
        return bugs;
    }

    async AllFiles() {
        const filesToTest = [
            { name: 'תמונה תקינה (png)', path: 'image.png' },
            { name: 'תמונה תקינה (jpg)', path: 'image.jpg' },
            { name: 'תמונה תקינה (jpeg)', path: 'image.jpeg' },
            { name: 'תמונה תקינה (gif)', path: 'image.gif' },
            { name: 'מסמך תקין (pdf)', path: 'Doc1.pdf' }
        ];
        for (let i = 0; i < filesToTest.length; i++) {
            this.log.info(`רישום מספר ${i}: צירוף קובץ: ${filesToTest[i].name}`);
            await this.regulationDealer.DealerFast();
            await this.RegulationFast(filesToTest[i].path);
            this.log.info("עבר בהצלחה רישום מנכל ונציג אחראי");
        }
    }

    // עזר: ניווט לטופס נציג אחראי לפי סוג — עוצר לפני מילוי פרטי התקשרות
    async _NavigateToContactSection(rpType = "בודד") {
        const confirmBtn = this.page.locator('//button[@id="confirm-btn"]');
        await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        if (await confirmBtn.isVisible().catch(() => false)) await confirmBtn.click();
        await this.rpIshKesher3.waitFor({ state: 'visible', timeout: 10000 });
        await this.rpIshKesher3.click();

        if (rpType === "בודד") {
            const oldfilepath = this.po.dataFolder + '\\linked.txt';
            const t = await this.sharedUtils.ReadFileUpdate(oldfilepath);
            await this.noBusiness.click();
            await this.business.fill(t[1] + t[2]);
            await this.businessId.fill(t[0]);
        } else if (rpType === "תאגיד") {
            await this.yesCorporation.click();
            await this.corpuration.click();
            await this.corpuration.fill(this.sharedUtils.ReadBusiness('rp_taagid'));
            await this.option.click();
        } else if (rpType === "יצרן") {
            const result = [this.sharedUtils.ReadBusiness('taagid')];
            await this.yesBusiness.click();
            await this.page.waitForTimeout(3000);
            await this.business.click();
            await this.business.fill(result[0].trim());
            await this.option.click();
            await this.page.waitForTimeout(3000);
        }
    }

    // ולידציה: שליחה ללא שום שדה פרסום — צריכה להופיע הודעת שגיאה בדיאלוג
    async PublicCheckValidation() {
        this.log.info("בדיקת ולידציה: שליחה ללא פרטי פרסום");
        await this._NavigateToContactSection("בודד");
        await this.address.RPaddressNoPublic();
        const f = await this.files.AtachFile("", "Doc1.pdf");
        await this.saveSubmit.click();
        const dialog = this.regulationDealer.dialog;
        await dialog.waitFor({ state: 'visible', timeout: 15000 });
        const text = await dialog.textContent();
        this.log.info("הודעת הדיאלוג: " + text);
        const hasError = text.includes("לפחות אחד");
        if (!hasError) this.log.warn("⚠️ טקסט הדיאלוג לא תאם — הטקסט שהתקבל: " + text);
        await this.regulationDealer.okEnd.click();
        return hasError;
    }

    // נציג אחראי בודד + טלפון לפרסום בלבד → צריך לעבור
    async PublicCheckPhoneOnly() {
        this.log.info("בדיקת פרטי פרסום: טלפון לפרסום בלבד — נציג אחראי בודד");
        await this._NavigateToContactSection("בודד");
        await this.address.RPaddressPublicPhoneOnly();
        const f = await this.files.AtachFile("", "Doc1.pdf");
        await this.Save(f);
    }

    // נציג אחראי בודד + מייל לפרסום בלבד → צריך לעבור
    async PublicCheckEmailOnly() {
        this.log.info("בדיקת פרטי פרסום: מייל לפרסום בלבד — נציג אחראי בודד");
        await this._NavigateToContactSection("בודד");
        await this.address.RPaddressPublicEmailOnly();
        const f = await this.files.AtachFile("", "Doc1.pdf");
        await this.Save(f);
    }

    // נציג אחראי בודד + כתובת לפרסום בלבד → צריך לעבור
    async PublicCheckAddressOnly() {
        this.log.info("בדיקת פרטי פרסום: כתובת לפרסום בלבד — נציג אחראי בודד");
        await this._NavigateToContactSection("בודד");
        await this.address.RPaddressPublicAddressOnly();
        const f = await this.files.AtachFile("", "Doc1.pdf");
        await this.Save(f);
    }

    async PublicCheck(locator=this.yesCorporation, name = "") {
        this.log.info("בדיקת מקטע פרטי התקשרות");
        let corpurationName = name;
        if (name === "") {
            corpurationName = this.sharedUtils.ReadBusiness('rp_taagid');
        }
        await this.orderButton.scrollIntoViewIfNeeded();
        try { await this.orderButton.click({ timeout: 5000 }); } catch { await this.orderButton.dispatchEvent("click"); }
        await this.rpIshKesher3.click();
        await locator.click();
        await this.corpuration.click();
        await this.corpuration.fill(corpurationName);
        await this.option.click();
        await this.address.telefon.first().fill(this.env.telefon);
        await this.address.email.first().fill(this.env.email);
        const f = await this.files.AtachFile("", "Doc1.pdf");
        console.log(1)
        await this.Save(f);
    }


}
module.exports = RegulationRPPage;