class EmailPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        this.userNameMailInput = '#username';
        this.passwordEmail = '#password';
        this.signInButton = '//span[contains(text(), "sign in")]';
        this.otpInboxEmail = '//span[text()="מערכת ההזדהות הלאומית"]';
        this.otpInboxEmailDeleteButton = '//span[text()="מערכת ההזדהות הלאומית"]//..//..//..//button[@title="Delete"]';
        this.otpNumberText = '//div[@id="Item.MessageUniqueBody"]//div[@style="font-size:48px; color:#0068F5; font-weight:bold"]';
        
        // המשתנה הזה ישמור את החלון של האימייל כדי שנוכל לחזור אליו
        this.emailPage = null; 
    }

    // התחברות למערכת OUTLOOK
    async loginToEmail() {
        this.emailPage = await this.page.context().newPage();
        await this.emailPage.goto(this.env.emailUrl);
        await this.emailPage.locator(this.userNameMailInput).fill(this.env.emailUsername);
        await this.emailPage.locator(this.passwordEmail).fill(this.env.emailPassword);
        await this.emailPage.locator(this.signInButton).click();
    }

    // מחיקת כל המיילים הקודמים של הOTP שקיימים במייל
    async deleteLastEmails() {
        await this.emailPage.waitForTimeout(5000);
        let emailCount = await this.emailPage.locator(this.otpInboxEmail).count();
        while (emailCount > 0) {
            await this.emailPage.waitForTimeout(this.po.oneSecondTimeout || 1000);
            const firstEmail = this.emailPage.locator(`(${this.otpInboxEmail})[1]`);
            if (await firstEmail.isVisible()) {
                await firstEmail.click();
                await this.emailPage.keyboard.press('Delete');
                emailCount = await this.emailPage.locator(this.otpInboxEmail).count();
            }
        }
    }

    // רפרוש של המייל עד שמתקבל המייל עם הOTP
    async getOtp() {
        let tries = 8;
        if (!this.emailPage) {
            await this.loginToEmail();
        }
        
        while (!(await this.emailPage.locator(this.otpInboxEmail).first().isVisible()) && tries > 0) {
            await this.emailPage.waitForTimeout(this.po.fiveSecondsTimeout || 5000);
            await this.emailPage.reload();
            tries--;
        } 

        await this.emailPage.locator(`(${this.otpInboxEmail})[1]`).click();
        let otp = await this.emailPage.locator(this.otpNumberText).textContent();
        this.log.info('otp: ' + otp);

        await this.deleteLastEmails();
        return otp;
    }
}
module.exports = EmailPage;