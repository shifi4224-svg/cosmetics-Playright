class BackendLoginPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        // Locators למערכת התפעולית (Backend)
        this.userNameInput = this.page.locator('//input[@placeholder="שם משתמש"]');
        this.passwordInput = this.page.locator('//input[@placeholder="סיסמא"]');
        this.submitButton = this.page.locator('//*[@type="submit"]');
        this.dealersButton = this.page.locator('//*[@title="עוסקים"]');
        this.searchCeoInput = this.page.locator('//*[@id="search_ceo"]');
        this.firstRow = this.page.locator('(//tbody//tr)[1]'); // שורה ראשונה בטבלה (אם זו טבלת Angular שנו ל- //mat-row[1])
        this.statusSelect = this.page.locator('//*[@aria-label="סטטוס"]');
        this.successIcon = this.page.locator('//*[@class="icon icon-success"]');
    }

    async LoginToBackend(username = "322638727", password = "1234") {
        try {
            this.log.info("מתחבר למערכת התפעולית (Backend)...");
            await this.page.goto("https://rakefett.moh.health.gov.il/cosmeticsBackend/dashboard");
            
            await this.userNameInput.waitFor({ state: 'visible' });
            await this.userNameInput.fill(username);
            await this.passwordInput.fill(password);
            await this.submitButton.click();
            
            await this.page.waitForTimeout(2000); // המתנה קצרה לסיום טעינת הדף אחרי ההתחברות
            this.log.info("לוחץ על לשונית עוסקים...");
            await this.dealersButton.click();

            for (let i = 0; i < 20; i++) {
                this.log.info(`מחזור חיפוש ועדכון סטטוס מספר ${i + 1} מתוך 20...`);
                this.log.info("מזין ערך בשדה חיפוש מנכ\"ל...");
                await this.searchCeoInput.fill("שפרה הקר");
                //await this.page.keyboard.press('Enter'); // הפעלת החיפוש
                await this.page.waitForTimeout(2000); // המתנה לטעינת התוצאות בטבלה
                
                this.log.info("לוחץ על השורה הראשונה בטבלה...");
                await this.firstRow.click();
                this.log.info("לוחץ על בחירת סטטוס...");
                await this.statusSelect.click();
                await this.page.waitForTimeout(1000);
                this.log.info("לוחץ על אייקון הצלחה...");
                await this.successIcon.click();
                await this.page.waitForTimeout(1000); // המתנה קצרה בסוף כל מחזור
            }
        } catch (err) {
            this.log.error("שגיאה במהלך ההתחברות למערכת התפעולית: ", err);
            throw err;
        }
    }
}

module.exports = BackendLoginPage;