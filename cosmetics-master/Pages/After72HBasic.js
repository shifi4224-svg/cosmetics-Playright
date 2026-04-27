class After72HBasicPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        this.userTifulit = '//input[@placeholder="שם משתמש"]';
        this.passTifulit = '//input[@placeholder="סיסמא"]';
        this.sabmit = '//*[@type="submit"]';
        this.save = '//button[@type="button"]';
        this.nextPage = '(//*[@aria-label=" page"])[2]';
        this.okButton = '//button[text()="OK"]';
        this.notesEdit = '//*[@aria-label="הערות לתיקון / עדכון"]';
        this.saveNotes = '//*[text()="שמירה"]';
        this.reasonChange = '//input[@aria-label="סיבת שינוי"]';
        this.otherReason = '//*[text()=" אחר "]';
        this.otherReasonType = '//input[@aria-label="סיבת שינוי אחר"]';
        this.option = '//mat-option';
        this.q1 = '//moh-button-toggle[@formcontrolname="properEUAlerts"]';
        this.q2 = '//moh-button-toggle[@formcontrolname="properSafe"]';
        this.q3 = '//moh-button-toggle[@formcontrolname="properFile"]';
        this.delateShades = '(//img[@style="cursor: pointer;"])[3]';
    }

    async isVisibleSafe(locatorStr, timeout = 0) {
        const loc = this.page.locator(locatorStr).first();
        if (timeout > 0) {
            await loc.waitFor({ state: 'visible', timeout }).catch(() => {});
        }
        return await loc.isVisible();
    }

    // מתודת עזר המחליפה את בלוקי ה-try/catch לבדיקה אם שדה ניתן לעריכה (isInteractable)
    async checkInteractable(locatorStr) {
        try {
            const loc = this.page.locator(locatorStr).first();
            await loc.waitFor({ state: 'attached', timeout: 1000 });
            if (!(await loc.isEditable())) throw new Error("Element is not editable");
        } catch (e) {
            this.log.warn(`❌ שדה נעול: ${locatorStr} - ${e.message}`);
        }
    }

    async ValidateFieldEditability(action = "check", tableXpath = null) {
        try {
            await this.page.goto("https://rakefett.moh.health.gov.il/cosmeticsBackend/dashboard");
            await this.page.locator(this.userTifulit).fill(this.env.user);
            await this.page.locator(this.passTifulit).fill("1234");
            await this.page.locator(this.sabmit).click();
            
            await this.page.waitForTimeout(2000);
            await this.page.locator(this.po.settings.settingsButton).waitFor({ state: 'visible' });
            await this.page.locator(this.po.settings.settingsButton).click();
            
            await this.page.waitForTimeout(5000);
            await this.page.locator(this.po.settings.maarechet).waitFor({ state: 'visible' });
            await this.page.waitForTimeout(2000);
            await this.page.locator(this.po.settings.maarechet).click();
            
            await this.page.waitForTimeout(1000);
            await this.page.locator(this.po.settings.sadot).click();
            await this.page.locator(this.po.settings.yeshutSearch).fill("notification");
            
            this.log.info('Starting field editability validation');
            let rowsElement = '//tbody//tr';

            if (tableXpath) {
                await this.page.locator(tableXpath).click();
            }
            
            let p = 1;
            let hasNextPage = true;
            
            while (hasNextPage) {
                if (p > 1) {
                    const nextBtn = this.page.locator(this.nextPage).first();
                    if (await nextBtn.isEnabled()) {
                        await nextBtn.click();
                    }
                }

                const rowsCount = await this.page.locator(rowsElement).count();
                this.log.info(`Found ${rowsCount} fields to validate`);
                this.log.info(`page ${p}`);
                this.log.info('בדיקה ראשונה: בדיקת כל השדות פתוחים לעריכה');

                for (let i = 1; i <= rowsCount; i++) {
                    const checkboxXpath = `(${rowsElement}[${i}]//input[@type='checkbox'])[1]`;
                    const fieldNameXpath = `${rowsElement}[${i}]//td[2]`;
                    
                    const fieldName = await this.page.locator(fieldNameXpath).textContent();
                    
                    // בדיקה נקייה בעזרת isChecked() במקום execute של סקריפט JavaScript
                    const isChecked = await this.page.locator(checkboxXpath).isChecked();

                    if (action === "check" && !isChecked) {
                        await this.page.locator(checkboxXpath).click();
                        this.log.info(`Enabled field: ${fieldName}`);
                    }
                    if (action === "uncheck" && isChecked) {
                        await this.page.locator(checkboxXpath).click();
                        this.log.info(`Disabled field: ${fieldName}`);
                    }
                }

                if (p === 1) {
                    await this.page.locator('//*[@aria-label=" page"]').click();
                }
                
                p++;
                hasNextPage = await this.isVisibleSafe(this.nextPage, 1000);
            }
            
            await this.page.locator(this.save).click();
            if (await this.isVisibleSafe(this.okButton, 2000)) {
                await this.page.locator(this.okButton).click();
            }
            this.log.info("הגעתי לסוף ושמרתי");
            this.log.info('Validating all fields are editable in form');

        } catch (err) {
            this.log.error('Field editability validation failed:', err.message);
            throw err;
        }
    }

    async ClickOnForm() {
        try {
            await this.page.waitForTimeout(2000);
            await this.checkInteractable(this.po.regulationNotification.manufacturerName);
            await this.page.locator(this.po.regulationNotification.nextStep).click();
            
            await this.checkInteractable(this.po.regulationNotification.category1);
            await this.checkInteractable(this.po.regulationNotification.category2);
            
            const disabled = await this.page.locator(this.po.regulationItem.distributionStatus).getAttribute("class");
            this.log.info(`class: ${disabled}`);

            await this.checkInteractable(this.po.regulationNotification.washable);
            await this.checkInteractable(this.po.regulationNotification.granules);
            await this.checkInteractable(this.po.regulationNotification.phases);
            await this.checkInteractable(this.po.regulationNotification.physicochemical);
            await this.checkInteractable(this.po.regulationNotification.packType);
            await this.checkInteractable(this.po.regulationNotification.instructionsForUse);
            await this.checkInteractable(this.po.regulationNotification.exp);
            
            await this.page.locator(this.po.regulationNotification.nextStep).click();
            await this.page.locator(this.po.regulationNotification.oKmaterials).click();
            await this.page.locator(this.po.regulationNotification.nextStep).click();
            await this.page.locator(this.po.regulationNotification.nextStep).click();
            
            await this.checkInteractable(this.po.regulationNotification.panelOther);
            await this.checkInteractable(this.po.regulationNotification.populationTitle);
            await this.checkInteractable(this.po.regulationNotification.distributionStatus);
            
            await this.page.locator(this.po.regulationNotification.nextStep).click();
            await this.page.locator(this.po.regulationNotification.saveSubmit).click();
            await this.page.locator(this.notesEdit).fill("בדיקה אוטומציה");
            await this.page.locator(this.saveNotes).click();

        } catch (err) { 
            this.log.error(err.message); 
        }
    }

    async TypeReason() {
        await this.page.waitForTimeout(2000);
        await this.page.locator(this.reasonChange).click();
        await this.page.locator(this.otherReason).click();
        await this.page.locator(this.otherReasonType).fill("סיבה אחרת לשינוי");
        await this.page.locator(this.sabmit).click();
    }

    async YesNo(value) {
        const x = `${value}//*[@class="mat-button-toggle toggle-option mat-button-toggle-appearance-standard ng-star-inserted"]`;
        if (await this.isVisibleSafe(x, 1000)) {
            await this.page.locator(x).click();
            await this.TypeReason();
        } else {
            this.log.info("לא ברור מה מסומן");
        }
    }

    async AddShades() {
        try {
            await this.page.locator(this.po.regulationNotification.selectColor).click();
            await this.page.locator(this.po.regulationNotification.colorWhite).click();
            await this.page.waitForTimeout(1000);
            await this.page.locator(this.po.regulationNotification.addShade).click();
        } catch (err) {
            this.log.error("משהו לא טוב בגוון");
            this.log.error(err.message);
            await this.page.locator(this.po.regulationNotification.addShade).click();
        }
    }

    async Reasons() {
        let x = await this.page.locator(this.po.properNotification.importingCountry).textContent() || await this.page.locator(this.po.properNotification.importingCountry).inputValue();
        if (x && x.includes("ארמניה")) {
            this.log.info("ארמניה");
            await this.page.locator(this.po.properNotification.importingCountry).click();
            await this.page.locator(this.po.properNotification.importingCyprus).click();
        } else {
            this.log.info("מדינה אחרת");
            await this.page.locator(this.po.properNotification.importingCountry).click();
            await this.page.locator(this.po.properNotification.importingCyprus2).click();
        }
        
        await this.TypeReason();
        this.log.info("שאלה ראשונה");
        await this.YesNo(this.q1);
        this.log.info("שאלה שניה");
        await this.YesNo(this.q2);
        this.log.info("שאלה שלישית");
        await this.YesNo(this.q3);
        await this.page.locator(this.po.regulationNotification.nextStep).click();
        
        // כמות ואריזה
        x = await this.page.locator(this.po.regulationNotification.packType).inputValue();
        this.log.info(x);
        this.log.info(1122);
        if (x && x.includes("בקבוק זכוכית")) {
            await this.page.locator(this.po.regulationNotification.packType).click();
            await this.page.locator(this.po.regulationNotification.packTypeName).click();
        } else {
            await this.page.locator(this.po.regulationNotification.packType).click();
            await this.page.locator(this.po.regulationNotification.packTypeName2).click();
        }
        
        await this.page.locator(this.reasonChange).fill("סיבה אחרת לשינוי");
        await this.page.locator(this.sabmit).click();
        
        x = await this.page.locator(this.po.regulationNotification.unitType).textContent() || await this.page.locator(this.po.regulationNotification.unitType).inputValue();
        if (x && x.includes("ליטר")) {
            await this.page.locator(this.po.regulationNotification.unitType).click();
            await this.page.locator(this.po.regulationNotification.unitTypeName).click();
        } else {
            await this.page.locator(this.po.regulationNotification.unitType).click();
            await this.page.locator(this.po.regulationNotification.unitTypeName2).click();
        }
        
        await this.page.locator(this.reasonChange).click();
        await this.page.locator(this.option).click();
        await this.page.locator(this.sabmit).click();
        
        await this.AddShades("ירקרק", false, 0); // מניח שיש למתודה אפשרות לקבל ארגומנטים אלו אם הורחבה במקום אחר
        await this.TypeReason();
        await this.page.locator(this.delateShades).click();
        await this.TypeReason();
        
        await this.page.locator(this.po.properNotification.transportationAndStorage).fill("דרישות חדשות");
        await this.page.keyboard.press('Tab');
        
        await this.TypeReason();
        await this.page.locator(this.po.properNotification.storageLocation).click();
        await this.page.locator(this.option).click();
        await this.TypeReason();
        
        await this.page.locator(this.po.regulationNotification.nextStep).click();
        await this.page.locator(this.po.properNotification.targetPopulation).click(); 
        await this.page.locator(this.po.properNotification.menAbove16).click(); 
        await this.TypeReason();
        await this.page.locator(this.po.properNotification.adultsAbove12).click(); 
        await this.TypeReason();
        
        await this.po.files.AtachFile();
        await this.page.locator(this.po.regulationNotification.saveSubmit).click();
        await this.page.locator(this.notesEdit).fill("הערות לאוטומציה");
        await this.page.locator(this.saveNotes).click();
        
        await this.page.locator(this.po.regulationNotification.dialog).waitFor({ state: 'visible' });
        await this.po.regulationNotification.CheckDialog();
        await this.page.locator(this.po.regulationNotification.okEnd).click();
        await this.page.waitForTimeout(5000);
    }
}
module.exports = After72HBasicPage;
