const SharedUtils = require('./SharedUtils');
const FilesPage = require('./Files');
const path = require('path');

class ProperNotificationPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        this.sharedUtils = new SharedUtils(page, po, env, log);
        this.files = new FilesPage(page, po, env, log);

        // Locators
        this.rpRole = this.page.locator('//*[contains(text(), "נציג אחראי")]');
        this.row = this.page.locator('//mat-row[@role="row"][1]');
        this.createN = this.page.locator('//button[@class="primary-btn"]');
        this.noNatification = this.page.locator('//*[text()="2089"]');
        this.noNotification2 = this.page.locator('//*[text()="2035"]');
        this.nextStep2 = this.page.locator('//*[@class="grid_ar_prev md moh-icon page-button"]');
        this.nekutot = this.page.locator('//*[@class="more-btn ng-star-inserted"]');
        this.edit2 = this.page.locator('//*[text()="עריכה"]');
        this.manufactureCountry = this.page.locator('//input[@aria-label="מדינת ייצור התמרוק"]');
        this.manufactureCyprus = this.page.locator('//*[contains(text(), "קפריסין")]//..//span');
        this.importingCountry = this.page.locator('//input[@aria-label="מדינת הייבוא"]');
        this.importingCyprus = this.page.locator('//*[contains(text(), "קפריסין")]//..//span');
        this.importingCyprus2 = this.page.locator('//*[contains(text(), "ארמניה")]//..//span');
        this.manufacturerName = this.page.locator('//input[@aria-label="שם יצרן"]');
        this.supplierName = this.page.locator('//input[@aria-label="שם ספק"]');
        this.addressType = this.page.locator('//input[@aria-label="סוג כתובת"]');
        this.manufacturingType = this.page.locator('//*[contains(text(), "כתובת אתר הייצור")]//..//span');
        this.country = this.page.locator('//input[@aria-label="מדינה"]');
        this.countryCyprus = this.page.locator('//*[contains(text(), "קפריסין")]//..//span');
        this.city = this.page.locator('//input[@aria-label="עיר/יישוב"]');
        this.street = this.page.locator('//input[@aria-label="רחוב"]');
        this.buildingNumber = this.page.locator('//input[@aria-label="מספר בית"]');
        this.zipCode = this.page.locator('//input[@aria-label="מיקוד"]');
        this.addressNotes = this.page.locator('//input[@aria-label="הערות לכתובת"]');
        this.productManufacturerName = this.page.locator('//input[@aria-label="שם יצרן התמרוק"]');
        this.yesFirstQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properEUAlerts"]//*[text()="כן"]');
        this.noFirstQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properEUAlerts"]//*[text()="לא"]');
        this.yesSecondQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properSafe"]//*[text()="כן"]');
        this.noSecondQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properSafe"]//*[text()="לא"]');
        this.yesThirdQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properFile"]//*[text()="כן"]');
        this.noThirdQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properFile"]//*[text()="לא"]');
        this.yesFourthQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properCannabidiol"]//*[text()="כן"]');
        this.noFourthQuestion = this.page.locator('//moh-button-toggle[@formcontrolname="properCannabidiol"]//*[text()="לא"]');
        this.languageReferenceCountry = this.page.locator('//input[@aria-label="שם התמרוק בשפת מדינת ההסתמכות בה התמרוק משווק"]');
        this.cosmeticCategory1 = this.page.locator('//input[@aria-label="קטגוריית תמרוק 1"]');
        this.category1Skin = this.page.locator('//*[contains(text(), "מוצרים לעור")]//..//span');
        this.cosmeticCategory2 = this.page.locator('//input[@aria-label="קטגוריית תמרוק 2"]');
        this.category2Makeup = this.page.locator('//*[contains(text(), "איפור")]//..//span');
        this.cosmeticCategory3 = this.page.locator('//input[@aria-label="קטגוריית תמרוק 3"]');
        this.category3Mascara = this.page.locator('//*[contains(text(), "מסקרה")]//..//span');
        this.category3Other = this.page.locator('//*[contains(text(), " אחר ")]//..//span');
        this.otherCosmeticCategory3 = this.page.locator('//input[@aria-label="קטגוריית תמרוק 3 אחר"]');
        this.yesKit = this.page.locator('//button[@aria-label="כן"]');
        this.selectKit = this.page.locator('//input[@ng-reflect-placeholder="בחר ערכה"]');
        this.newKit = this.page.locator('//span[normalize-space(.)="חדש"]');
        this.newKitName = this.page.locator('//input[@ng-reflect-placeholder="שם ערכה חדש"]');
        this.kitBarcode = this.page.locator('//input[@ng-reflect-placeholder="מספר ברקוד"]');
        this.kitFile = this.page.locator('//span[normalize-space(text())="בחר קובץ"]');
        this.chooseFile = this.page.locator('//span[normalize-space(text())= "בחר קובץ תמונה לערכה"]');
        this.addKit = this.page.locator('//moh-button[@ng-reflect-text-key="addKit"]');
        this.washableProduct = this.page.locator('//input[@formcontrolname="canWash"]');
        this.numberOfPhases = this.page.locator('//input[@aria-label="מספר פאזות"]');
        this.phases2 = this.page.locator('//mat-option[.//span[normalize-space(.)="2"]]');
        this.physicochemicalProperties = this.page.locator('//input[@aria-label="מאפיינים פיזיקוכימיים"]');
        this.creamProperty = this.page.locator('//span[normalize-space(text())= "קרם"]');
        this.allAngles = this.page.locator('//moh-button[@ng-reflect-text="בחר קבצים"]');
        this.productLabel = this.page.locator('//moh-button[@ng-reflect-text="בחר קובץ"]');
        this.packagingType = this.page.locator('//input[@aria-label="סוג אריזה"]');
        this.glassBottle = this.page.locator('//*[@id="mat-option-620"]');
        this.unitType = this.page.locator('//input[@aria-label="סוג יחידה"]');
        this.gram = this.page.locator('//*[@id="mat-option-670"]');
        this.quantuty = this.page.locator('//input[@aria-label="כמות"]');
        this.barcode = this.page.locator('//input[@aria-label="ברקוד"]');
        this.outerPackaging = this.page.locator('//input[@ng-reflect-text-key="hasSecondPack"]');
        this.instructions = this.page.locator('//textarea[@aria-label="הוראות שימוש"]');
        this.exp = this.page.locator('//moh-radiobutton-group[@formcontrolname="expOrPao"]//input[@value="1"]');
        this.pao = this.page.locator('//moh-radiobutton-group[@formcontrolname="expOrPao"]//input[@value="2"]');
        this.numberOfMonths = this.page.locator('//input[@aria-label="מספר חודשים"]');
        this.frequencyOfUse = this.page.locator('//input[@aria-label="תדירות שימוש"]');
        this.twiceADay = this.page.locator('//span[text()=" שימוש יומיומי "]');
        this.yesShades = this.page.locator('//button[@id="mat-button-toggle-16-button"]');
        this.shade = this.page.locator('//input[@aria-label="שם הגוון"]');
        this.shadesFile = this.page.locator('(//mat-cell//span[text()="בחר קובץ"])[2]');
        this.chooseShadesFile = this.page.locator('//span[normalize-space(text())= "בחר קובץ הרכב לגוון"]');
        this.color = this.page.locator('//ngx-colors[@ng-reflect-name="color"]');
        this.redColor = this.page.locator('//div[contains(@style, "rgb(229, 115, 115)")]');
        this.tatShade = this.page.locator('//div[contains(@style, "rgb(255, 235, 238)")]');
        this.addShade = this.page.locator('//moh-button[@ng-reflect-text-key="addShade"]');
        this.transportationAndStorage = this.page.locator('//input[@aria-label="דרישות הובלה ואחסנה"]');
        this.storageLocation = this.page.locator('//input[@aria-label="מקום אחסון התמרוק בישראל"]');
        this.clinicalTest = this.page.locator('//img[@alt="מבחנים קליניים"]');
        this.alDama = this.page.locator('//input[@aria-label="אל דמע "]');
        this.sensitiveSkin = this.page.locator('//input[@aria-label="מתאים לעור רגיש "]');
        this.dermatologicalltTested = this.page.locator('//input[@aria-label="נבדק דרמטולוגית "]');
        this.jellyfishSting = this.page.locator('//input[@aria-label="צריבת מדוזות "]');
        this.hypoallergenic = this.page.locator('//input[@aria-label="היפואלרגני "]');
        this.sensitiveEyes = this.page.locator('//input[@aria-label="מתאים לעיניים רגישות "]');
        this.clinicallyTested = this.page.locator('//input[@aria-label="נבדק קלינית "]');
        this.contactLensFriendly = this.page.locator('//input[@aria-label="למרכיבי עדשות מגע "]');
        this.ophthalmologicallyTested = this.page.locator('//input[@aria-label="נבדק אופטלמולוגית "]');
        this.nonComedogenic = this.page.locator('//input[@aria-label="נונקומודוגני "]');
        this.uvProtection = this.page.locator('//img[@alt="הגנה מפני השמש"]');
        this.broadSpectrum = this.page.locator('//input[@aria-label="BROAD SPECTRUM רחב טווח "]');
        this.uvaProtection = this.page.locator('//input[@aria-label="הגנה מקרינת UVA"]');
        this.irProtection = this.page.locator('//input[@aria-label="מסייע בהגנה מפני קרינת IR "]');
        this.waterProof = this.page.locator('//input[@aria-label="הגנה מהשמש – עמיד במים WR "]');
        this.containsSPF = this.page.locator('//input[@aria-label="הגנה מקרינת UVB (SPF)"]');
        this.veryWaterProof = this.page.locator('//input[@aria-label="הגנה מהשמש – עמיד מאוד במים  V"]');
        this.containsBlueLight = this.page.locator('//input[@aria-label="מסייע בהגנה מפני אור כחול "]');
        this.oralHygiene = this.page.locator('//img[@alt="היגיינת הפה"]');
        this.oralHygieneAndFreshness = this.page.locator('//input[@aria-label="היגיינת הפה / רענון הפה "]');
        this.preventsBadBreath = this.page.locator('//input[@aria-label="מניעת ריח רע מהפה "]');
        this.teethWhitening = this.page.locator('//input[@aria-label="הלבנת שיניים "]');
        this.fluorideFree = this.page.locator('//input[@aria-label="משחת שיניים ללא פלואוריד "]');
        this.antibacterial = this.page.locator('//input[@aria-label="מניעת עששת / אנטיבקטריאלי "]');
        this.generalClaims = this.page.locator('//img[@alt="טענות כלליות"]');
        this.organic = this.page.locator('//input[@aria-label="אורגני "]');
        this.vegan = this.page.locator('//input[@aria-label="טבעוני "]');
        this.noAllergens = this.page.locator('//input[@aria-label="ללא בישום / ללא אלרגנים "]');
        this.flushableWipes = this.page.locator('//input[@aria-label="מגבונים מתכלים / נשטף באסלה "]');
        this.marineLifeFriendly = this.page.locator('//input[@aria-label="אינו מזיק לסביבה הימית (נטול מ"]');
        this.natural = this.page.locator('//input[@aria-label="טבעי "]');
        this.noParabens = this.page.locator('//input[@aria-label="ללא פרבנים "]');
        this.diabeticFriendly = this.page.locator('//input[@aria-label="מתאים לחולי סכרת "]');
        this.antiperspirant = this.page.locator('//input[@aria-label="אנטיפרספירנט "]');
        this.crueltyFree = this.page.locator('//input[contains(normalize-space(.),"לא נוסה")]');
        this.odorPrevention = this.page.locator('//input[@aria-label="למניעת ריח זיעה "]');
        this.improvesSkinAppearance = this.page.locator('//img[@alt="שיפור מראה העור"]');
        this.antiCellulite = this.page.locator('//input[@aria-label="אנטי צלוליט "]');
        this.antiAging = this.page.locator('//input[@aria-label="מפחית קמטים / צמצום קמטים וקמט"]');
        this.skinBrightening = this.page.locator('//input[@aria-label="הבהרת העור "]');
        this.preventsChafing = this.page.locator('//input[@aria-label="מניעת שפשפות "]');
        this.hairProduct = this.page.locator('//img[@alt="מוצרים לשיער"]');
        this.antiDandruff = this.page.locator('//input[@aria-label="טיפול בקשקשים "]');
        this.scalpHygiene = this.page.locator('//input[@aria-label="היגיינת הראש "]');
        this.preventsHairLoss = this.page.locator('//input[@aria-label="מניעת נשירת שיער "]');
        this.hairStrengthening = this.page.locator('//input[@aria-label="חיזוק סיב השערה "]');
        this.skin = this.page.locator('//img[@alt="עור"]');
        this.handHygiene = this.page.locator('//input[@aria-label="היגיינת הידיים "]');
        this.other = this.page.locator('//img[@alt="אחר"]');
        this.otherCheckbox = this.page.locator('//input[@aria-label="אחר"]');
        this.otherMarketingClaim = this.page.locator('//input[@aria-label="טענה שיווקית אחרת"]');
        this.targetPopulation = this.page.locator('//span[text()="אוכלוסיות יעד *"]');
        this.adultsAbove18 = this.page.locator('//input[@aria-label="מבוגרים מעל גיל 18"]');
        this.womenAbove18 = this.page.locator('//input[@aria-label="נשים מעל גיל 18"]');
        this.menAbove18 = this.page.locator('//input[@type="checkbox" and @aria-label="גברים מעל גיל 18"]');
        this.forAllFamily = this.page.locator('//input[@type="checkbox" and @aria-label="לכל המשפחה"]');
        this.adultsAbove16 = this.page.locator('//input[@type="checkbox" and @aria-label="מבוגרים מעל גיל 16"]');
        this.womenAbove16 = this.page.locator('//input[@type="checkbox" and @aria-label="נשים מעל גיל 16"]');
        this.menAbove16 = this.page.locator('//input[@type="checkbox" and @aria-label="גברים מעל גיל 16"]');
        this.adultsAbove12 = this.page.locator('//input[@type="checkbox" and @aria-label="מבוגרים מעל גיל 12"]');
        this.womenAbove12 = this.page.locator('//input[@type="checkbox" and @aria-label="נשים מעל גיל 12"]');
        this.menAbove12 = this.page.locator('//input[@type="checkbox" and @aria-label="גברים מעל גיל 12"]');
        this.professionalUse = this.page.locator('//input[@type="checkbox" and @aria-label="שימוש מקצועי"]');
        this.distributionDetails = this.page.locator('//span[normalize-space()="פרטי הפצה"]');
        this.distributionStatus = this.page.locator('//input[@aria-label="סטטוס הפצה"]');
        this.marketed = this.page.locator('//span[normalize-space()="משווק"]');
        this.unmarketed = this.page.locator('//span[normalize-space()="ייצור או יבוא תמרוק שטרם שווק"]');
        this.commercialReasons = this.page.locator('//span[normalize-space()="הופסק שיווקו בישראל- מסיבות מסחריות"]');
        this.discontinuedDate = this.page.locator('//button[@aria-label="Open calendar"]');
        this.pickDate = this.page.locator('//span[text()=14]');
        this.cessationReason = this.page.locator('//input[@aria-label="סיבת הפסקת הפצה"]');
        this.recalled = this.page.locator('//span[normalize-space()="בטיחות-הוחזר מהשוק"]');
        this.otherCessationReason = this.page.locator('//mat-option[.//span[normalize-space()="אחר"]]');
        this.otherReasonText = this.page.locator('//textarea[@aria-label="סיבת הפסקת הפצה - אחר"]');
        this.declarationFile = this.page.locator('//moh-button[@ng-reflect-text="בחר קובץ"]');
        this.saveAndSend = this.page.locator('//span[text()="שמור ושלח"]');
        this.saveDraft = this.page.locator('//span[text()="שמירת טיוטה"]');
        this.nextStep = this.page.locator('//span[text()="שלב הבא"]');
        this.tZ = this.page.locator('//*[@aria-label="תעודת זהות"]');
        this.sL = this.page.locator('//*[@aria-label="שנת לידה"]');
        this.bb = this.page.locator('//*[@class="submit-login-year-of-birth w-100"]');
        this.option = this.page.locator('//mat-option');
    }

    async ManufacturAddressProper(v, flug) {
        await this.manufactureCountry.click();
        await this.manufactureCyprus.click();
        await this.importingCountry.click();
        await this.importingCyprus.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.manufacturerName, "שם יצרן", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.manufacturerName, 50, "שם יצרן");
        }
        await this.manufacturerName.fill(v[0]);
        await this.addressType.click();
        await this.manufacturingType.click();
        await this.country.click();
        await this.countryCyprus.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.city, "עיר/יישוב", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.city, 50, "עיר/יישוב");
            await this.sharedUtils.CheckCharacters(this.street, "רחוב", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.street, 50, "רחוב");
            await this.sharedUtils.CheckCharacters(this.buildingNumber, "מספר בית", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.buildingNumber, 50, "מספר בית");
            await this.sharedUtils.CheckCharacters(this.zipCode, "מיקוד", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.zipCode, 50, "מיקוד");
            await this.sharedUtils.CheckCharacters(this.addressNotes, "הערות לכתובת", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.addressNotes, 50, "הערות לכתובת");
        }
        await this.city.fill(v[1]);
        await this.street.fill(v[2]);
        await this.buildingNumber.fill(v[3]);
        await this.zipCode.fill(v[4]);
        await this.addressNotes.fill(v[5]);
    }

    async ClinicalTest(flug = true) {
        try {
            await this.clinicalTest.click();
            await this.alDama.click();
            await this.sensitiveSkin.click();
            await this.dermatologicalltTested.click();
            // await this.jellyfishSting.click();
            // await this.hypoallergenic.click();
            // await this.sensitiveEyes.click();
            // await this.clinicallyTested.click();
            // await this.contactLensFriendly.click();
            // await this.ophthalmologicallyTested.click();
            // await this.nonComedogenic.click();
            // await this.uvProtection.click();
            // await this.broadSpectrum.click();
            // await this.uvaProtection.click();
            // await this.irProtection.click();
            // await this.waterProof.click();
            // await this.containsSPF.click();
            // await this.veryWaterProof.click();
            // await this.containsBlueLight.click();
            // await this.oralHygiene.click();
            // await this.oralHygieneAndFreshness.click();
            // await this.preventsBadBreath.click();
            // await this.teethWhitening.click();
            // await this.fluorideFree.click();
            // await this.antibacterial.click();
            // await this.generalClaims.click();
            // await this.organic.click();
            // await this.vegan.click();
            // await this.noAllergens.click();
            // await this.flushableWipes.click();
            // await this.marineLifeFriendly.click();
            // await this.natural.click();
            // await this.noParabens.click();
            // await this.diabeticFriendly.click();
            // await this.antiperspirant.click();
            // await this.crueltyFree.click();
            // await this.odorPrevention.click();
            // await this.improvesSkinAppearance.click();
            // await this.antiCellulite.click();
            // await this.antiAging.click();
            // await this.skinBrightening.click();
            // await this.preventsChafing.click();
            // await this.hairProduct.click();
            // await this.antiDandruff.click();
            // await this.scalpHygiene.click();
            // await this.preventsHairLoss.click();
            // await this.hairStrengthening.click();
            // await this.skin.click();
            // await this.handHygiene.click();
            // await this.other.click();
            // await this.otherCheckbox.click();
            if (flug) {
                await this.sharedUtils.CheckCharacters(this.otherMarketingClaim, "טענה שיווקית אחרת", this.env.charNotification);
                await this.sharedUtils.CheckMaxLength(this.otherMarketingClaim, 50, "טענה שיווקית אחרת");
            }
            // await this.otherMarketingClaim.fill("טענה שיווקית אחרת אוטומציה");
        } catch (err) {
            this.log.error(err.message);
        }
    }

    async TargetPopulation() {
        try {
            await this.targetPopulation.click();
            await this.womenAbove18.click();
            await this.menAbove18.click();
            await this.forAllFamily.click();
            await this.adultsAbove16.click();
            await this.womenAbove16.click();
            await this.menAbove16.click();
            await this.adultsAbove12.click();
            await this.womenAbove12.click();
            await this.menAbove12.click();
        } catch (err) {
            this.log.error(err.message);
        }
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
                if (await this.sharedUtils.isVisibleSafe('//button[@class="primary-btn"]', 2000)) {
                    await this.page.locator('//button[@class="primary-btn"]').click();
                } else if (await this.sharedUtils.isVisibleSafe('//button[@class="more-btn ng-star-inserted"]', 2000)) {
                    await this.page.locator('//button[@class="more-btn ng-star-inserted"]').click();
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

    async CreateProperNotificationWithDrafts(itemName = "") {
        this.log.info("מתחיל יצירת נוטיפיקציה נאותה - שמירת טיוטה בכל שלב");
        const v = await this.sharedUtils.ReadFileComment(require('path').join(this.po.dataFolder, "proper.txt"));
        const RegulationItemPage = require('./RegulationItem');
        const regulationItemPage = new RegulationItemPage(this.page, this.po, this.env, this.log);

        // --- טיוטה 1: יצרן התמרוק ---
        this.log.info("טיוטה 1 — יצרן התמרוק");
        await regulationItemPage.OpenItem1("", "", itemName, "פריט נאות", 'לאישור נציג אחראי', "approve", true);

        await this.ManufacturAddressProper([v[0], v[1], v[2], v[3], v[4], v[5]], false);
        await this.noFirstQuestion.click();
        await this.noSecondQuestion.click();
        await this.noThirdQuestion.click();
        await this.noFourthQuestion.click();
        await this.languageReferenceCountry.fill(v[6]);

        await this.saveDraft.click();
        await this.page.locator('//*[@role="dialog"]').waitFor({ state: 'visible' });
        const d1 = await this.page.locator('//*[@role="dialog"]').textContent();
        if (!d1.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 1 נכשלה: ${d1}`);
        this.log.info("✅ טיוטה 1 נשמרה");
        await this.page.locator('//button[@class="main-button narrow"]').click();

        // --- טיוטה 2: פרטי התמרוק ---
        this.log.info("טיוטה 2 — פרטי התמרוק");
        await this.ReopenDraftAndNavigate(itemName, 1);

        await this.cosmeticCategory1.click();
        await this.category1Skin.waitFor({ state: 'visible' });
        await this.category1Skin.click();
        await this.cosmeticCategory2.click();
        await this.category2Makeup.waitFor({ state: 'visible' });
        await this.category2Makeup.click();
        await this.cosmeticCategory3.click();
        await this.category3Other.waitFor({ state: 'visible' });
        await this.category3Other.click();
        await this.otherCosmeticCategory3.fill(v[7]);

        await this.numberOfPhases.click();
        await this.phases2.click();
        await this.physicochemicalProperties.click();
        await this.creamProperty.click();

        if (this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.Files(false);
            await this.po.regulationNotification.QuantityAndPackaging([v[10]], false);
        }

        await this.instructions.fill(v[12]);
        await this.pao.click();
        await this.numberOfMonths.fill(v[13]);
        await this.frequencyOfUse.click();
        await this.twiceADay.click();

        if (this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.AddShades(v[14], false, 0);
        }

        await this.transportationAndStorage.fill(v[15]);
        await this.storageLocation.click();
        await this.page.locator('mat-option').first().click();

        await this.saveDraft.click();
        await this.page.locator('//*[@role="dialog"]').waitFor({ state: 'visible' });
        const d2 = await this.page.locator('//*[@role="dialog"]').textContent();
        if (!d2.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 2 נכשלה: ${d2}`);
        this.log.info("✅ טיוטה 2 נשמרה");
        await this.page.locator('//button[@class="main-button narrow"]').click();

        // --- טיוטה 3: אוכלוסיות יעד ---
        this.log.info("טיוטה 3 — אוכלוסיות יעד");
        await this.ReopenDraftAndNavigate(itemName, 2);

        await this.ClinicalTest(false);
        await this.TargetPopulation();
        await this.distributionDetails.click();
        await this.distributionStatus.click();
        await this.commercialReasons.click();
        await this.discontinuedDate.click();
        await this.pickDate.click();
        await this.cessationReason.click();
        await this.otherCessationReason.click();
        await this.otherReasonText.fill(v[17]);
        await this.page.waitForTimeout(2000);

        await this.saveDraft.click();
        await this.page.locator('//*[@role="dialog"]').waitFor({ state: 'visible' });
        const d3 = await this.page.locator('//*[@role="dialog"]').textContent();
        if (!d3.includes("נשמרה בהצלחה")) throw new Error(`טיוטה 3 נכשלה: ${d3}`);
        this.log.info("✅ טיוטה 3 נשמרה");
        await this.page.locator('//button[@class="main-button narrow"]').click();

        // --- שמירה סופית: הצהרה ---
        this.log.info("טיוטה 4 — הצהרה ושמירה סופית");
        await this.ReopenDraftAndNavigate(itemName, 3);

        await this.files.AtachFile();
        await this.saveAndSend.click();

        const dialog = this.po?.regulationNotification?.dialog || this.page.locator('//*[@role="dialog"]');
        await dialog.waitFor({ state: 'visible' });
        const finalText = await dialog.textContent();
        this.log.info(finalText);
        await this.page.locator('//button[@class="main-button narrow"]').click();
        return finalText;
    }

    GenerateMaxCharString(allowedChars, maxLength) {
        if (!allowedChars) return 'A'.repeat(maxLength);
        let result = '';
        while (result.length < maxLength) result += allowedChars;
        return result.substring(0, maxLength);
    }

    async CreateProperNotificationCharAndMaxTest(itemName = "") {
        this.log.info("מתחיל יצירת נוטיפיקציה נאותה - בדיקת תווים + מקסימום תווים בכל שדה");

        const RegulationItemPage = require('./RegulationItem');
        const regulationItemPage = new RegulationItemPage(this.page, this.po, this.env, this.log);
        await regulationItemPage.OpenItem1("", "", itemName, "פריט נאות", 'לאישור נציג אחראי', "approve", true);

        // --- שלב 1: כתובת יצרן ---
        await this.manufactureCountry.click();
        await this.manufactureCyprus.click();
        await this.importingCountry.click();
        await this.importingCyprus.click();

        const manufAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.manufacturerName, "שם יצרן");
        await this.sharedUtils.CheckMaxLength(this.manufacturerName, 50, "שם יצרן");
        await this.manufacturerName.fill(this.GenerateMaxCharString(manufAllowed, 50));

        await this.addressType.click();
        await this.manufacturingType.click();
        await this.country.click();
        await this.countryCyprus.click();

        const cityAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.city, "עיר/יישוב");
        await this.sharedUtils.CheckMaxLength(this.city, 50, "עיר/יישוב");
        await this.city.fill(this.GenerateMaxCharString(cityAllowed, 50));

        const streetAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.street, "רחוב");
        await this.sharedUtils.CheckMaxLength(this.street, 50, "רחוב");
        await this.street.fill(this.GenerateMaxCharString(streetAllowed, 50));

        const buildingAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.buildingNumber, "מספר בית");
        await this.sharedUtils.CheckMaxLength(this.buildingNumber, 50, "מספר בית");
        await this.buildingNumber.fill(this.GenerateMaxCharString(buildingAllowed, 50));

        const zipAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.zipCode, "מיקוד");
        await this.sharedUtils.CheckMaxLength(this.zipCode, 50, "מיקוד");
        await this.zipCode.fill(this.GenerateMaxCharString(zipAllowed, 50));

        const addrNotesAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.addressNotes, "הערות לכתובת");
        await this.sharedUtils.CheckMaxLength(this.addressNotes, 50, "הערות לכתובת");
        await this.addressNotes.fill(this.GenerateMaxCharString(addrNotesAllowed, 50));

        await this.noFirstQuestion.click();
        await this.noSecondQuestion.click();
        await this.noThirdQuestion.click();
        await this.noFourthQuestion.click();

        // שם תמרוק בשפת מדינת הסתמכות — תווים רגילים + תווים רב-לשוניים
        const langAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.languageReferenceCountry, "שם תמרוק בשפת מדינת הסתמכות");
        const multiLangChars = 'éñüàãöαعあ中я한';
        const multiLangAllowed = [];
        for (const ch of multiLangChars) {
            await this.languageReferenceCountry.clear();
            await this.languageReferenceCountry.fill(ch);
            const val = await this.languageReferenceCountry.inputValue();
            await this.page.keyboard.press('Tab');
            await this.page.waitForTimeout(50);
            await this.languageReferenceCountry.click();
            let isBlocked = val !== ch || await this.sharedUtils.isVisibleSafe('//span[contains(text(), "תו לא חוקי")]', 100);
            if (!isBlocked) { multiLangAllowed.push(ch); this.log.info(`✅ "${ch}" מאופשר`); }
            else { this.log.info(`ℹ️ "${ch}" חסום`); }
        }
        const langCombined = (langAllowed || "A") + multiLangAllowed.join('');
        await this.languageReferenceCountry.clear();
        await this.languageReferenceCountry.fill(langCombined.substring(0, 200));

        await this.nextStep.click();

        // --- שלב 2: קטגוריות + מאפיינים + קבצים ---
        await this.cosmeticCategory1.click();
        await this.category1Skin.waitFor({ state: 'visible' });
        await this.category1Skin.click();
        await this.cosmeticCategory2.click();
        await this.category2Makeup.waitFor({ state: 'visible' });
        await this.category2Makeup.click();
        await this.cosmeticCategory3.click();
        await this.category3Other.waitFor({ state: 'visible' });
        await this.category3Other.click();

        const cat3Allowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.otherCosmeticCategory3, "קטגוריה 3 אחר");
        await this.sharedUtils.CheckMaxLength(this.otherCosmeticCategory3, 50, "קטגוריה 3 אחר");
        await this.otherCosmeticCategory3.fill(this.GenerateMaxCharString(cat3Allowed, 50));

        await this.numberOfPhases.click();
        await this.phases2.click();
        await this.physicochemicalProperties.click();
        await this.creamProperty.click();

        if (this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.Files(false);
            await this.po.regulationNotification.QuantityAndPackaging(["10"], false);
        }

        // הוראות שימוש — textarea: תווים + ירידת שורה + מקסימום
        const instrAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.instructions, "הוראות שימוש");
        const instrNewline = await this.sharedUtils.CheckNewlineAllowed(this.instructions, "הוראות שימוש");
        await this.sharedUtils.CheckMaxLength(this.instructions, 4000, "הוראות שימוש");
        const instrBase = this.GenerateMaxCharString(instrAllowed, instrNewline ? 1999 : 4000);
        await this.instructions.fill(instrNewline ? instrBase + "\n" + instrBase : instrBase);

        await this.pao.click();
        await this.numberOfMonths.fill("12");
        await this.frequencyOfUse.click();
        await this.twiceADay.click();

        if (this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.AddShades("A", false, 0);
        }

        const transportAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.transportationAndStorage, "הוראות הובלה ואחסנה");
        await this.sharedUtils.CheckMaxLength(this.transportationAndStorage, 50, "הוראות הובלה ואחסנה");
        await this.transportationAndStorage.fill(this.GenerateMaxCharString(transportAllowed, 50));

        await this.storageLocation.click();
        await this.page.locator('mat-option').first().waitFor({ state: 'visible', timeout: 5000 });
        await this.page.locator('mat-option').first().click();

        await this.nextStep.click();

        // --- שלב 3: טענות שיווקיות + אוכלוסיות + הפצה ---
        await this.other.click();
        await this.otherCheckbox.click();
        const otherClaimAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.otherMarketingClaim, "טענה שיווקית אחרת");
        await this.sharedUtils.CheckMaxLength(this.otherMarketingClaim, 50, "טענה שיווקית אחרת");
        await this.otherMarketingClaim.fill(this.GenerateMaxCharString(otherClaimAllowed, 50));

        await this.TargetPopulation();

        await this.distributionDetails.click();
        await this.distributionStatus.click();
        await this.commercialReasons.click();
        await this.discontinuedDate.click();
        await this.pickDate.click();
        await this.cessationReason.click();
        await this.otherCessationReason.click();

        // סיבת הפסקה — textarea: תווים + ירידת שורה + מקסימום
        const reasonAllowed = await this.sharedUtils.CheckCharactersAndGetAllowed(this.otherReasonText, "סיבת הפסקה אחר");
        const reasonNewline = await this.sharedUtils.CheckNewlineAllowed(this.otherReasonText, "סיבת הפסקה אחר");
        await this.sharedUtils.CheckMaxLength(this.otherReasonText, 1000, "סיבת הפסקה אחר");
        const reasonBase = this.GenerateMaxCharString(reasonAllowed, reasonNewline ? 499 : 1000);
        await this.otherReasonText.fill(reasonNewline ? reasonBase + "\n" + reasonBase : reasonBase);

        await this.page.waitForTimeout(2000);
        await this.nextStep.click();

        // --- שלב 4: קובץ הצהרה + שמירה ---
        await this.files.AtachFile();

        await this.page.keyboard.press('F12');
        await this.page.pause();
        await this.saveAndSend.click();
        await this.page.pause();

        if (this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.dialog.waitFor({ state: 'visible' });
            await this.po.regulationNotification.CheckDialog();
        }
    }

    async CreateProperNotification(flug = true) {
        let v = await this.sharedUtils.ReadFileComment(path.join(this.po.dataFolder, "proper.txt"));
        await this.ManufacturAddressProper([v[0], v[1], v[2], v[3], v[4], v[5]], flug);
        await this.noFirstQuestion.click();
        await this.noSecondQuestion.click();
        await this.noThirdQuestion.click();
        await this.noFourthQuestion.click();
        await this.languageReferenceCountry.fill(v[6]);
        await this.nextStep.click();
        
        await this.cosmeticCategory1.click();
        await this.category1Skin.waitFor({ state: 'visible' });
        await this.category1Skin.click();
        
        await this.cosmeticCategory2.click();
        await this.category2Makeup.waitFor({ state: 'visible' });
        await this.category2Makeup.click();
        
        await this.cosmeticCategory3.click();
        await this.category3Other.waitFor({ state: 'visible' });
        await this.category3Other.click();
        
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.otherCosmeticCategory3, "קטגוריה 3 אחר", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.otherCosmeticCategory3, 50, "קטגוריה 3 אחר");
        }
        await this.otherCosmeticCategory3.fill(v[7]);
        
        await this.numberOfPhases.click();
        await this.phases2.click();
        await this.physicochemicalProperties.click();
        await this.creamProperty.click();
        
        // Using the original logic that still resides in RegulationNotification
        if (this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.Files(flug);
            await this.po.regulationNotification.QuantityAndPackaging([v[10], v[11]], flug);
        }
        
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.instructions, "הוראות שימוש", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.instructions, 4000, "הוראות שימוש");
        }
        await this.instructions.fill(v[12]);
        
        await this.pao.click();
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.numberOfMonths, "מספר חודשים", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.numberOfMonths, 20, "מספר חודשים");
        }
        await this.numberOfMonths.fill(v[13]);
        
        await this.frequencyOfUse.click();
        await this.twiceADay.click();
        
        if (this.po && this.po.regulationNotification) {
            await this.po.regulationNotification.AddShades(v[14], false, 0);
        }
        
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.transportationAndStorage, "הוראות הובלה ואחסנה", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.transportationAndStorage, 50, "הוראות הובלה ואחסנה");
        }
        
        await this.transportationAndStorage.fill(v[15]);
        await this.storageLocation.click();
        await this.page.locator('mat-option').first().click();
        
        await this.option.first().click();
        await this.nextStep.click();
        
        await this.ClinicalTest(flug);
        await this.TargetPopulation();
        
        await this.distributionDetails.click();
        await this.distributionStatus.click();
        await this.commercialReasons.click();
        await this.discontinuedDate.click();
        await this.pickDate.click();
        await this.cessationReason.click();
        await this.otherCessationReason.click();
        
        if (flug) {
            await this.sharedUtils.CheckCharacters(this.otherReasonText, "סיבת הפסקה אחר", this.env.charNotification);
            await this.sharedUtils.CheckMaxLength(this.otherReasonText, 1000, "סיבת הפסקה אחר");
        }
        await this.otherReasonText.fill(v[17]);
        await this.page.waitForTimeout(2000);
        await this.nextStep.click();
        
        await this.files.AtachFile();

        await this.saveAndSend.click();
        
        // השימוש כאן נובע מתוך תלות זמנית ב-po.regulationNotification
        if (this.po && this.po.regulationNotification) {
            await this.page.locator(this.po.regulationNotification.dialog).waitFor({ state: 'visible' }).catch(() => {});
            await this.po.regulationNotification.CheckDialog();
            await this.page.locator(this.po.regulationNotification.okEnd).click();
        }
        await this.page.waitForTimeout(5000);
    }
}
module.exports = ProperNotificationPage;
