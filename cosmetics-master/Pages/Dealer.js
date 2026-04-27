const AddressPage = require('./Address');
const SharedUtils = require('./SharedUtils');
const SupervisedEmploeePage = require('./SupervisedEmploee');


class DealerPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.address = new AddressPage(page, po, env, log);
        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.supervisedEmploee = new SupervisedEmploeePage(page, po, env, log);
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.charBusinessName = '&"\'W-,ף.ץת_ 43 ()dדA';
        this.charBusinessNameRP = '"\'W-,ף.ץת_ 43 ()dדA';
        this.charBusinessId = '34';

        // Locators
        this.orderButton = page.locator('//a[@href="/register"]').first();
        this.tamrukimButton1 = this.page.locator('//*[text() = "רישום עוסק בתמרוקים"]');
        this.nextStep = this.page.locator('//moh-button[@class="next-btn ng-star-inserted"]');
        this.businessName = this.page.locator('(//input[@matinput])[1]');
        this.errorBusinessName = this.page.locator('(//input[@matinput])[1]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.markerBusinessName = this.page.locator('(//input[@matinput])[1]//..//span[@class="requiredMarker ng-star-inserted"]');
        this.corpurationName = this.page.locator('//*[contains(text(), "שם התאגיד")]//..//..//input');
        this.businessId = this.page.locator('(//input[@matinput])[3]');
        this.corpurationId = this.page.locator('//*[contains(text(), "ח.פ")]//..//..//input');
        this.errorBusinesId = this.page.locator('//*[contains(text(), "מזהה")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.markerBusinessId = this.page.locator('//*[contains(text(), "מזהה")]//..//span[@class="requiredMarker ng-star-inserted"]');
        this.legalEntity = this.page.locator('//*[contains(text(), "ישות")]//..//..//input');
        this.errorLegalEntity = this.page.locator('//*[contains(text(), "ישות")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.markerLegalEntity = this.page.locator('//*[contains(text(), "ישות")]//..//span[@class="requiredMarker ng-star-inserted"]');
        this.hP = this.page.locator('//mat-option[@ng-reflect-value="3"]');
        this.authorized = this.page.locator('//*[contains(text(), "עוסק מורשה")]');
        this.supplierCheckbox = this.page.locator('//span[contains(text(), "יבואן") and not(contains(text(), "נאות"))]');
        this.naotCheckbox = this.page.locator('//span[contains(text(), "יבואן") and (contains(text(), "נאות"))]');
        this.rPCheckbox = this.page.locator('//span[text()=" נציג אחראי "]');
        this.manufactorCheckbox = this.page.locator('//span[contains(text(), "יצרן") ]');
        this.distributorCheckbox = this.page.locator('//span[contains(text(), "מפיץ") ]');
        this.oK1 = this.page.locator('//*[contains(text(), "קטין")]');
        this.oK2 = this.page.locator('//*[contains(text(), "פסול")]');
        this.businessLicenseRequired = this.page.locator('//*[contains(text(), "ויש בידי המבקש")]');
        this.businessLicenseNotRequired = this.page.locator('//*[contains(text(), "לא נדרש רישיון עסק")]');
        this.properImporterDeclaration1 = this.page.locator('//*[contains(text(), "התייחסות")]');
        this.properImporterDeclaration2 = this.page.locator('//*[contains(text(), "ליישם")]');
        this.properImporterDeclaration3 = this.page.locator('//*[contains(text(), "לאחסן")]');
        this.mySelfDeclaration = this.page.locator('//*[contains(text(), "מתקיימים")]');
        this.accuracyOfData1 = this.page.locator('//*[contains(text(), "לא בוטל")]//..//input[@type="checkbox"]');
        this.accuracyOfData2 = this.page.locator('//*[contains(text(), "הפרטים ")]//..//input[@type="checkbox"]');
        this.saveSubmit = this.page.locator('//moh-button[@type="submit"]');
        this.dialog = this.page.locator('//div[@role="dialog"]');
        this.okEnd = this.page.locator('//button[@class="main-button narrow"]');
        this.errorInvalidCharacter = this.page.locator('//*[contains(text(), "תו לא חוקי")]');
        this.errorIncompatiblePrefix = this.page.locator('//*[contains(text(), "התחילית לא תואמת לישות המשפטית")]');
        this.errorIncompatibleId = this.page.locator('//*[contains(text(), "מספר זהות לא תקין")]');
        this.errorNoMancal = this.page.locator('//*[contains(text(), "אינך מורשה להמשיך בתהליך")]');
        this.errorManu1 = this.page.locator('//*[contains(text(), "עבור ייצור תמרוקים נדרש רישיון עסק לעוסק")]');
        this.errorManu2 = this.page.locator('//*[contains(text(), "עליך לעדכן כתובת מסוג אתר יצור")]');
        this.errorRequiredField = this.page.locator('//*[contains(text(), "שדה חובה")]');
        this.homePage = this.page.locator('//button[@class="primaryBtn homePage"]');
        this.yesCorporation = this.page.locator('//*[text() = "תאגיד"]');
        this.noCorpuration = this.page.locator('//*[text() = "לא תאגיד"]');
        this.yesMancal = this.page.locator('//*[contains(text(), "האם אתה המנכ")]//..//..//..//*[@class="mdc-switch mdc-switch--selected mdc-switch--checked"]');
        this.noMancal = this.page.locator('//*[contains(text(), "האם אתה המנכ")]//..//..//..//*[contains(text(), "לא")]');
        this.yesMancalIsrael = this.page.locator('//*[contains(text(), "תושב ישראל")]//..//..//..//*[@class="mdc-switch mdc-switch--selected mdc-switch--checked"]');
        this.noMancalIsrael = this.page.locator('//*[contains(text(), "תושב ישראל")]//..//..//..//*[contains(text(), "לא")]');
        this.yesCorporateOfficer = this.page.locator('//*[contains(text(), "האם אתה נושא משרה")]//..//..//..//*[contains(text(), "כן")]');
        this.noCorporateOfficer = this.page.locator('//*[contains(text(), "האם אתה נושא משרה")]//..//..//..//*[contains(text(), "לא")]');
        this.code = this.page.locator('//span[text() ="עסק עסק"]//..//..//i[@class="expand-icon moh-icon grid_ar_dropdown ng-star-inserted"]');
        this.yesButton = this.page.locator('//button[@class="swal2-confirm swal2-styled swal2-default-outline"]');
        this.error = this.page.locator('//*[@class="error-message ng-star-inserted"]');
        this.errorMax = this.page.locator('//span[contains(text(), "מקסימום")]');
        this.errorChar = this.page.locator('//span[contains(text(), "תו לא חוקי")]');
        this.errorDealer = this.page.locator('//*[contains(text(), "מה תפקידך")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.errorTel = this.page.locator('//*[contains(text(), "טלפון ראשי")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.errorEmail = this.page.locator('//*[contains(text(), "דואר אלקטרוני")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.errorCity = this.page.locator('//*[contains(text(), "עיר")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.errorNotes = this.page.locator('//*[contains(text(), "הערות")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.errorType = this.page.locator('//*[contains(text(), "סוג כתובת")]//..//..//..//..//..//..//..//..//*[contains(text(), "שדה חובה")]');
        this.errorOK1 = this.page.locator('//moh-checkbox[@formcontrolname="declarePerson1"]//..//span[contains(text(), "שדה חובה")]');
        this.errorOK2 = this.page.locator('//moh-checkbox[@formcontrolname="declarePerson2"]//..//span[contains(text(), "שדה חובה")]');
        this.errorBusinessLicense = this.page.locator('//*[contains(text(), "רישיון עסק")]//..//..//..//..//div[@class="error-message ng-star-inserted"]');
        this.errorAddress = this.page.locator('//*[contains(text(), "תנאי יצור")]//..//..//..//..//div[@class="error-message ng-star-inserted"]');
        this.errorStatement1 = this.page.locator('(//*[contains(text(), "לא בוטל")]//..//..//div[@class="error-message ng-star-inserted"])[1]');
        this.errorStatement2 = this.page.locator('(//*[contains(text(), "הפרטים שנמסרו")]//..//..//div[@class="error-message ng-star-inserted"])[2]');
        this.markerDealer = this.page.locator('//label[contains(text(), "מה תפקידך")]//span[@class="star ng-star-inserted"]');
        this.markerTel = this.page.locator('//*[contains(text(), "טלפון ראשי")]//..//span[@class="requiredMarker ng-star-inserted"]');
        this.markerDoal = this.page.locator('//*[contains(text(), "דואר אלקטרוני")]//..//span[@class="requiredMarker ng-star-inserted"]');
        this.markerCity = this.page.locator('//*[contains(text(), "עיר")]//..//span[@class="requiredMarker ng-star-inserted"]');
        this.markerType = this.page.locator('//*[contains(text(), "סוג כתובת")]//..//span[@class="requiredMarker ng-star-inserted"]');
        this.markerOK1 = this.page.locator('//moh-checkbox[@formcontrolname="declarePerson1"]//span[@class="star col-auto ng-star-inserted"]');
        this.markerOK2 = this.page.locator('//moh-checkbox[@formcontrolname="declarePerson2"]//span[@class="star col-auto ng-star-inserted"]');
        this.markerBusinessLicense = this.page.locator('//*[contains(text(), "רישיון עסק")]//span[@class="required-asterisk"]');
        this.markerAddress = this.page.locator('//*[contains(text(), "תנאי יצור")]//span[@class="required-asterisk"]');
        this.markerStatement1 = this.page.locator('//*[contains(text(), "לא בוטל")]//..//span[@class="star col-auto ng-star-inserted"]');
        this.markerStatement2 = this.page.locator('//*[contains(text(), "הפרטים שנמסרו")]//..//span[@class="star col-auto ng-star-inserted"]');
        this.businessLicense = this.page.locator('//*[contains(text(), "רישיון עסק")]');
        this.addressOK = this.page.locator('//*[contains(text(), "תנאי יצור")]');

    }

    // מתודת עזר המחליפה את ההתנהגות של web.isVisible() מ-Oxygen
    async isVisibleSafe(locatorOrString, timeout = 0) {
        const loc = typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)
            : locatorOrString;
        const firstLoc = loc.first();
        if (timeout > 0) {
            await firstLoc.waitFor({ state: 'visible', timeout }).catch(() => { });
        }
        return await firstLoc.isVisible();
    }

    async CheckError() {
        if (await this.isVisibleSafe(this.dialog, 3000)) {
            const dialogText = await this.dialog.textContent();
            console.log(dialogText);
            if (await this.isVisibleSafe(this.error, 3000)) {
                const errorText = await this.error.textContent();
                console.log("השגיאה היא: " + errorText);

            }
            await this.okEnd.click();
            // await this.page.reload();
            return true;
        }
        return false;
    }

    async ReadIdName(idd, name) {
        let businessId = "";
        const char = "=".repeat(50);
        console.log(char);
        const oldfilepath = this.po.dataFolder + '\\dealer.txt';
        let t = await this.sharedUtils.ReadFileUpdate(oldfilepath);
        if (idd !== "") {
            businessId = idd;
        }
        else {
            businessId = await this.sharedUtils.GetRandomValidID();
        }
        const businessName = t[1] + t[2] + name;
        t[0] = businessId;
        t[1] = businessName;
        return t;
    }

    async RegulationDealerBusiness(flug = true, co = 0, name = "", idd = "") {

        if (co === 0) {
            console.log("רישום עוסק בתמרוק לא תאגיד");
        } else if (co === 1) {
            console.log("רישום עוסק בתמרוק תאגיד");
        } else {
            console.warn("רישום עוסק בתמרוק מס' לא תקין ");
        }

        const t = await this.ReadIdName(idd, name);
        let i = 0;
        console.log("מספר מזהה עסק: " + t[0]);
        console.log(" שם העסק: " + t[1]);

        try {
            await this.orderButton.waitFor({ state: 'visible' });
            // await this.page.waitForTimeout(5000);
            await this.orderButton.click();

            if (await this.isVisibleSafe(this.dialog, 3000)) {
                await this.okEnd.click();
            }

            // if (!(await this.isVisibleSafe(this.tamrukimButton1, 2000))) {
            //     await this.orderButton.click();
            //     await this.page.waitForTimeout(2000);
            //     if (await this.isVisibleSafe(this.dialog, 3000)) {
            //         await this.okEnd.click();
            //     }
            // }
            await this.tamrukimButton1.click();
        } catch (err) {
            this.log.error(err.message);
        }

        if (co === 1) {
            await this.yesCorporation.click();
        }

        if (flug) {
            await this.po.pagesDealer.Page1();
        }

        await this.legalEntity.click();
        await this.authorized.click();

        if (flug) {
            await this.sharedUtils.CheckCharacters(this.businessName, "שם העסק", this.charBusinessName);
            await this.sharedUtils.CheckMaxLength(this.businessName, 100, "שם העסק");
            await this.sharedUtils.CheckCharacters(this.businessId, "מספר מזהה", this.charBusinessId);
            await this.sharedUtils.CheckMaxLength(this.businessId, 9, "מספר מזהה");
        }

        await this.businessName.fill(t[1]);
        await this.businessId.fill(t[0]);
        await this.nextStep.click();
        i++;

        if (await this.CheckError() === true) {
            console.log("השגיאה בשלב מס': " + i);
            return;
        }

        if (co === 1) {
            await this.nextStep.click();
            i++;
        }
        if (flug) {
            await this.po.pagesDealer.Page2();
        }

        await this.supplierCheckbox.click();
        await this.rPCheckbox.click();
        await this.address.AddAddress(flug);
        await this.oK1.click();
        await this.oK2.click();
        await this.nextStep.click();
        i++;

        if (await this.CheckError() === true) {
            console.log("השגיאה בשלב מס': " + i);
            return;
        }

        if (flug) {
            await this.po.pagesDealer.Page3();
        }

        await this.businessLicenseRequired.click();

        if (!(await this.isVisibleSafe(this.mySelfDeclaration, 1000))) {
            console.warn("חסר במסך הצהרה עצמית, בעיה עם תנאי יצור נאותים ברישום");
            await this.page.locator('//*[@aria-label="הוספת כתובת"]').click();
        }

        await this.mySelfDeclaration.click();
        await this.accuracyOfData1.click();
        await this.accuracyOfData2.click();
        await this.saveSubmit.click();
        await this.page.waitForTimeout(6000);

        if (await this.isVisibleSafe(this.dialog, 4000)) {
            const dialogText = await this.dialog.textContent();
            console.log("תוצאת הרישום היא: \n" + dialogText);
            try {
                if (dialogText.includes("אנא נסה שוב")) {
                    await this.CheckNetworkErrors();
                } else if (dialogText.includes("בהצלחה")) {
                    console.log("מתחיל רישום בקובץ");
                    const oldfilepath = this.po.dataFolder + '\\RP.txt';
                    await this.sharedUtils.WriteFile(oldfilepath, t[1]);
                    console.log("סיים רישום בקובץ");
                }
            } catch (err) {
                console.log(err.message);
            }
        } else {
            console.log("לא הופיע הודעה בסיום הרישום");
        }
        await this.page.waitForTimeout(5000);
    }

    async NoMancal(name = "", idd = "") {
        console.log("רישום עוסק בתמרוק על ידי לא מנכל");
        const t = await this.ReadIdName(idd, name);
        let i = 0;
        console.log("מספר מזהה עסק: " + t[0] + " שם העסק: " + t[1]);
        try {
            await this.orderButton.click();

            if (await this.isVisibleSafe(this.dialog, 3000)) {
                await this.okEnd.click();
            }
            await this.tamrukimButton1.click();
            await this.yesCorporation.click();
            await this.businessName.fill(t[1]);
            await this.legalEntity.click();
            await this.authorized.click();
            await this.businessId.fill(t[0]);
            await this.noMancal.click();
            await this.noMancalIsrael.click();
            await this.noCorporateOfficer.click();
            await this.nextStep.click();
            if (await this.CheckError() === true) {
                console.log("לא ניתן להתקדם למי שאינו מנכל");
                return;
            }
            console.error("ניתן לעבור לשלב הבא - תקלה");

        } catch (err) {
            console.error('NoMancal error:', err);
            throw err;
        }
    }

    async ManufacturerDealer(l = 1, name = "", idd = "") {
        console.log("רישום עוסק בתמרוק - יצרן");
        const t = await this.ReadIdName(idd, name);
        let i = 0;
        console.log("מספר מזהה: " + t[0] + " שם העסק: " + t[1]);
        await this.page.waitForTimeout(5000);

        await this.orderButton.click();
        if (await this.isVisibleSafe(this.dialog, 3000)) {
            await this.okEnd.click();
        }
        await this.tamrukimButton1.waitFor({ state: 'visible' });
        await this.tamrukimButton1.click();
        await this.businessName.fill(t[1]);
        await this.legalEntity.click();
        await this.authorized.click();
        await this.businessId.fill(t[0]);
        await this.nextStep.click();
        i++;
        if (await this.CheckError() === true) {
            console.log("השגיאה בשלב מס': " + i);
            return;
        }
        await this.manufactorCheckbox.click();
        await this.address.AddAddress(false);
        if (l === 3) {
            await this.address.addressType.first().click();
            await this.address.productionSiteAddress.click();
        } else {
            await this.address.addressType.first().click();
            await this.address.officeAddress.click();
        }
        await this.oK1.click();
        await this.oK2.click();
        await this.nextStep.click();
        i++;
        if (await this.CheckError() === true) {
            console.log("השגיאה בשלב מס': " + i);
            return;
        }
        if (l === 1) {
            await this.businessLicenseNotRequired.click();
        } else {
            await this.businessLicenseRequired.click();
        }
        if (!(await this.isVisibleSafe(this.mySelfDeclaration, 1000))) {
            console.warn("חסר במסך הצהרה עצמית, בעיה עם תנאי יצור נאותים ברישום");
            await this.page.locator('//*[@aria-label="הוספת כתובת"]').click();
        }
        await this.mySelfDeclaration.click();
        await this.accuracyOfData1.click();
        await this.accuracyOfData2.click();
        console.log('לפני לחיצה על שמור ושלח');
        await this.saveSubmit.click();
        console.log('אחרי לחיצה על שמור ושלח');

        await this.page.waitForTimeout(3000);
    }

    async OfficerDealer(name = "", idd = "") {
        console.log('רישום עוסק בתמרוק תאגיד ע"י נושא משרה בתאגיד');
        const t = await this.ReadIdName(idd, name);
        let i = 0;
        console.log("מספר מזהה עסק: " + t[0]);
        console.log(" שם העסק: " + t[1]);
        try {
            await this.orderButton.waitFor({ state: 'visible' });
            await this.orderButton.click();
            if (await this.isVisibleSafe(this.dialog, 3000)) {
                await this.okEnd.click();
            }
            await this.tamrukimButton1.click();
        } catch (err) {
            this.log.error(err.message);
        }
        await this.yesCorporation.click();
        await this.noMancal.click();
        await this.noMancalIsrael.click();
        //await this.page.pause();
        //await this.yesCorporateOfficer.click();
        //await this.page.pause();
        await this.legalEntity.click();
        await this.authorized.click();
        await this.businessName.fill(t[1]);
        await this.businessId.fill(t[0]);
        await this.nextStep.click();
        i++;

        if (await this.CheckError() === true) {
            console.log("השגיאה בשלב מס': " + i);
            return;
        }
        await this.nextStep.click();
        i++;

        await this.supplierCheckbox.click();
        await this.rPCheckbox.click();
        await this.address.AddAddress(false);
        await this.oK1.click();
        await this.oK2.click();
        await this.nextStep.click();
        i++;

        if (await this.CheckError() === true) {
            console.log("השגיאה בשלב מס': " + i);
            return;
        }

        await this.businessLicenseRequired.click();

        if (!(await this.isVisibleSafe(this.mySelfDeclaration, 1000))) {
            console.warn("חסר במסך הצהרה עצמית, בעיה עם תנאי יצור נאותים ברישום");
            await this.page.locator('//*[@aria-label="הוספת כתובת"]').click();
        }

        await this.mySelfDeclaration.click();
        await this.accuracyOfData1.click();
        await this.accuracyOfData2.click();
        await this.saveSubmit.click();
        await this.page.waitForTimeout(6000);

        if (await this.isVisibleSafe(this.dialog, 4000)) {
            const dialogText = await this.dialog.textContent();
            console.log("תוצאת הרישום היא: \n" + dialogText);
            try {
                if (dialogText.includes("אנא נסה שוב")) {
                    await this.CheckNetworkErrors();
                } else if (dialogText.includes("בהצלחה")) {
                    console.log("מתחיל רישום בקובץ");
                    const oldfilepath = this.po.dataFolder + '\\RP.txt';
                    await this.sharedUtils.WriteFile(oldfilepath, t[1]);
                    console.log("סיים רישום בקובץ");
                }
            } catch (err) {
                console.log(err.message);
            }
        } else {
            console.log("לא הופיע הודעה בסיום הרישום");
        }
        await this.page.waitForTimeout(5000);
    }

    async AuthorizedEmployeeDealer(name = "", idd = "", firstName = "חיים", lastName = "כהן", idNumber = "123456782", telefonNumber = "0533212321", emailAddress = "test@test.com") {
        console.log("רישום עוסק בתמרוק תאגיד מינוי עובד ממונה");
        const t = await this.ReadIdName(idd, name);
        let i = 0;
        console.log("מספר מזהה עסק: " + t[0]);
        console.log(" שם העסק: " + t[1]);
        try {
            await this.orderButton.waitFor({ state: 'visible' });
            await this.orderButton.click();
            if (await this.isVisibleSafe(this.dialog, 3000)) {
                await this.okEnd.click();
            }
            await this.tamrukimButton1.click();
        } catch (err) {
            this.log.error(err.message);
        }
        await this.yesCorporation.click();
        await this.legalEntity.click();
        await this.authorized.click();
        await this.businessName.fill(t[1]);
        await this.businessId.fill(t[0]);
        await this.nextStep.click();
        i++;
        if (await this.CheckError() === true) {
            console.log("השגיאה בשלב מס': " + i);
            return;
        }
        await this.supervisedEmploee.toggle.click();
        await this.sharedUtils.CheckCharacters(this.supervisedEmploee.firstName, "שם פרטי", this.env.charName);
        await this.sharedUtils.CheckMaxLength(this.supervisedEmploee.firstName, 50, "שם פרטי");
        await this.supervisedEmploee.firstName.fill(firstName);
        await this.sharedUtils.CheckCharacters(this.supervisedEmploee.lastName, "שם משפחה", this.env.charName);
        await this.sharedUtils.CheckMaxLength(this.supervisedEmploee.lastName, 50, "שם משפחה");
        await this.supervisedEmploee.lastName.fill(lastName);
        await this.sharedUtils.CheckCharacters(this.supervisedEmploee.idNumber, "ת.ז", this.env.charBusinessId);
        await this.sharedUtils.CheckMaxLength(this.supervisedEmploee.idNumber, 9, "ת.ז");
        await this.supervisedEmploee.idNumber.fill(idNumber);
        await this.sharedUtils.TestIsraeliPhoneNumberValidation(this.supervisedEmploee.telefonNumber);
        await this.supervisedEmploee.telefonNumber.fill(telefonNumber);
        await this.sharedUtils.CheckCharactersEmail(this.supervisedEmploee.emailAddress, "דואר אלקטרוני", this.env.charEmail);
        await this.sharedUtils.CheckMaxEmail(this.supervisedEmploee.emailAddress, 100, "דואר אלקטרוני");
        await this.supervisedEmploee.emailAddress.fill(emailAddress);
        await this.supervisedEmploee.checkBox.click();
        await this.nextStep.click();
        await this.supervisedEmploee.saveButton.click();

    }
}

module.exports = DealerPage;
