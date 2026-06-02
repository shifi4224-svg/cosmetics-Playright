require('dotenv').config();

class LoginPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        this.idInput = '#userId';
        this.passwordInput = '#userPass';
        this.loginButton = '#loginSubmit';
        this.sendOtpToMailButton = '//span[contains(text(), "שלחו לי את הקוד")]';
        this.noNow = '//span[contains(text(), "לא כרגע")]';
        this.emailInput = '//input[@type="email"]';
        this.nextButton = '//button[@type="submit"]';
        this.otpInput = '#mailOtp';
        this.loginMailOtpSubmitButton = '#loginMailOtpSubmit';
        this.loginAws = '//*[@class="national-auth-button col-auto mt-2 rounded-box d-flex flex-column"]';
        this.tZ = '//*[@aria-label="תעודת זהות"]';
        this.sL = '//*[@aria-label="שנת לידה"]';
        this.bb = '//*[@class="submit-login-year-of-birth w-100"]';
        this.card = this.page.locator('//*[@class="card"]');

    }

    async LoginDev() {
        await this.page.goto(process.env.BASE_URL || this.env.url);
        await this.page.locator(this.tZ).fill(process.env.USER_ID || this.env.user);
        await this.page.locator(this.sL).fill(process.env.USER_BIRTH_YEAR || this.env.password);
        await this.page.locator(this.bb).click();
        await this.page.waitForTimeout(1000);
        if (await this.page.locator('//*[contains(text(), "קוד אימות")]').isVisible()) {
            await this.page.pause();
        }
        await this.card.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(5000);
    }

    async Login() {
        this.log.info('Transaction: Delete Old OTPs');
        await this.po.emailPage.loginToEmail();
        await this.po.emailPage.deleteLastEmails();

        this.log.info('Transaction: Login');
        await this.page.goto(this.env.url);
        await this.page.locator(this.loginAws).click();
        await this.page.locator(this.idInput).fill(this.env.user);
        await this.page.locator(this.passwordInput).fill(this.env.password);
        await this.page.locator(this.loginButton).click();
        await this.page.locator(this.sendOtpToMailButton).click();

        this.log.info('Transaction: Get OTP');
        let otp = await this.po.emailPage.getOtp();

        await this.page.bringToFront();
        await this.page.locator(this.otpInput).fill(otp);
        await this.page.locator(this.loginMailOtpSubmitButton).click();
        await this.page.locator(this.noNow).click();
        await this.card.waitFor({ state: 'visible' });
    }
}
module.exports = LoginPage;
