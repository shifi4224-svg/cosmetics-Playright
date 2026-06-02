const DealerPage = require('./Dealer');
const SharedUtils = require('./SharedUtils');
const AddressPage = require('./Address');

class RegulationTaagidRPPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.regulationDealer = new DealerPage(page, po, env, log);
        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.address = new AddressPage(page, po, env, log);

        this.orderButton = this.page.locator('//*[@href="/register"]');
        this.tagidRP2 = this.page.locator('//*[text() = "רישום תאגיד נציג אחראי"]');
        this.nextStep = this.page.locator('//moh-button[@class="next-btn ng-star-inserted"]');
        this.businessName = this.page.locator('//input[@aria-label="שם התאגיד"]');
        this.businessId = this.page.locator('//input[@aria-label="ח.פ."]');
        this.saveSubmit = this.page.locator('//moh-button[@type="submit"]');
        this.okEnd = this.page.locator('//button[@class="main-button narrow"]');
    }

    async LoginToDeaker(flug = true, name = "", idd = "") {
        try {
            console.log("רישום תאגיד נציג אחראי");
            const t = await this.regulationDealer.ReadIdName(idd, name);
            await this.orderButton.click();
            await this.tagidRP2.waitFor({ state: 'visible' });
            await this.tagidRP2.click();

            if (flug) {
                await this.sharedUtils.CheckCharacters(this.businessName, "שם העסק", this.env.charBusinessNameRP);
                await this.sharedUtils.CheckMaxLength(this.businessName, 100, "שם העסק");
                //await this.sharedUtils.CheckCharacters(this.businessId, "מספר מזהה", this.env.charBusinessId);
                await this.sharedUtils.CheckMaxLength(this.businessId, 9, "מספר מזהה");
            }

            await this.businessName.fill(t[1]);
            await this.businessId.fill(t[0]);
            await this.page.waitForTimeout(2000);

            await this.nextStep.click();
            await this.address.AddAddress(flug);
            await this.saveSubmit.click();

            await this.page.waitForTimeout(3000);

            if (await this.regulationDealer.dialog.isVisible()) {
                let dialogText = await this.regulationDealer.dialog.textContent();
                console.log(dialogText);
                if (dialogText.includes("בהצלחה")) {
                    let oldfilepath2 = this.po.dataFolder + '\\RP2.txt';
                    await this.sharedUtils.WriteFile(oldfilepath2, t[1]);
                }
                await this.page.waitForTimeout(3000);
            }
        } catch (err) {
            this.log.error('LoginToDeaker error', err);
            throw err;
        }
    }

    async LoginToDeakerCharTest(name = "") {
        this.log.info("רישום תאגיד נציג אחראי - בדיקת תווים מאופשרים");
        const t = await this.regulationDealer.ReadIdName("", name || "בדיקת תווים");

        await this.orderButton.click();
        await this.tagidRP2.waitFor({ state: 'visible' });
        await this.tagidRP2.click();

        // שם התאגיד — בדיקת תווים + מילוי שם בסיס + תווים מאופשרים
        const businessNameAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.businessName, "שם התאגיד");
        await this.businessName.fill(t[1] + (businessNameAllowed || ""));

        // ח.פ. — בדיקת תווים בלבד, מכניסים מספר תקין
        await this.sharedUtils.CheckCharactersAndGetAllowed(this.businessId, "ח.פ.");
        await this.businessId.fill(t[0]);

        await this.page.waitForTimeout(2000);
        await this.nextStep.click();

        // כתובת — טלפון ומייל בערכים תקינים, הערות וסוג כתובת בתווים מאופשרים
        await this.address.telefon.first().fill(this.env.telefon);
        await this.address.email.first().fill(this.env.email);

        try {
            await this.address.city.first().fill("שחר");
            await this.address.nameCity.first().waitFor({ state: 'visible', timeout: 5000 });
            await this.address.nameCity.first().click();
            await this.address.street.first().fill("הבציר");
            await this.address.nameStreet.first().waitFor({ state: 'visible', timeout: 5000 });
            await this.address.nameStreet.first().click();
        } catch (err) {
            this.log.error('תקלה בבחירת עיר/רחוב', err);
            throw err;
        }

        await this.address.houseNumber.first().fill(this.env.houseNumber);

        const addrNotesAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.address.addressNotes, "הערות לכתובת");
        await this.address.addressNotes.first().fill(addrNotesAllowed || "א");

        await this.address.addressType.first().click();
        await this.address.otherAddress.first().waitFor({ state: 'visible' });
        await this.address.otherAddress.first().click();

        const otherAddrAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.address.otherAddressType, "סוג כתובת אחר");
        await this.address.otherAddressType.first().fill(otherAddrAllowed || "א");

        await this.saveSubmit.click();
        await this.page.waitForTimeout(3000);

        if (await this.regulationDealer.dialog.isVisible()) {
            const dialogText = await this.regulationDealer.dialog.textContent();
            this.log.info(dialogText);
            if (dialogText.includes("בהצלחה")) {
                const oldfilepath2 = this.po.dataFolder + '\\RP2.txt';
                await this.sharedUtils.WriteFile(oldfilepath2, t[1]);
            }
        }
    }

    async LoginToDeakerNoMancal(name = "", idd = "") {
        try {
            console.log("רישום תאגיד נציג אחראי - לא מנכ\"ל");
            const t = await this.regulationDealer.ReadIdName(idd, name);
            
            await this.orderButton.click();
            await this.tagidRP2.waitFor({ state: 'visible' });
            await this.tagidRP2.click();

            await this.businessName.fill(t[1]);
            await this.businessId.fill(t[0]);
            
            // שימוש בלוקטור שכבר קיים במחלקת Dealer כדי ללחוץ על 'לא מנכל'
            await this.regulationDealer.noMancal.click();
            
            await this.page.waitForTimeout(2000);
            await this.nextStep.click();
        } catch (err) {
            this.log.error('LoginToDeakerNoMancal error', err);
            throw err;
        }
    }
}
module.exports = RegulationTaagidRPPage;
