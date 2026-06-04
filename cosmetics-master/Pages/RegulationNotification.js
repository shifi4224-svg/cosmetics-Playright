const SharedUtils = require('./SharedUtils');
const FilesPage = require('./Files');
const RegulationItemPage = require('./RegulationItem');
const path = require('path');

class RegulationNotificationPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.filesPage = new FilesPage(page, po, env, log);
        this.regulationItemPage = new RegulationItemPage(page, po, env, log);

        // Locators
        this.okItem = this.page.locator('//mat-row[@role="row"][1]//button[@title="אשר פריט"]');
        this.row = this.page.locator('//mat-row[@role="row"][1]');
        this.li = this.page.locator('//ul[1]/li[1]');
        this.createN = this.page.locator('//button[@class="primary-btn"]');
        this.israelManufacturerAbroad = this.page.locator('//moh-radiobutton-group[@formcontrolname="manufacturerAbroad"]//*[text()="יצרן מקומי"]');
        this.overseasManufacturerAbroad = this.page.locator('//moh-radiobutton-group[@formcontrolname="manufacturerAbroad"]//*[text()="יצרן מחו״ל"]');
        this.manufacturerName = this.page.locator('//input[@aria-label="שם יצרן"]');
        this.option = this.page.locator('//mat-option');
        this.addressType = this.page.locator('//input[@aria-label="סוג כתובת"]');
        this.addressTypeName = this.page.locator('//mat-option[@ng-reflect-value="1"]');
        this.otherAddress = this.page.locator('//*[text() = " אחר "]');
        this.otherAddressType = this.page.locator('//input[(@aria-label="סוג כתובת")and not(@aria-haspopup="listbox")]');
        this.country = this.page.locator('//input[@aria-label="מדינה"]');
        this.countryName = this.page.locator('//mat-option[.//span[normalize-space()="ארמניה"]]');
        this.city = this.page.locator('//input[@aria-label="עיר/יישוב"]');
        this.street = this.page.locator('//input[@aria-label="רחוב"]');
        this.houseNum = this.page.locator('//input[@aria-label="מספר בית"]');
        this.zipCode = this.page.locator('//input[@aria-label="מיקוד"]');
        this.addressNotes = this.page.locator('//input[@aria-label="הערות לכתובת"]');
        this.cosmeticImport = this.page.locator('//input[@aria-label="יש לסמן אחד מהסעיפים הבאים:"]');
        this.cosmeticImportValue3 = this.page.locator('//span[text()=" תמרוק משווק במדינת הסתמכות "]');
        this.cosmeticImportValue3CheckBox1 = this.page.locator('//input[@aria-label="היבואן מחזיק בחשבוניות מכירה לקמעונאי במדינה ממדינות ההסתמכות או מקמעונאי במדינה כאמור או תעודת משלוח לקמעונאי במדינה כאמור *"]');
        this.cosmeticImportValue3CheckBox2 = this.page.locator('//input[@aria-label="היבואן מחזיק בהצהרתו כי התמרוק שהוא מייבא זהה לתמרוק שאליו מתייחס המסמך (חשבונית.תעודת משלוח) *"]');

        this.category1 = this.page.locator('//input[@aria-label="קטגוריית תמרוק 1"]');
        this.category2 = this.page.locator('//input[@aria-label="קטגוריית תמרוק 2"]');
        this.category3 = this.page.locator('//input[@aria-label="קטגוריית תמרוק 3"]');
        this.typeName1 = this.page.locator('//span[contains(text(),"תינוקות והנקה")]');
        this.typeName2 = this.page.locator('//span[contains(text(),"מוצרי תינוקות")]');
        this.typeName3 = this.page.locator('//span[contains(text(),"טלק")]');
        this.yesKit = this.page.locator('//*[contains(text(), "האם המוצר חלק מערכה")]//..//..//..//*[contains(text(), "כן")]');
        this.noKit = this.page.locator('//*[contains(text(), "האם המוצר חלק מערכה")]//..//..//..//*[contains(text(), "לא")]');
        this.selectKit = this.page.locator('//input[@placeholder="בחר ערכה"]');
        this.newKit = this.page.locator('//span[text()=" חדש "]');
        this.nameNewKit = this.page.locator('//input[@placeholder="שם ערכה חדש"]');
        this.barcodeKit = this.page.locator('//input[@placeholder="מספר ברקוד"]');
        this.selectFileKit = this.page.locator('//app-notification-kits//div[@class="upload-button"]');
        this.typeFileKit = this.page.locator('//*[contains(text(), "העלאת קובץ ערכה")]//..');
        this.addKit = this.page.locator('//moh-button[@textkey="addKit"]');

        this.washable = this.page.locator('//label[contains(text(), "האם המוצר נשטף")]');
        this.granules = this.page.locator('//label[contains(text(), "מכיל גרגירים")]');
        this.yesSpecialPack = this.page.locator('//label[contains(text(), "התמרוק מוצג באריזה מיוחדת")]');
        this.specialPack = this.page.locator('//input[@aria-label="אריזה מיוחדת"]');
        this.typePack = this.page.locator('//mat-option[@ng-reflect-value="4"]');
        this.phases = this.page.locator('//input[@aria-label="מספר פאזות"]');
        this.typePhases = this.page.locator('//span[text()=1]');
        this.physicochemical = this.page.locator('//input[@aria-label="מאפיינים פיזיקוכימיים"]');
        this.typePhysicochemical = this.page.locator('//span[text()=" משחה "]');
        this.cosmeticsPictures = this.page.locator('//moh-file-upload-drag-and-drop[@id="cosmeticsPictures"]');
        this.cosmeticsLabel = this.page.locator('//moh-file-upload-drag-and-drop[@id="cosmeticsLabel"]');
        this.packType = this.page.locator('//input[@aria-label="סוג אריזה"]');
        this.packTypeName = this.page.locator('//*[text()=" בקבוק פלסטיק "]');
        this.packTypeName2 = this.page.locator('//*[text()=" בקבוק זכוכית "]');
        this.unitType = this.page.locator('//input[@aria-label="סוג יחידה"]');
        this.unitTypeName = this.page.locator('//*[text()=" גרם "]');
        this.unitTypeName2 = this.page.locator('//*[text()=" ליטר "]');
        this.amount = this.page.locator('//input[@aria-label="כמות"]');
        this.barcode = this.page.locator('//input[@aria-label="ברקוד"]');
        this.secondPack = this.page.locator('//label[contains(text(), "קיימת אריזה שיניונית לתמרוק")]');
        this.specialPackCheckBox = this.page.locator('//input[@aria-label="האם התמרוק מוצג באריזה מיוחדת?"]');
        this.specialPackValue = this.page.locator('//span[text()=" אחר "]');
        this.otherspecialPack = this.page.locator('//input[@aria-label="אריזה מיוחדת אחר"]');
        this.addPack = this.page.locator('//*[@class="addRow ng-star-inserted"]');
        this.instructionsForUse = this.page.locator('//textarea[@aria-label="הוראות שימוש"]');
        this.exp = this.page.locator('//moh-radiobutton-group[@formcontrolname="expOrPao"]//input[@value="1"]');
        this.pao = this.page.locator('//moh-radiobutton-group[@formcontrolname="expOrPao"]//input[@value="2"]');
        this.numOfMonth = this.page.locator('//input[@aria-label="מספר חודשים"]');
        this.frequencyOfUse = this.page.locator('//input[@aria-label="תדירות שימוש"]');
        this.frequencyOfUseName = this.page.locator('//span[text()=" שימוש יומיומי "]');

        this.noShades = this.page.locator('//*[contains(text(), "האם יש גוונים")]//..//..//..//*[contains(text(), "לא")]');
        this.yesShades = this.page.locator('//*[contains(text(), "האם יש גוונים")]//..//..//..//*[contains(text(), "כן")]');
        this.shadesName = this.page.locator('//input[@aria-label="שם הגוון"]');
        this.selectFileShades = this.page.locator('//app-notification-shades//div[@class="upload-button"]');
        this.typeFileShades = this.page.locator('//moh-file-upload-drag-and-drop[@fieldtextkey="shadeFile"]');
        this.delSadesFile = this.page.locator('//moh-file-upload-drag-and-drop[@fieldtextkey="shadeFile"]//i[@class="moh-icon delete"]');
        this.selectColor = this.page.locator('//*[@class="app-color-picker"]');
        this.moreColors = this.page.locator('//*[@fill="#222222"]');
        this.accept = this.page.locator('//button[text()=" ACCEPT "]');
        this.colorWhite = this.page.locator('//div[@style="background: rgb(255, 255, 255);"]');
        this.vehicleType = this.page.locator('//input[@aria-label="סוג הרכב *"]');
        this.vehicleTypeName = this.page.locator('//span[text()=" פורמולה מדויקת "]');
        this.addShade = this.page.locator('//moh-button[@textkey="addShade"]');
        this.closeButton = this.page.locator('//moh-button[@textkey="סגור"]');

        this.oKmaterials = this.page.locator('//div[text()=" האם השבת על כל השאלות בעניין הרכב התמרוק וייעודו?* "]//..//..//mat-slide-toggle');

        this.panelOther = this.page.locator('//*[@alt="אחר"]');
        this.panelOtherCheckBox = this.page.locator('//input[@aria-label="אחר"]');
        this.panelOtherValue = this.page.locator('//input[@aria-label="טענה שיווקית אחרת"]');
        this.populationTitle = this.page.locator('//span[text()="אוכלוסיות יעד *"]');
        this.populationTitleName = this.page.locator('//input[@aria-label="מבוגרים מעל גיל 18"]');
        this.distributionStatusCheckBox = this.page.locator('//span[@ng-reflect-moh-translation="cosmeticDistributers"]');
        this.distributionStatus = this.page.locator('//input[@aria-label="סטטוס הפצה"]');
        this.distributionStatusValue = this.page.locator('//mat-option[@ng-reflect-value="1"]');
        this.noContainNano = this.page.locator('//*[text()="לא"]');

        this.saveSubmit = this.page.locator('//button[@type="submit"]');
        this.dialog = this.page.locator('//div[@role="dialog"]');
        this.okEnd = this.page.locator('//button[@class="main-button narrow"]');
        this.nextStep = this.page.locator('//moh-button[@class="next-btn ng-star-inserted"]');
        this.saveDraft = this.page.locator('//span[text()="שמירת טיוטה"] | //moh-button[@class="action-btn ng-star-inserted"]');
        this.manufAddress = this.page.locator('//mat-dialog-container[@role="dialog"]');
        this.manuftype1 = this.page.locator('(//mat-dialog-container[@role="dialog"]//input)[1]');
        this.manufSave = this.page.locator('//span[text()="שמירה"]');
        this.noteEdit = this.page.locator('//textarea[@aria-label="הערות לתיקון / עדכון"]');

        this.rpRole = this.page.locator('//span[@class="sidebar-text ng-star-inserted" and text()="נציג אחראי"]');
    }

    async AddKit(k, flug = true) {
        await this.yesKit.click();
        await this.selectKit.click();
        await this.newKit.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.nameNewKit, "שם ערכה", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.nameNewKit, 50, "שם ערכה");
        }
        await this.nameNewKit.fill(k[0]);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.barcodeKit, "ברקוד", this.env.charBusinessId);
            await this.sharedUtils.CheckMaxLength(this.barcodeKit, 9, "ברקוד");
        }
        await this.barcodeKit.fill(k[1] || "");
        await this.selectFileKit.click();
        if (flug) {
            await this.filesPage.TestFileTypeValidation(this.typeFileKit, "ערכה");
        }
        await this.filesPage.AtachFile(this.typeFileKit, "Doc1.pdf", "ערכה");
    }

    async AddXSades(totalShades = 150, shadesWithFiles = 20, s = "ירוק") {
        const colors = [
            { name: "לבן", rgb: "rgb(255, 255, 255)", xpath: "//div[@style='background: rgb(255, 255, 255);']", xPath2: false },
            { name: "כתום", rgb: "rgb(0, 0, 0)", xpath: "//div[@style='background: rgb(255, 138, 101);']", xPath2: "//div[@style='background: rgb(255, 87, 34);']" },
            { name: "צהוב", rgb: "rgb(255, 0, 0)", xpath: "//div[@style='background: rgb(255, 241, 118);']", xPath2: "//div[@style='background: rgb(253, 216, 53);']" },
            { name: "כחול", rgb: "rgb(0, 0, 255)", xpath: "//div[@style='background: rgb(121, 134, 203);']", xPath2: "//div[@style='background: rgb(40, 53, 147);']" }
        ];

        this.log.info(`מתחיל להוסיף ${totalShades} גוונים (${shadesWithFiles} עם קבצים)`);

        for (let i = 0; i < totalShades; i++) {
            const colorIndex = i % colors.length;
            const currentColor = colors[colorIndex];
            const shadeName = `${currentColor.name} ${Math.floor(i / colors.length) + 1}`;

            if (i < shadesWithFiles) {
                await this.selectFileShades.click();
                await this.filesPage.TestFileTypeValidation(this.typeFileShades, "גוון");
                await this.filesPage.AtachFile(this.typeFileShades, "Doc1.pdf", "גוון");
            }

            await this.selectColor.click();
            await this.page.locator(currentColor.xpath).click();
            if (currentColor.xPath2) {
                await this.page.locator(currentColor.xPath2).click();
            }

            await this.vehicleType.click();
            await this.vehicleTypeName.click();
            await this.addShade.click();

            this.log.info(`נוסף גוון ${i + 1}/${totalShades}: ${shadeName}`);
        }
        this.log.info(`הושלמה הוספת ${totalShades} גוונים!`);
    }

    async AddShades(s = "ירוק", flug = true, e = 1) {
        try {
            await this.yesShades.click();
            if (flug) {
                await this.sharedUtils.CheckCharacters(this.shadesName, "שם הגוון", this.env.charNotification);
                await this.sharedUtils.CheckMaxLength(this.shadesName, 50, "שם הגוון");
            }
            await this.shadesName.fill(s);
            if (flug) {
                await this.filesPage.TestFileTypeValidation(this.typeFileShades, "גוון");
            }
            await this.filesPage.AtachFile(this.typeFileShades, "Doc1.pdf", "גוון");
            await this.selectColor.click();
            await this.colorWhite.click();
            if (e === 1) {
                await this.vehicleType.click();
                await this.vehicleTypeName.click();
            }
            await this.page.waitForTimeout(1000);
            await this.addShade.click();
        } catch (err) {
            this.log.error("משהו לא טוב בגוון");
            this.log.error(err.message);
            await this.addShade.click();
        }
    }

    async OverseasManufacturerAbroad(a1, a2, a3, a4, a5, a6, flug = true) {
        await this.overseasManufacturerAbroad.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.manufacturerName, "שם יצרן בחול", this.env.charManufactor);
            await this.sharedUtils.CheckMaxLength(this.manufacturerName, 200, "שם יצרן בחול");
        }
        await this.manufacturerName.fill(a1);
        await this.addressType.click();
        await this.otherAddress.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.otherAddressType, "סוג כתובת אחר", this.env.charOtherAddress);
            await this.sharedUtils.CheckMaxLength(this.otherAddressType, 400, "סוג כתובת אחר");
        }
        await this.otherAddressType.fill("()-'\".,AWdתץדף43");
        await this.country.click();
        await this.countryName.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.city, "עיר/ישוב", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.city, 50, "עיר/ישוב");
        }
        await this.city.fill(a2);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.street, "רחוב", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.street, 50, "רחוב");
        }
        await this.street.fill(a3);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.houseNum, "מספר בית", this.env.charBusinessId);
            await this.sharedUtils.CheckMaxLength(this.houseNum, 10, "מספר בית");
        }
        await this.houseNum.fill(a4);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.zipCode, "מיקוד", this.env.charBusinessId);
            await this.sharedUtils.CheckMaxLength(this.zipCode, 10, "מיקוד");
        }
        await this.zipCode.fill(a5);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.addressNotes, "הערות לכתובת", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.addressNotes, 200, "הערות לכתובת");
        }
        await this.addressNotes.fill(a6);
        await this.cosmeticImport.click();
        await this.cosmeticImportValue3.click();
        await this.cosmeticImportValue3CheckBox1.click();
        await this.cosmeticImportValue3CheckBox2.click();
    }

    async QuantityAndPackaging(p, flug = true) {
        await this.packType.click();
        await this.packTypeName.click();
        await this.unitType.click();
        await this.unitTypeName.click();
        await this.amount.fill(p[0] || "");
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.barcode, "ברקוד", this.env.charBusinessId);
            await this.sharedUtils.CheckMaxLength(this.barcode, 9, "ברקוד");
        }
    }

    async SpecialPack(flug = true) {
        await this.specialPackCheckBox.click();
        await this.specialPack.click();
        await this.specialPackValue.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.otherspecialPack, "אריזה מיוחדת אחר", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.otherspecialPack, 50, "אריזה מיוחדת אחר");
        }
        await this.otherspecialPack.fill("אא");
    }

    async Files(flug = true) {
        if (flug) {
            await this.filesPage.TestFileTypeValidation(this.cosmeticsPictures, "תמונות תמרוק");
            await this.filesPage.TestFileTypeValidation(this.cosmeticsLabel, "תווית תמרוק");
        }
        await this.filesPage.AtachFile(this.cosmeticsPictures);
        await this.filesPage.AtachFile(this.cosmeticsLabel);
    }

    async EzerOpen() {
        let oldfilepath = path.join(this.po.dataFolder, 'RP.txt');
        let bussines = await this.sharedUtils.ReadFile(oldfilepath);
        return bussines[0] || bussines;
    }

    async Open(b1 = "", b2 = "") {
        try {
            let bussines1 = "";
            let bussines2 = "";

            if (b1 === "") {
                bussines1 = await this.EzerOpen();
            } else {
                bussines1 = b1;
            }

            if (b2 === "") {
                bussines2 = await this.EzerOpen();
            } else {
                bussines2 = b2;
            }

            this.log.info(`פותח עמוד נציג אחראי ${bussines1} לעסק ${bussines2}`);
            let rama2 = `//span[text() ="${bussines1}"]`;
            let rama3 = `//span[(@class="sidebar-text") and (text()="${bussines2}")]`;

            await this.page.waitForTimeout(1000);
            await this.rpRole.click();
            await this.page.waitForTimeout(1000);
            await this.page.locator(rama2).first().click();
            await this.page.waitForTimeout(1000);
            await this.page.locator(rama3).click();
            await this.page.waitForTimeout(1000);
        } catch (err) {
            this.log.error(err.message);
            throw err; // ← חובה
        }
    }

    async ReadValues(fileName) {
        return await this.sharedUtils.ReadFileComment(path.join(this.po.dataFolder, fileName));
    }

    async CheckDialog() {
        let dialogTaxt = await this.dialog.textContent() || "";
        this.log.info(dialogTaxt);
        if (dialogTaxt.includes("אנא נסה שוב")) {
            this.log.info("התקבלה הודעת שגיאה והנוטיפיקציה לא נשמרה");
        } else if (dialogTaxt.includes("בהצלחה")) {
            this.log.info("התקבלה הודעת הצלחה והנוטיפיקציה נשמרה");
        } else {
            this.log.info("התקבלה הודעת שגיאה לא קלאסית: " + dialogTaxt);
        }
    }

    async CreateNotificationSanity(itemName = "", flug = true) {
        const v = await this.ReadValues("sanity.txt");
        //await this.Open();
        console.log(351)
        await this.regulationItemPage.OpenItem1("", "", itemName, "פריט רגיל", null, "approve", true);
        console.log(353)
        console.log(354)
        // await this.regulationItemPage.ClickOnItem();


        //יצרן מקומי
        await this.israelManufacturerAbroad.click();
        await this.manufacturerName.fill(v[0]);
        await this.option.first().click();
        await this.nextStep.click();
        //קטגוריות
        await this.category1.click();
        await this.typeName1.waitFor({ state: 'visible' });
        await this.typeName1.click();
        await this.category2.click();
        await this.typeName2.waitFor({ state: 'visible' });
        await this.typeName2.click();
        await this.category3.click();
        await this.typeName3.waitFor({ state: 'visible' });
        await this.typeName3.click();
        //מאפייני התמרוק
        await this.SpecialPack(flug);
        //תיאור התמרוק
        await this.phases.click();
        await this.typePhases.click();
        await this.physicochemical.click();
        await this.typePhysicochemical.waitFor({ state: 'visible', timeout: 1000 }).catch(() => { });
        await this.typePhysicochemical.click();
        //קבצים
        await this.Files(flug);
        //כמות ואריזה
        await this.QuantityAndPackaging([v[1]], flug);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.instructionsForUse, "הוראות שימוש", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.instructionsForUse, 4000, "הוראות שימוש");
        }
        await this.instructionsForUse.fill(v[2]);

        //תוקף המוצר
        await this.exp.click();
        await this.numOfMonth.fill("200");
        await this.frequencyOfUse.click();
        await this.frequencyOfUseName.click();
        //גוונים
        await this.AddShades(v[3], flug);
        await this.nextStep.click();
        //חומרים
        await this.page.waitForTimeout(5000);
        await this.oKmaterials.click();
        await this.page.waitForTimeout(5000);
        await this.nextStep.click();
        await this.nextStep.click();
        //אוכלוסית יעד
        await this.populationTitle.click();
        await this.populationTitleName.click();
        await this.nextStep.click();
        //ננו
        await this.noContainNano.click();
        await this.saveSubmit.click();

        if (await this.sharedUtils.isVisibleSafe(this.manufAddress, 2000)) {
            await this.manuftype1.click();
            await this.manufSave.click();
        }
        await this.dialog.waitFor({ state: 'visible' });
        await this.CheckDialog();
    }

    async ReopenDraftAndNavigate(itemName, stepsToSkip) {
        const rows = this.page.locator("//mat-row");
        await rows.first().waitFor({ state: 'visible', timeout: 10000 });
        const total = await rows.count();
        let found = false;
        for (let i = 0; i < total; i++) {
            const text = await rows.nth(i).textContent();
            if (text.includes(itemName)) {
                await rows.nth(i).click();
                if (await this.sharedUtils.isVisibleSafe(this.regulationItemPage.extCreateN, 2000)) {
                    await this.regulationItemPage.extCreateN.click();
                } else if (await this.sharedUtils.isVisibleSafe(this.regulationItemPage.points3, 2000)) {
                    await this.regulationItemPage.points3.click();
                    await this.page.locator('//span[text()="עריכת טיוטה"]').click();
                }
                found = true;
                break;
            }
        }
        if (!found) throw new Error(`לא נמצא פריט בשם "${itemName}" בטבלה`);
        for (let i = 0; i < stepsToSkip; i++) {
            await this.nextStep.waitFor({ state: 'visible' });
            await this.nextStep.click();
            await this.page.waitForTimeout(500);
        }
    }

    async CreateNotificationWithDrafts(itemName = "") {
        const v = await this.ReadValues("sanity.txt");

        // --- טיוטה 1: שלב יצרן ---
        this.log.info("שלב 1 — מילוי יצרן ושמירת טיוטה");
        await this.regulationItemPage.OpenItem1("", "", itemName, "פריט רגיל", 'לאישור נציג אחראי', "approve", true);
        await this.israelManufacturerAbroad.click();
        await this.manufacturerName.fill(v[0]);
        await this.option.first().click();
        await this.saveDraft.first().click();
        await this.dialog.waitFor({ state: 'visible' });
        const draft1Text = await this.dialog.textContent();
        if (!draft1Text.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 1 נכשלה: ${draft1Text}`);
        this.log.info("✅ טיוטה 1 נשמרה");
        await this.okEnd.click();

        // --- טיוטה 2: שלב פרטי התמרוק המלא (קטגוריות + מאפיינים + קבצים + כמות + גוונים) ---
        this.log.info("שלב 2 — מילוי פרטי התמרוק המלא ושמירת טיוטה");
        await this.ReopenDraftAndNavigate(itemName, 1);

        await this.category1.click();
        await this.typeName1.waitFor({ state: 'visible' });
        await this.typeName1.click();
        await this.category2.click();
        await this.typeName2.waitFor({ state: 'visible' });
        await this.typeName2.click();
        await this.category3.click();
        await this.typeName3.waitFor({ state: 'visible' });
        await this.typeName3.click();

        await this.SpecialPack(false);
        await this.phases.click();
        await this.typePhases.click();
        await this.physicochemical.click();
        await this.typePhysicochemical.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
        await this.typePhysicochemical.click();
        await this.Files(false);
        await this.QuantityAndPackaging([v[1]], false);
        await this.instructionsForUse.fill(v[2]);
        await this.exp.click();
        await this.numOfMonth.fill("200");
        await this.frequencyOfUse.click();
        await this.frequencyOfUseName.click();
        await this.AddShades(v[3], false);

        await this.saveDraft.first().click();
        await this.dialog.waitFor({ state: 'visible' });
        const draft2Text = await this.dialog.textContent();
        if (!draft2Text.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 2 נכשלה: ${draft2Text}`);
        this.log.info("✅ טיוטה 2 נשמרה");
        await this.okEnd.click();

        // --- טיוטה 3: שלב חומרים ---
        this.log.info("שלב 3 — חומרים ושמירת טיוטה");
        await this.ReopenDraftAndNavigate(itemName, 2);

        await this.page.waitForTimeout(5000);
        await this.oKmaterials.click();
        await this.page.waitForTimeout(5000);

        await this.saveDraft.first().click();
        await this.dialog.waitFor({ state: 'visible' });
        const draft3Text = await this.dialog.textContent();
        if (!draft3Text.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 3 נכשלה: ${draft3Text}`);
        this.log.info("✅ טיוטה 3 נשמרה");
        await this.okEnd.click();

        // --- טיוטה 4: שלב חומרים המשך (ריק) ---
        this.log.info("שלב 4 — חומרים המשך ושמירת טיוטה");
        await this.ReopenDraftAndNavigate(itemName, 3);

        await this.saveDraft.first().click();
        await this.dialog.waitFor({ state: 'visible' });
        const draft4Text = await this.dialog.textContent();
        if (!draft4Text.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 4 נכשלה: ${draft4Text}`);
        this.log.info("✅ טיוטה 4 נשמרה");
        await this.okEnd.click();

        // --- טיוטה 5: שלב אוכלוסיות יעד ---
        this.log.info("שלב 5 — אוכלוסיות יעד ושמירת טיוטה");
        await this.ReopenDraftAndNavigate(itemName, 4);

        await this.populationTitle.click();
        await this.populationTitleName.click();

        await this.saveDraft.first().click();
        await this.dialog.waitFor({ state: 'visible' });
        const draft5Text = await this.dialog.textContent();
        if (!draft5Text.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 5 נכשלה: ${draft5Text}`);
        this.log.info("✅ טיוטה 5 נשמרה");
        await this.okEnd.click();

        // --- שמירה סופית: שלב ננו ---
        this.log.info("שלב 6 — ננו ושמירה סופית");
        await this.ReopenDraftAndNavigate(itemName, 5);


        await this.noContainNano.click();

        this.log.info("שומר ומוסר - סיום נוטיפיקציה");
        await this.saveSubmit.click();

        if (await this.sharedUtils.isVisibleSafe(this.manufAddress, 2000)) {
            await this.manuftype1.click();
            await this.manufSave.click();
        }
        await this.dialog.waitFor({ state: 'visible' });
        await this.CheckDialog();
        const dialogText = await this.dialog.textContent();
        await this.okEnd.click();
        await this.page.waitForTimeout(5000);
        return dialogText;
    }

    GenerateMaxCharString(allowedChars, maxLength) {
        if (!allowedChars) return '1'.repeat(maxLength);
        let result = '';
        while (result.length < maxLength) {
            result += allowedChars;
        }
        return result.substring(0, maxLength);
    }

    async CreateNotificationMaxValidData(itemName = "") {
        this.log.info("מתחיל יצירת נוטיפיקציה - בדיקת שליחה עם מקסימום תווים מורשים");
        
        // פתיחת הפריט (כנציג אחראי)
        await this.regulationItemPage.OpenItem1("", "", itemName, "פריט רגיל", 'לאישור נציג אחראי', "approve", true);

        // יצרן בחו"ל
        await this.overseasManufacturerAbroad.click();
        
        const manufName = this.GenerateMaxCharString(this.env.charManufactor, 200);
        await this.manufacturerName.fill(manufName);

        await this.addressType.click();
        await this.otherAddress.click();
        
        const otherAddr = this.GenerateMaxCharString(this.env.charOtherAddress, 400);
        await this.otherAddressType.fill(otherAddr);

        await this.country.click();
        await this.countryName.click();

        const cityVal = this.GenerateMaxCharString(this.env.charNotification, 50);
        await this.city.fill(cityVal);
        
        const streetVal = this.GenerateMaxCharString(this.env.charNotification, 50);
        await this.street.fill(streetVal);

        const houseNumVal = this.GenerateMaxCharString(this.env.charBusinessId, 10);
        await this.houseNum.fill(houseNumVal);

        const zipCodeVal = this.GenerateMaxCharString(this.env.charBusinessId, 10);
        await this.zipCode.fill(zipCodeVal);

        const addrNotesVal = this.GenerateMaxCharString(this.env.charNotification, 200);
        await this.addressNotes.fill(addrNotesVal);

        await this.cosmeticImport.click();
        await this.cosmeticImportValue3.click();
        await this.cosmeticImportValue3CheckBox1.click();
        await this.cosmeticImportValue3CheckBox2.click();

        await this.nextStep.click();

        // קטגוריות
        await this.category1.click();
        await this.typeName1.waitFor({ state: 'visible' });
        await this.typeName1.click();
        await this.category2.click();
        await this.typeName2.waitFor({ state: 'visible' });
        await this.typeName2.click();
        await this.category3.click();
        await this.typeName3.waitFor({ state: 'visible' });
        await this.typeName3.click();

        // מאפייני התמרוק - אריזה מיוחדת
        await this.specialPackCheckBox.click();
        await this.specialPack.click();
        await this.specialPackValue.click();
        const otherSpecialPackVal = this.GenerateMaxCharString(this.env.charNotification, 50);
        await this.otherspecialPack.fill(otherSpecialPackVal);

        await this.washable.click();
        await this.granules.click();

        // תיאור התמרוק
        await this.phases.click();
        await this.typePhases.click();
        await this.physicochemical.click();
        await this.typePhysicochemical.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
        await this.typePhysicochemical.click();

        // קבצים
        await this.Files(false);

        // כמות ואריזה
        await this.packType.click();
        await this.packTypeName.click();
        await this.unitType.click();
        await this.unitTypeName.click();
        await this.amount.fill("100");
        const barcodeVal = this.GenerateMaxCharString(this.env.charBusinessId, 9);
        await this.barcode.fill(barcodeVal);

        const instructionsVal = this.GenerateMaxCharString(this.env.charNotification, 4000);
        await this.instructionsForUse.fill(instructionsVal);

        // תוקף המוצר
        await this.exp.click();
        const monthVal = "120"; 
        await this.numOfMonth.fill(monthVal);

        await this.frequencyOfUse.click();
        await this.frequencyOfUseName.click();

        // גוונים
        await this.yesShades.click();
        const shadeVal = this.GenerateMaxCharString(this.env.charNotification, 50);
        await this.shadesName.fill(shadeVal);
        await this.selectFileShades.click();
        await this.filesPage.AtachFile(this.typeFileShades, "Doc1.pdf", "גוון");
        await this.selectColor.click();
        await this.colorWhite.click();
        await this.vehicleType.click();
        await this.vehicleTypeName.click();
        await this.page.waitForTimeout(1000);
        await this.addShade.click();

        await this.nextStep.click();

        // חומרים
        await this.page.waitForTimeout(5000);
        await this.oKmaterials.click();
        await this.page.waitForTimeout(5000);
        await this.nextStep.click();
        await this.nextStep.click();

        // טענות שיווקיות
        await this.panelOther.click();
        await this.panelOtherCheckBox.click();
        const otherClaimVal = this.GenerateMaxCharString(this.env.charNotification, 200);
        await this.panelOtherValue.fill(otherClaimVal);

        // אוכלוסית יעד
        await this.populationTitle.click();
        await this.populationTitleName.click();

        // סטטוס הפצה
        await this.distributionStatusCheckBox.click();
        await this.distributionStatus.click();
        const distStatusVal = this.GenerateMaxCharString(this.env.charNotification, 50);
        await this.distributionStatusValue.fill(distStatusVal);

        await this.nextStep.click();

        // ננו
        await this.noContainNano.click();
        await this.saveSubmit.click();

        if (await this.sharedUtils.isVisibleSafe(this.manufAddress, 2000)) {
            await this.manuftype1.click();
            await this.manufSave.click();
        }
        await this.dialog.waitFor({ state: 'visible' });
        await this.CheckDialog();
    }

    async CreateNotificationFull(flug = true) {
        const value = '1'.repeat(50);
        const h = '1'.repeat(2000);
        const v = await this.ReadValues("full.txt");

        await this.Open();
        //יצרן בחו"ל
        if (flug) {
            await this.OverseasManufacturerAbroad(v[0], v[1], v[2], v[3], v[4], v[5], true);
        } else {
            await this.OverseasManufacturerAbroad(value, value, value, "45", "777", value, false);
        }
        await this.nextStep.click();
        //קטגוריות
        await this.category1.click();
        await this.typeName1.waitFor({ state: 'visible' });
        await this.typeName1.click();
        await this.category2.click();
        await this.typeName2.waitFor({ state: 'visible' });
        await this.typeName2.click();
        await this.category3.click();
        await this.typeName3.waitFor({ state: 'visible' });
        await this.typeName3.click();
        //מאפייני התמרוק
        await this.washable.click();
        await this.granules.click();
        //תיאור התמרוק
        await this.phases.click();
        await this.typePhases.click();
        await this.physicochemical.click();
        await this.typePhysicochemical.click();
        //קבצים
        await this.Files(flug);
        //כמות ואריזה
        await this.QuantityAndPackaging([v[8], v[9]], flug);
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.instructionsForUse, "הוראות שימוש", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.instructionsForUse, 4000, "הוראות שימוש");
            await this.instructionsForUse.fill(v[10]);
        } else {
            await this.instructionsForUse.fill(h);
        }
        //תוקף המוצר
        await this.exp.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.numOfMonth, "מספר חודשים", this.env.charBusinessId);
            await this.sharedUtils.CheckMaxLength(this.numOfMonth, 3, "מספר חודשים");
        }
        await this.numOfMonth.fill("200");
        await this.frequencyOfUse.click();
        await this.frequencyOfUseName.click();
        //גוונים
        if (flug) {
            await this.AddShades(v[11], true);
        } else {
            await this.AddShades(value, false);
        }
        await this.AddXSades(25, 10);
        await this.nextStep.click();
        //חומרים
        await this.page.waitForTimeout(2000);
        await this.oKmaterials.click();
        await this.nextStep.click();
        await this.nextStep.click();
        //טענות שיווקיות
        await this.panelOther.click();
        await this.panelOtherCheckBox.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.panelOtherValue, "טענה שיווקית אחרת", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.panelOtherValue, 200, "טענה שיווקית אחרת");
            await this.panelOtherValue.fill(v[12]);
        } else {
            await this.panelOtherValue.fill(value);
        }
        //אוכלוסית יעד
        await this.populationTitle.click();
        await this.populationTitleName.click();
        //סטטוס הפצה
        await this.distributionStatusCheckBox.click();
        await this.distributionStatus.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.distributionStatusValue, "סטטוס הפצה", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.distributionStatusValue, 50, "סטטוס הפצה");
        }
        await this.distributionStatusValue.fill(v[12] || "");
        await this.nextStep.click();
        //ננו
        await this.noContainNano.click();
        await this.saveSubmit.click();
        await this.dialog.waitFor({ state: 'visible' });
        await this.CheckDialog();
        await this.okEnd.click();
        await this.page.waitForTimeout(5000);
    }

    async CreateNotificationCharAndMaxTest(itemName = "") {
        this.log.info("מתחיל יצירת נוטיפיקציה - בדיקת תווים + מקסימום תווים בכל שדה");

        await this.regulationItemPage.OpenItem1("", "", itemName, "פריט רגיל", 'לאישור נציג אחראי', "approve", true);

        // --- שלב 1: יצרן בחו"ל ---
        await this.overseasManufacturerAbroad.click();

        const manufAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.manufacturerName, "שם יצרן בחול");
        await this.sharedUtils.CheckMaxLength(this.manufacturerName, 200, "שם יצרן בחול");
        await this.manufacturerName.fill(this.GenerateMaxCharString(manufAllowed || "A", 200));

        await this.addressType.click();
        await this.otherAddress.click();

        const otherAddrAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.otherAddressType, "סוג כתובת אחר");
        await this.sharedUtils.CheckMaxLength(this.otherAddressType, 400, "סוג כתובת אחר");
        await this.otherAddressType.fill(this.GenerateMaxCharString(otherAddrAllowed || "A", 400));

        await this.country.click();
        await this.countryName.click();

        const cityAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.city, "עיר/ישוב");
        await this.sharedUtils.CheckMaxLength(this.city, 50, "עיר/ישוב");
        await this.city.fill(this.GenerateMaxCharString(cityAllowed || "A", 50));

        const streetAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.street, "רחוב");
        await this.sharedUtils.CheckMaxLength(this.street, 50, "רחוב");
        await this.street.fill(this.GenerateMaxCharString(streetAllowed || "A", 50));

        const houseNumAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.houseNum, "מספר בית");
        await this.sharedUtils.CheckMaxLength(this.houseNum, 10, "מספר בית");
        await this.houseNum.fill(this.GenerateMaxCharString(houseNumAllowed || "1", 10));

        const zipCodeAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.zipCode, "מיקוד");
        await this.sharedUtils.CheckMaxLength(this.zipCode, 10, "מיקוד");
        await this.zipCode.fill(this.GenerateMaxCharString(zipCodeAllowed || "1", 10));

        const addrNotesAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.addressNotes, "הערות לכתובת");
        await this.sharedUtils.CheckMaxLength(this.addressNotes, 200, "הערות לכתובת");
        await this.addressNotes.fill(this.GenerateMaxCharString(addrNotesAllowed || "A", 200));

        await this.cosmeticImport.click();
        await this.cosmeticImportValue3.click();
        await this.cosmeticImportValue3CheckBox1.click();
        await this.cosmeticImportValue3CheckBox2.click();

        await this.nextStep.click();

        // --- שלב 2: קטגוריות ---
        await this.category1.click();
        await this.typeName1.waitFor({ state: 'visible' });
        await this.typeName1.click();
        await this.category2.click();
        await this.typeName2.waitFor({ state: 'visible' });
        await this.typeName2.click();
        await this.category3.click();
        await this.typeName3.waitFor({ state: 'visible' });
        await this.typeName3.click();

        // --- שלב 3: מאפיינים ---
        await this.specialPackCheckBox.click();
        await this.specialPack.click();
        await this.specialPackValue.click();

        const otherSpecialPackAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.otherspecialPack, "אריזה מיוחדת אחר");
        await this.sharedUtils.CheckMaxLength(this.otherspecialPack, 50, "אריזה מיוחדת אחר");
        await this.otherspecialPack.fill(this.GenerateMaxCharString(otherSpecialPackAllowed || "A", 50));

        // --- שלב 4: תיאור התמרוק ---
        await this.phases.click();
        await this.typePhases.click();
        await this.physicochemical.click();
        await this.typePhysicochemical.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
        await this.typePhysicochemical.click();

        // --- שלב 5: קבצים ---
        await this.Files(false);

        // --- שלב 6: כמות ואריזה ---
        await this.packType.click();
        await this.packTypeName.click();
        await this.unitType.click();
        await this.unitTypeName.click();
        await this.amount.fill("10");

        const barcodeAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.barcode, "ברקוד");
        await this.sharedUtils.CheckMaxLength(this.barcode, 9, "ברקוד");
        await this.barcode.fill(this.GenerateMaxCharString(barcodeAllowed || "1", 9));

        // הוראות שימוש — textarea: תווים + ירידת שורה + מקסימום
        const instrAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.instructionsForUse, "הוראות שימוש");
        const instrNewline = await this.sharedUtils.CheckNewlineAllowed(this.instructionsForUse, "הוראות שימוש");
        await this.sharedUtils.CheckMaxLength(this.instructionsForUse, 4000, "הוראות שימוש");
        const instrBase = this.GenerateMaxCharString(instrAllowed || "A", instrNewline ? 1999 : 4000);
        await this.instructionsForUse.fill(instrNewline ? instrBase + "\n" + instrBase : instrBase);

        // --- שלב 7: תוקף ---
        await this.exp.click();
        await this.numOfMonth.fill("120");
        await this.frequencyOfUse.click();
        await this.frequencyOfUseName.click();

        // --- שלב 8: גוונים ---
        await this.yesShades.click();
        const shadeNameAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.shadesName, "שם הגוון");
        await this.sharedUtils.CheckMaxLength(this.shadesName, 50, "שם הגוון");
        await this.shadesName.fill(this.GenerateMaxCharString(shadeNameAllowed || "A", 50));
        await this.filesPage.AtachFile(this.typeFileShades, "Doc1.pdf", "גוון");
        await this.selectColor.click();
        await this.colorWhite.click();
        await this.vehicleType.click();
        await this.vehicleTypeName.click();
        await this.page.waitForTimeout(1000);
        await this.addShade.click();

        await this.nextStep.click();

        // --- שלב 9: חומרים ---
        await this.page.waitForTimeout(5000);
        await this.oKmaterials.click();
        await this.page.waitForTimeout(5000);
        await this.nextStep.click();
        await this.nextStep.click();

        // --- שלב 10: טענות שיווקיות ---
        await this.panelOther.click();
        await this.panelOtherCheckBox.click();
        const otherClaimAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.panelOtherValue, "טענה שיווקית אחרת");
        await this.sharedUtils.CheckMaxLength(this.panelOtherValue, 200, "טענה שיווקית אחרת");
        await this.panelOtherValue.fill(this.GenerateMaxCharString(otherClaimAllowed || "A", 200));

        // --- שלב 11: אוכלוסיות יעד ---
        await this.populationTitle.click();
        await this.populationTitleName.click();

        await this.nextStep.click();

        // --- שלב 12: ננו ושמירה ---
        await this.noContainNano.click();
        await this.page.keyboard.press('F12');
        await this.page.pause();
        await this.saveSubmit.click();
        await this.page.pause();

        if (await this.sharedUtils.isVisibleSafe(this.manufAddress, 2000)) {
            await this.manuftype1.click();
            await this.manufSave.click();
        }
        await this.dialog.waitFor({ state: 'visible' });
        await this.CheckDialog();
    }

    async CreateNotificationCharTest(itemName = "") {
        this.log.info("מתחיל יצירת נוטיפיקציה - בדיקת תווים מאופשרים בכל שדה");

        await this.regulationItemPage.OpenItem1("", "", itemName, "פריט רגיל", 'לאישור נציג אחראי', "approve", true);

        // --- שלב 1: יצרן בחו"ל ---
        await this.overseasManufacturerAbroad.click();

        const manufNameAllowed    = await this.sharedUtils.CheckCharactersAndGetAllowed(this.manufacturerName,   "שם יצרן בחול");
        await this.manufacturerName.fill(manufNameAllowed || "A");

        await this.addressType.click();
        await this.otherAddress.click();

        const otherAddrAllowed    = await this.sharedUtils.CheckCharactersAndGetAllowed(this.otherAddressType,   "סוג כתובת אחר");
        await this.otherAddressType.fill(otherAddrAllowed || "A");

        await this.country.click();
        await this.countryName.click();

        const cityAllowed         = await this.sharedUtils.CheckCharactersAndGetAllowed(this.city,               "עיר/ישוב");
        await this.city.fill(cityAllowed || "A");

        const streetAllowed       = await this.sharedUtils.CheckCharactersAndGetAllowed(this.street,             "רחוב");
        await this.street.fill(streetAllowed || "A");

        const houseNumAllowed     = await this.sharedUtils.CheckCharactersAndGetAllowed(this.houseNum,           "מספר בית");
        await this.houseNum.fill(houseNumAllowed || "1");

        const zipCodeAllowed      = await this.sharedUtils.CheckCharactersAndGetAllowed(this.zipCode,            "מיקוד");
        await this.zipCode.fill(zipCodeAllowed || "1");

        const addrNotesAllowed    = await this.sharedUtils.CheckCharactersAndGetAllowed(this.addressNotes,       "הערות לכתובת");
        await this.addressNotes.fill(addrNotesAllowed || "A");

        await this.cosmeticImport.click();
        await this.cosmeticImportValue3.click();
        await this.cosmeticImportValue3CheckBox1.click();
        await this.cosmeticImportValue3CheckBox2.click();

        await this.nextStep.click();

        // --- שלב 2: קטגוריות ---
        await this.category1.click();
        await this.typeName1.waitFor({ state: 'visible' });
        await this.typeName1.click();
        await this.category2.click();
        await this.typeName2.waitFor({ state: 'visible' });
        await this.typeName2.click();
        await this.category3.click();
        await this.typeName3.waitFor({ state: 'visible' });
        await this.typeName3.click();

        // --- שלב 3: מאפיינים ---
        await this.specialPackCheckBox.click();
        await this.specialPack.click();
        await this.specialPackValue.click();

        const otherSpecialPackAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.otherspecialPack, "אריזה מיוחדת אחר");
        await this.otherspecialPack.fill(otherSpecialPackAllowed || "A");

        // --- שלב 4: תיאור התמרוק ---
        await this.phases.click();
        await this.typePhases.click();
        await this.physicochemical.click();
        await this.typePhysicochemical.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
        await this.typePhysicochemical.click();

        // --- שלב 5: קבצים ---
        await this.Files(false);

        // --- שלב 6: כמות ואריזה ---
        await this.packType.click();
        await this.packTypeName.click();
        await this.unitType.click();
        await this.unitTypeName.click();
        await this.amount.fill("10");

        const barcodeAllowed      = await this.sharedUtils.CheckCharactersAndGetAllowed(this.barcode,            "ברקוד");
        await this.barcode.fill(barcodeAllowed || "1");

        // הוראות שימוש - שדה textarea ארוך: בודקים גם תווים וגם ירידת שורה
        const instrAllowed        = await this.sharedUtils.CheckCharactersAndGetAllowed(this.instructionsForUse,  "הוראות שימוש");
        const instrNewline        = await this.sharedUtils.CheckNewlineAllowed(this.instructionsForUse,           "הוראות שימוש");
        const instrValue          = instrNewline
            ? (instrAllowed || "A") + "\n" + (instrAllowed || "A")
            : (instrAllowed || "A");
        await this.instructionsForUse.fill(instrValue);

        // --- שלב 7: תוקף ---
        await this.exp.click();
        await this.numOfMonth.fill("12");
        await this.frequencyOfUse.click();
        await this.frequencyOfUseName.click();

        // --- שלב 8: גוונים ---
        await this.yesShades.click();
        const shadeNameAllowed    = await this.sharedUtils.CheckCharactersAndGetAllowed(this.shadesName,         "שם הגוון");
        await this.shadesName.fill(shadeNameAllowed || "A");
        await this.filesPage.AtachFile(this.typeFileShades, "Doc1.pdf", "גוון");
        await this.selectColor.click();
        await this.colorWhite.click();
        await this.vehicleType.click();
        await this.vehicleTypeName.click();
        await this.page.waitForTimeout(1000);
        await this.addShade.click();

        await this.nextStep.click();

        // --- שלב 9: חומרים ---
        await this.page.waitForTimeout(5000);
        await this.oKmaterials.click();
        await this.page.waitForTimeout(5000);
        await this.nextStep.click();
        await this.nextStep.click();

        // --- שלב 10: טענות שיווקיות ---
        await this.panelOther.click();
        await this.panelOtherCheckBox.click();
        const otherClaimAllowed   = await this.sharedUtils.CheckCharactersAndGetAllowed(this.panelOtherValue,    "טענה שיווקית אחרת");
        await this.panelOtherValue.fill(otherClaimAllowed || "A");

        // --- שלב 11: אוכלוסיות יעד ---
        await this.populationTitle.click();
        await this.populationTitleName.click();

        // סטטוס הפצה - מושבת בינתיים (לוקטור לא תקין)
        // await this.distributionStatusCheckBox.click();
        // await this.distributionStatus.click();
        // await this.distributionStatusValue.click();

        await this.nextStep.click();

        // --- שלב 12: ננו ושמירה ---
        await this.noContainNano.click();
        await this.page.keyboard.press('F12');
        await this.page.pause();
        await this.saveSubmit.click();
        await this.page.pause();

        if (await this.sharedUtils.isVisibleSafe(this.manufAddress, 2000)) {
            await this.manuftype1.click();
            await this.manufSave.click();
        }
        await this.dialog.waitFor({ state: 'visible' });
        await this.CheckDialog();
    }

    async EditNotificationX(i = 20, n = true, nameItem = "parit") {
        if (n) {
            await this.regulationItemPage.AddItem(nameItem, "TTT", 0, false);
            this.log.info("גרסה 1");
            await this.regulationItemPage.OpenItem1("דיפולט", "דיפולט", nameItem, "פריט רגיל", "נוטיפיקציה הושלמה");
            await this.CreateNotificationSanity(false);
            await this.okEnd.click();
            await this.page.waitForTimeout(5000);
        }

        for (let j = 0; j < i; j++) {
            this.log.info(`גרסה ${j + 2}`);
            if (j === 0) {
                await this.regulationItemPage.OpenItem1("דיפולט", "דיפולט", nameItem, "פריט רגיל", "נוטיפיקציה הושלמה");
            } else {
                await this.regulationItemPage.OpenItem1("דיפולט", "דיפולט", nameItem, "פריט רגיל", "נוטיפיקציה הושלמה", false);
            }
            await this.nextStep.click();
            await this.AddXSades(5, 0, `גוון ${j + 1}`);
            await this.nextStep.click();
            await this.nextStep.click();
            await this.nextStep.click();
            await this.nextStep.click();
            await this.saveSubmit.click();
            await this.page.waitForTimeout(3000);
            if (await this.sharedUtils.isVisibleSafe(this.manufAddress, 2000)) {
                await this.manuftype1.click();
                await this.manufSave.click();
                await this.page.waitForTimeout(2000);
            }
            await this.noteEdit.fill(`עדכון ${j + 1}`);
            await this.manufSave.click();
            await this.page.waitForTimeout(5000);
            await this.CheckDialog();
            await this.okEnd.click();
            await this.page.waitForTimeout(10000);
        }
    }
}

module.exports = RegulationNotificationPage;