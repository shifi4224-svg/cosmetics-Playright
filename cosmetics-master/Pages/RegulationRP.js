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
        this.okEnd = this.page.locator('//button[@class="main-button narrow"]');
        this.errorFile = this.page.locator('//span[contains(text(), "לא נתמך")]');
        this.delFile = this.page.locator('//i[@class="moh-icon delete"]');
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
        console.log(2)
        await this.page.waitForTimeout(5000);
        if (f === 1) {
            this.log.info("העלאת קובץ לא תקינה, לא ניתן להמשיך");
            console.log(3)
            return;
        }
        await this.saveSubmit.click();
        console.log(4)
        await this.page.waitForTimeout(5000);
        const dialogText = await this.regulationDealer.dialog.textContent();
        this.log.info(dialogText);
        console.log(5)
    }


    async RegulationToCorpuration(name = "") {
        this.log.info("רישום נציג אחראי מקושר לתאגיד");
        let corpurationName = name;
        if (name === "") {
            const oldfilepath = this.po.dataFolder + '\\RP2.txt';
            const result = await this.sharedUtils.ReadFile(oldfilepath);
            corpurationName = result[0].trim(); // ← שורה ראשונה בלי רווחים
        }
        await this.orderButton.click();
        await this.rpIshKesher3.click();
        await this.yesCorporation.click();
        await this.corpuration.click();
        await this.corpuration.fill(corpurationName);
        await this.option.click();
        await this.address.RPaddress();
        await this.files.TestFileTypeValidation();
        const f = await this.files.AtachFile("", "Doc1.pdf");
        console.log(1)
        await this.Save(f);
    }

    async RegulationToBusiness(flug = true, name = "") {
        this.log.info("רישום נציג אחראי מקושר ליצרן או יבואן");
        let businessName = name;
        if (name === "") {
            const oldfilepath = this.po.dataFolder + '\\RP.txt';
            const result = await this.sharedUtils.ReadFile(oldfilepath);
            businessName = result[0].trim(); // ← שורה ראשונה בלי רווחים
        }
        await this.orderButton.click();
        if (await this.isVisibleSafe(this.dialog, 2000)) {
            await this.okEnd.click();
            await this.orderButton.click();
        }
        await this.rpIshKesher3.click();
        await this.yesBusiness.click();
        await this.page.waitForTimeout(3000);
        await this.business.click();
        await this.business.fill(businessName);
        await this.option.click();
        await this.page.waitForTimeout(3000);
        await this.address.RPaddress(flug);
        if (flug) {
            await this.files.TestFileTypeValidation();
        }
        const f = await this.files.AtachFile();
        await this.Save(f);
    }

    async RegulationToRP(name = "") {
        this.log.info("רישום נציג אחראי בודד");
        const oldfilepath = this.po.dataFolder + '\\linked.txt';
        const t = await this.sharedUtils.ReadFileUpdate(oldfilepath);
        let businessName = t[1] + t[2]+name;
        await this.orderButton.click();
        await this.rpIshKesher3.click();
        await this.noBusiness.click();
        await this.sharedUtils.CheckCharacters(this.business, "שם העסק", this.env.charBusinessName);
        await this.sharedUtils.CheckMaxLength(this.business, 100, "שם העסק");
        await this.business.fill(businessName);
        await this.sharedUtils.CheckCharacters(this.businessId, "מספר מזהה", this.env.charBusinessId);
        await this.sharedUtils.CheckMaxLength(this.businessId, 9, "מספר מזהה");
        await this.businessId.fill(t[0]);
        
        await this.address.RPaddress();
        await this.files.TestFileTypeValidation();
        const f = await this.files.AtachFile();
        await this.Save(f);
    }

    async RegulationFast(nameFile = "Doc1.pdf") {
        this.log.info("רישום נציג אחראי מקושר ליצרן או יבואן");
        const oldfilepath = this.po.dataFolder + '\\RP.txt';
        const businessName = await this.sharedUtils.ReadFile(oldfilepath);
        await this.orderButton.click();
        if (await this.isVisibleSafe(this.dialog, 2000)) {
            await this.okEnd.click();
            await this.orderButton.click();
        }
        await this.rpIshKesher3.click();
        await this.yesBusiness.click();
        await this.page.waitForTimeout(3000);
        await this.business.click();
        await this.business.fill(businessName);
        await this.option.click();
        await this.page.waitForTimeout(3000);
        await this.address.RPaddressFast();
        const f = await this.files.AtachFile(nameFile, this.tazhir);
        await this.Save(f);
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
}
module.exports = RegulationRPPage;