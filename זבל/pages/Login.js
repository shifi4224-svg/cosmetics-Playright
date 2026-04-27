module.exports = {

    idInput: 'id=userId',
    passwordInput: 'id=userPass',
    loginButton: 'id=loginSubmit',
    sendOtpToMailButton: '//span[contains(text(), "שלחו לי את הקוד")]',
    noNow: '//span[contains(text(), "לא כרגע")]',
    emailInput: '//input[@type="email"]',
    nextButton: '//button[@type="submit"]',
    otpInput: 'id=mailOtp',
    loginMailOtpSubmitButton: 'id=loginMailOtpSubmit',
    loginAws: '//*[@class="national-auth-button col-auto mt-2 rounded-box d-flex flex-column"]',
    tZ: '//*[@aria-label="תעודת זהות"]',
    sL: '//*[@aria-label="שנת לידה"]',
    bb: '//*[@class="submit-login-year-of-birth w-100"]',

    LoginDev: () => {
        web.init()
        web.open('https://cnpdev.health.gov.il/')
        web.type(po.loginPage.tZ, "322638727")
        web.type(po.loginPage.sL, "2000")
        web.click(po.loginPage.bb)
        web.waitForVisible(po.regulationDealer.card)
        web.pause(5000)
        web.waitForVisible(po.regulationDealer.card)
        web.pause(5000)
    },

    

    Login: () => {
        web.transaction('Delete Old OTPs')
        web.init()
        po.emailPage.loginToEmail()
        po.emailPage.deleteLastEmails()
        web.dispose()

        web.transaction('Login')
        web.init()
        web.open(env.url)
        web.click(po.loginPage.loginAws)
        web.type(po.loginPage.idInput, env.user)
        web.type(po.loginPage.passwordInput, env.password)
        web.click(po.loginPage.loginButton)

        web.click(po.loginPage.sendOtpToMailButton)

        web.transaction('Get OTP')
        po.emailPage.loginToEmail()
        let otp = po.emailPage.getOtp()

        web.selectWindow('title=מערכת הזדהות לאומית')
        web.type(po.loginPage.otpInput, otp)
        web.click(po.loginPage.loginMailOtpSubmitButton)
        web.click(po.loginPage.noNow)
        web.waitForVisible(po.regulationDealer.card)
    },
}
