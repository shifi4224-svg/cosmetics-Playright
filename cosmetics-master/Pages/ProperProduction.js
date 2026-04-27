const SharedUtils = require('./SharedUtils');
const DealerPage = require('./Dealer');

class ProperProductionPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        
        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.regulationDealer = new DealerPage(page, po, env, log);

        // Locators
        this.properProductionButton = this.page.locator('//span[text()="עריכת תנאי יצור נאותים"]');
        this.accuracyOfData1 = this.page.locator('//*[contains(text(), "לא בוטל")]//..//input[@type="checkbox"]');
        this.accuracyOfData2 = this.page.locator('//*[contains(text(), "הפרטים ")]//..//input[@type="checkbox"]');
        this.addAddress = this.page.locator('//i[@aria-label="הוספת כתובת"]');
        this.saveButton = this.page.locator('//button[@type="submit"]');
        this.okEnd = this.page.locator('//button[@id="confirm-btn"]');
        this.option = this.page.locator('//mat-option');
    }

    GetAddresses() {
        return [
            { city: 'ירושלים', street: 'בדר', houseNumber: 12, addressType: 'כתובת משרד', postalCode: '61000', poBox: '123', notes: 'דירה בקומה 3' },
            { city: 'בני ברק', street: 'אבטליון', houseNumber: 5, addressType: 'כתובת אתר הייצור', postalCode: '31000', poBox: '456', notes: 'כניסה ראשית' },
            { city: 'ירושלים', street: 'המישור', houseNumber: 20, addressType: 'אחר', otherAddressType: 'מגורים - דירה', postalCode: '91000', poBox: '789', notes: 'קומת קרקע' },
            { city: 'עלמה', street: 'עלמה', houseNumber: 8, addressType: 'מחסן', postalCode: '84000', poBox: '101', notes: 'גישה דרך חניה' },
            { city: 'נתניה', street: 'אביעד', houseNumber: 3, addressType: 'אחר', otherAddressType: 'מסחרי - חנות', postalCode: '42400', poBox: '202', notes: 'חנות מול הים' },
            { city: 'רעננה', street: 'העצמאות', houseNumber: 15, addressType: 'כתובת משרד', postalCode: '43100', poBox: '303', notes: 'דירה בסוף הבניין' }
        ];
    }

    async AddAddressesForProperProduction(x) {
        console.log(1)
        const addresses = this.GetAddresses();
        let count = Number(x);
        if (!Number.isInteger(count) || count < 1) count = 1;
        if (count > addresses.length) count = addresses.length;

        await this.sharedUtils.OpenDetails(this.properProductionButton)

        for (let i = 0; i < count; i++) {
            try {
                if (i > 0) {
                    console.log(2)
                    await this.addAddress.scrollIntoViewIfNeeded();
                    await this.addAddress.click();
                }
                const addr = addresses[i];
                
                // איתור הפאנל הנוכחי (אינדקס מתחיל מ-0, אבל אנחנו רוצים את הפאנל השני והלאה)
                const panel = this.page.locator('mat-expansion-panel').nth(i + 1);
                console.log(3)
                const cityLoc = panel.locator('//input[@aria-label="עיר/יישוב"]');
                await cityLoc.click();
                await cityLoc.fill(addr.city.toString());
                await this.page.waitForTimeout(400);
                if (await this.sharedUtils.isVisibleSafe(this.option, 3000)) {
                    await this.option.first().click();
                } else {
                   console.log(`option not found after city input for address ${i + 2}`);
                }

                const streetLoc = panel.locator('//*[contains(text(), "רחוב")]//..//..//input');
                await streetLoc.click();
                await streetLoc.fill(addr.street.toString());
                await this.page.waitForTimeout(400);
                if (await this.sharedUtils.isVisibleSafe(this.option, 3000)) {
                    await this.option.first().click();
                } else {
                   console.log(`option not found after street input for address ${i + 2}`);
                }

                const houseLoc = panel.locator('//input[@aria-label="מספר בית"]');
                await houseLoc.fill(addr.houseNumber.toString());

                const zipLoc = panel.locator('//input[@aria-label="מיקוד"]');
                await zipLoc.fill(addr.postalCode.toString());

                const notesLoc = panel.locator('//input[@aria-label="הערות לכתובת"]');
                await notesLoc.fill(addr.notes.toString());

                const boxLoc = panel.locator('//input[@aria-label="ת.ד."]');
                await boxLoc.fill(addr.poBox.toString());

                const typeLoc = panel.locator('//input[@aria-label="סוג כתובת"]');
                await typeLoc.click();
                await typeLoc.fill(addr.addressType.toString());
                await this.page.waitForTimeout(400);
                if (await this.sharedUtils.isVisibleSafe(this.option, 3000)) {
                    await this.option.first().click();
                } else {
                   console.log(`option not found after addressType input for address ${i + 2}`);
                }

                if (addr.addressType === 'אחר') {
                    const otherLoc = panel.locator('//input[(@aria-label="סוג כתובת")and not(@aria-haspopup="listbox")]');
                    await otherLoc.fill(addr.otherAddressType.toString());
                }

                const selfDecl = panel.locator('//*[contains(text(), "מתקיימים")]');
                await selfDecl.click();
                await this.page.waitForTimeout(7000);
            } catch (err) {
                this.log.error('תקלה ברישום יוצא מהרישום', err);
            }
        }
        await this.accuracyOfData1.click();
        await this.accuracyOfData2.click();
        await this.saveButton.click();
        
        if (await this.sharedUtils.isVisibleSafe(this.regulationDealer.dialog, 3000)) {
            const dt = await this.regulationDealer.dialog.textContent();
           console.log(dt);
        }
    }
}
module.exports = ProperProductionPage;