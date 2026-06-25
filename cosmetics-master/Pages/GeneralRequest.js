const path = require('path');
const FilesPage = require('./Files');

class GeneralRequestPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.filesPage = new FilesPage(page, po, env, log);

        // Locators — דף הוספת פניה
        this.subjectDropdown = this.page.locator('input[placeholder="-בחר נושא-"]');
        this.typeDropdown = this.page.locator('input[placeholder="-בחר סוג-"]');
        this.itemLinkDropdown = this.page.locator('input[placeholder="-בחר פריט-"]');
        this.descriptionInput = this.page.locator('textarea[placeholder="יש להזין את תוכן הפניה"]');
        this.fileUploadArea = this.page.locator('moh-file-upload-drag-and-drop, [class*="upload"]').first();
        this.submitBtn = this.page.locator('button:has-text("שליחה"), moh-button:has-text("שליחה")');
        this.cancelBtn = this.page.locator('button:has-text("ביטול"), moh-button:has-text("ביטול")');
        this.dialog = this.page.locator('mat-dialog-container, [role="dialog"], .swal2-popup, moh-dialog');
        this.okBtn = this.page.locator('button:has-text("OK"), #confirm-btn');

        // Locators — דף פרטי עסק > טאב פניות
        this.businessDetailsPaniiotTab = this.page.locator('text=פניות');
        this.actionsMenu = this.page.locator('text=פעולות נוספות');
        this.createRequestMenuItem = this.page.locator('text=יצירת פניה');
        this.updateProperImporterMenuItem = this.page.locator('text=עדכון יבואן נאות');

        // ערכי נושא
        this.subjectAipur = this.page.locator('text=איפור וטיפוח').first();
        this.subjectNano = this.page.locator('text=ננו').first();
        this.subjectHygiene = this.page.locator('text=הגיינת הפה').first();
        this.subjectSideEffect = this.page.locator('text=תופעת לוואי').first();

        // ערכי סוג
        this.typeStatusCheck = this.page.locator('text=בירור סטטוס').first();
        this.typeDocuments = this.page.locator('text=השלמת מסמכים').first();
        this.typeTechnical = this.page.locator('text=תמיכה טכנית').first();
        this.typeMailReply = this.page.locator('text=מענה למייל').first();
    }

    // נווט לדף יצירת פניה מתוך פרטי העסק
    async NavigateToCreateRequest(businessId) {
        await this.page.goto(`${this.env.url}/register/industry/industryForm/${businessId}`);
        await this.page.waitForLoadState('networkidle');
        await this.actionsMenu.click();
        await this.createRequestMenuItem.click();
        await this.page.waitForLoadState('networkidle');
    }

    // יצירת פניה מלאה
    async CreateRequest(subject, type, description, itemName = null, attachFile = false) {
        let bugs = 0;

        // בחר נושא
        await this.subjectDropdown.click();
        await this.page.locator(`text=${subject}`).first().click();

        // בחר סוג
        await this.typeDropdown.click();
        await this.page.locator(`text=${type}`).first().click();

        // קישור לפריט (אופציונלי)
        if (itemName) {
            await this.itemLinkDropdown.click();
            const itemOption = this.page.locator(`text=${itemName}`).first();
            if (await itemOption.isVisible()) {
                await itemOption.click();
            }
        }

        // מלא תיאור
        await this.descriptionInput.fill(description);

        // צרף קובץ (אופציונלי)
        if (attachFile) {
            await this.filesPage.AtachFile(this.fileUploadArea, 'Doc1.pdf', 'פניה');
        }

        // שלח
        await this.submitBtn.click();
        await this.page.waitForTimeout(2000);

        // בדוק תשובה
        const dialogVisible = await this.dialog.first().isVisible().catch(() => false);
        if (dialogVisible) {
            const text = await this.dialog.first().textContent().catch(() => '');
            this.log.info(`דיאלוג אחרי שליחת פניה: ${text}`);
            const okVisible = await this.okBtn.isVisible().catch(() => false);
            if (okVisible) await this.okBtn.click();
        }

        return bugs;
    }

    // בדיקת ולידציה — שליחה ללא שדות חובה
    async ValidateRequiredFields() {
        let bugs = 0;

        await this.submitBtn.click();
        await this.page.waitForTimeout(1000);

        // צפה לשגיאות ולידציה
        const errors = this.page.locator('[class*="error"], [class*="invalid"], mat-error');
        const errorCount = await errors.count();
        if (errorCount === 0) {
            this.log.error('שגיאה: אפשר לשלוח פניה ללא שדות חובה!');
            bugs++;
        }

        return bugs;
    }

    // בדיקת כל הנושאים
    async ValidateAllSubjects() {
        const subjects = ['איפור וטיפוח', 'ננו', 'הגיינת הפה', 'תופעת לוואי'];
        let bugs = 0;

        for (const subject of subjects) {
            await this.subjectDropdown.click();
            const option = this.page.locator(`text=${subject}`).first();
            const visible = await option.isVisible();
            if (!visible) {
                this.log.error(`נושא '${subject}' לא נמצא ב-dropdown`);
                bugs++;
            } else {
                await option.click();
                this.log.info(`נושא '${subject}' קיים ✓`);
                // נקה הבחירה
                await this.page.keyboard.press('Escape');
            }
        }

        return bugs;
    }

    // בדיקת כל הסוגים (לאחר שנושא נבחר)
    async ValidateAllTypes(subject) {
        await this.subjectDropdown.click();
        await this.page.locator(`text=${subject}`).first().click();

        const types = ['בירור סטטוס', 'השלמת מסמכים', 'תמיכה טכנית', 'מענה למייל'];
        let bugs = 0;

        for (const type of types) {
            await this.typeDropdown.click();
            const option = this.page.locator(`text=${type}`).first();
            const visible = await option.isVisible();
            if (!visible) {
                this.log.error(`סוג '${type}' לא נמצא ב-dropdown`);
                bugs++;
            } else {
                await option.click();
                this.log.info(`סוג '${type}' קיים ✓`);
                await this.page.keyboard.press('Escape');
            }
        }

        return bugs;
    }
}

module.exports = GeneralRequestPage;
