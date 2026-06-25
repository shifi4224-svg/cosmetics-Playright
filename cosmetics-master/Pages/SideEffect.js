const path = require('path');

class SideEffectPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        // ---- שלב 1: פרטי מדווח ----
        this.reporterFirstName = this.page.locator('input[aria-label="שם פרטי"]').first();
        this.reporterLastName = this.page.locator('input[aria-label="שם משפחה"]').first();
        this.reporterPhone = this.page.locator('input[aria-label="מספר טלפון"]');
        this.reporterEmail = this.page.locator('input[aria-label="מייל המדווח"]');

        // פרטי נפגע
        this.victimFirstName = this.page.locator('input[aria-label="שם פרטי"]').nth(1);
        this.victimLastName = this.page.locator('input[aria-label="שם משפחה"]').nth(1);
        this.victimBirthDate = this.page.locator('input[aria-label*="תאריך לידה"]');
        this.victimGenderMale = this.page.locator('mat-radio-button').filter({ hasText: 'זכר' }).locator('input');
        this.victimGenderFemale = this.page.locator('mat-radio-button').filter({ hasText: 'נקבה' }).locator('input');

        // פרטי תמרוק
        this.productName = this.page.locator('input[aria-label="שם התמרוק בעברית"]');
        this.notifNumber = this.page.locator('input[aria-label="מספר נוטיפיקציה"]');
        this.batch = this.page.locator('input[aria-label="אצווה"]');

        // כפתורים
        this.nextBtn = this.page.locator('button:has-text("שלב הבא"), moh-button:has-text("שלב הבא")');
        this.prevBtn = this.page.locator('button:has-text("שלב קודם"), moh-button:has-text("שלב קודם")');
        this.submitBtn = this.page.locator('button:has-text("שלח"), button:has-text("סיום"), moh-button:has-text("שלח")');
        this.okBtn = this.page.locator('button:has-text("הבנתי"), button:has-text("OK"), button:has-text("אישור"), #confirm-btn');
        this.dialog = this.page.locator('mat-dialog-container, [role="dialog"], .swal2-popup, moh-dialog');

        // ---- ניווט לתופעות לוואי מתוך פריט ----
        // כפתור 3 נקודות (actions) בשורה ראשונה בטבלת הנוטיפיקציות
        this.actionsBtn = this.page.locator('button[mat-icon-button], button.more-btn, [class*="more-btn"]').first();
        this.sideEffectMenuItem = this.page.locator('text=דיווח תופעת לוואי');
        this.newSideEffectBtn = this.page.locator('text=תופעת לוואי חדשה, button:has-text("תופעת לוואי חדשה")');
    }

    // ---- ניווט לדף תופעות לוואי מתוך פריט ----
    async NavigateToSideEffect(itemName = null, statusFilter = 'נוטיפיקציה הושלמה') {
        // מחפש פריט עם נוטיפיקציה שהושלמה ולוחץ על actions
        const rows = this.page.locator('mat-row, tr[mat-row]');
        await rows.first().waitFor({ state: 'visible', timeout: 10000 });

        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            const rowText = await rows.nth(i).textContent();
            if (itemName ? rowText.includes(itemName) : rowText.includes(statusFilter)) {
                // לחץ על כפתור actions (3 נקודות)
                const actBtn = rows.nth(i).locator('button[mat-icon-button], .more-btn, [class*="actions"]').first();
                if (await actBtn.isVisible()) {
                    await actBtn.click();
                    await this.page.waitForTimeout(500);
                    const sideEffBtn = this.page.locator('text=דיווח תופעת לוואי').first();
                    if (await sideEffBtn.isVisible()) {
                        await sideEffBtn.click();
                        await this.page.waitForLoadState('networkidle');
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // ---- מלא שלב 1 ----
    async FillStep1(data = {}) {
        const d = {
            phone: data.phone || '0501234567',
            email: data.email || 'test@test.com',
            victimFirst: data.victimFirst || 'ישראל',
            victimLast: data.victimLast || 'ישראלי',
            birthDate: data.birthDate || '01/01/1990',
            gender: data.gender || 'male',
            productName: data.productName || '2',
            notifNumber: data.notifNumber || '',
        };

        // פרטי התקשרות של המדווח (חלק כבר ממולא)
        await this.reporterPhone.fill(d.phone);
        await this.reporterEmail.fill(d.email);

        // פרטי נפגע
        await this.victimFirstName.fill(d.victimFirst);
        await this.victimLastName.fill(d.victimLast);
        await this.victimBirthDate.fill(d.birthDate);
        if (d.gender === 'male') {
            await this.victimGenderMale.check({ force: true });
        } else {
            await this.victimGenderFemale.check({ force: true });
        }

        // פרטי תמרוק — שם כבר ממולא, notifNumber כבר ממולא
        if (d.notifNumber) {
            await this.notifNumber.fill(d.notifNumber);
        }
    }

    // ---- בדיקת ולידציה שלב 1 ----
    async ValidateStep1RequiredFields() {
        let bugs = 0;
        await this.nextBtn.click();
        await this.page.waitForTimeout(1000);

        const errorDialog = this.page.locator('text=אחד או יותר מהשדות שהוזנו אינם תקינים');
        const hasError = await errorDialog.isVisible().catch(() => false);
        if (!hasError) {
            this.log.error('ולידציה נכשלה — אפשר לעבור שלב ללא שדות חובה');
            bugs++;
        } else {
            await this.okBtn.first().click();
        }
        return bugs;
    }

    // ---- עבור לשלב 2 ----
    async GoToStep2() {
        await this.nextBtn.click();
        await this.page.waitForTimeout(1000);
        // סגור דיאלוג שגיאה אם קיים
        const errorDialog = this.page.locator('text=אחד או יותר');
        if (await errorDialog.isVisible().catch(() => false)) {
            await this.okBtn.first().click();
            return false;
        }
        return true;
    }

    // ---- תהליך מלא: שלב 1 + שלב 2 + שליחה ----
    async SubmitFullReport(data = {}) {
        let bugs = 0;

        // שלב 1
        await this.FillStep1(data);
        const step2ok = await this.GoToStep2();
        if (!step2ok) {
            this.log.error('לא עברנו לשלב 2');
            bugs++;
            return bugs;
        }

        await this.page.waitForTimeout(1000);

        // שלב 2 — קבל תוכן ומלא
        const step2Fields = await this.page.evaluate(() => {
            return Array.from(document.querySelectorAll('input[aria-label], textarea[aria-label]'))
                .map(el => el.getAttribute('aria-label')).filter(Boolean);
        });
        this.log.info(`שלב 2 — שדות: ${step2Fields.join(', ')}`);

        // לחץ הבא לשלב 3
        if (await this.nextBtn.isVisible().catch(() => false)) {
            await this.nextBtn.click();
            await this.page.waitForTimeout(1000);
        }

        // שלב 3 — שליחה
        if (await this.submitBtn.isVisible().catch(() => false)) {
            await this.submitBtn.click();
            await this.page.waitForTimeout(3000);

            const dialogVisible = await this.dialog.first().isVisible().catch(() => false);
            if (dialogVisible) {
                const text = await this.dialog.first().textContent().catch(() => '');
                this.log.info(`דיאלוג סיום: ${text}`);
                const okVisible = await this.okBtn.isVisible().catch(() => false);
                if (okVisible) await this.okBtn.first().click();
            }
        }

        return bugs;
    }
}

module.exports = SideEffectPage;
