const fs = require('fs');

class SharedUtils {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
    }

    async isVisibleSafe(locatorOrString, timeout = 0) {
        const loc = typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)
            : locatorOrString;
        const firstLoc = loc.first();
        if (timeout > 0) {
            await firstLoc.waitFor({ state: 'visible', timeout }).catch(() => {});
        }
        return await firstLoc.isVisible();
    }

    // פונקציות שקשורות לקבצים ונתונים
    async ReadFileUpdate(path) {
        this.log.info(`קריאת קובץ מהנתיב: ${path}`);
        const fileContent = fs.readFileSync(path, 'utf8');
        const lines = fileContent.split(',');
        let x = (parseInt(lines[0]) + 1).toString();
        let y = (parseInt(lines[2]) + 1).toString();
        lines[0] = x;
        lines[2] = y;
        fs.writeFileSync(path, lines.join(','), 'utf8');
        return lines;
    }

    async ReadFile(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent.split('\n');
    }

    async ReadFileComment(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent.split('\n')
            .map(line => {
                const withoutComment = line.split('//')[0];
                return withoutComment.trim();
            })
            .filter(line => line !== '');
    }

    async WriteFile(filePath, line) {
        try {
            fs.writeFileSync(filePath, line, 'utf8');
        } catch (err) {
            this.log.info(err);
        }
    }

    async CharactersFile() {
        const filePath = this.po.dataFolder + '\\characters.txt';
        return fs.readFileSync(filePath, 'utf8');
    }

    CalculateCheckDigit(digits) {
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let digit = parseInt(digits[i]);
            if (i % 2 !== 0) {
                digit *= 2;
            }
            if (digit > 9) {
                digit = (digit % 10) + Math.floor(digit / 10);
            }
            sum += digit;
        }
        return (10 - (sum % 10)) % 10;
    }

    async GetRandomValidID() {
        let baseDigits = '';
        for (let i = 0; i < 8; i++) {
            baseDigits += Math.floor(Math.random() * 10);
        }
        const checkDigit = this.CalculateCheckDigit(baseDigits);
        return baseDigits + checkDigit.toString();
    }

    // פונקציות ולידציה של שדות שרצות על המסך
    async CheckCharacters(locatorOrString, name, chars = "") {
        this.log.info(`בודק תווים לשדה: ${name} במחלקת העזר המרכזית...`);
        const loc = (typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)
            : locatorOrString).first();
        const x = await this.CharactersFile();
        let bugs = 0;

        for (let i = 0; i < x.length; i++) {
            await loc.clear();
            await loc.fill(x[i]);
            let actualValue = await loc.inputValue();
            await this.page.keyboard.press('Tab');
            await this.page.waitForTimeout(500);

            if (await this.isVisibleSafe('mat-option', 2000)) {
                await this.page.keyboard.press('Escape');
            }
            await loc.click();

            let isBlocked = false;
            let shouldBeAllowed = chars.includes(x[i]);

            if (actualValue !== x[i]) {
                isBlocked = true;
            } else if (await this.isVisibleSafe('//span[contains(text(), "תו לא חוקי")]', 1000)) {
                isBlocked = true;
            }

            if (isBlocked && shouldBeAllowed) {
                this.log.info(`🐛 באג בשדה "${name}": התו "${x[i]}" חסום אבל צריך להיות מאופשר!`);
                bugs++;
            } else if (!isBlocked && !shouldBeAllowed) {
                this.log.info(`🐛 באג בשדה "${name}": התו "${x[i]}" מאופשר אבל צריך להיות חסום!`);
                bugs++;
            }
        }
        await loc.clear();

        if (bugs > 0) {
            this.log.info(`\n⚠️ נמצאו ${bugs} באגים בשדה "${name}":`);
        } else {
            this.log.info(`✅ שדה "${name}": לא נמצאו באגים - כל התווים מתנהגים כצפוי`);
        }
    }

    async CheckMaxLength(locatorOrString, max, name) {
        this.log.info(`בודק אורך מקסימלי (${max}) לשדה: ${name}...`);
        const loc = (typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)
            : locatorOrString).first();
        await loc.clear();
        await loc.fill('1'.repeat(max + 10));
        await this.page.keyboard.press('Tab');

        let actualLength = (await loc.inputValue()).length;

        if (actualLength === max) {
            this.log.info(`✓ שדה "${name}" מוגבל ל-${max} תווים כצפוי`);
        } else if (await this.isVisibleSafe('//span[contains(text(), "מקסימום")]', 3000)) {
            await loc.click();
            while (await this.isVisibleSafe('//span[contains(text(), "מקסימום")]', 1000)) {
                await this.page.keyboard.press('End');
                await this.page.keyboard.press('Backspace');
            }
            actualLength = (await loc.inputValue()).length;
            if (actualLength === max) {
                this.log.info(`✓ שדה "${name}" מוגבל ל-${max} תווים`);
            } else {
                this.log.error(`✗ שדה "${name}" - צפוי ${max} תווים, בפועל ${actualLength} תווים`);
            }
        } else {
            this.log.error(`✗ שדה "${name}" - צפוי ${max} תווים, בפועל ${actualLength} תווים`);
        }
        await loc.clear();
    }

    async CheckCharactersEmail(locatorOrString, name, chars = "") {
        this.log.info(`בודק תווים למייל בשדה: ${name}...`);
        const loc = (typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)
            : locatorOrString).first();
        const x = await this.CharactersFile();
        let bugs = 0;
        const mail = "@tast.com";

        for (let i = 0; i < x.length; i++) {
            await loc.clear();
            const y = x[i] + mail;
            await loc.fill(y);
            let actualValue = await loc.inputValue();
            await this.page.keyboard.press('Tab');
            await this.page.waitForTimeout(500);
            await loc.click();

            let isBlocked = false;
            let shouldBeAllowed = chars.includes(x[i]);

            if (actualValue !== y) {
                isBlocked = true;
            } else if (await this.isVisibleSafe('//*[contains(text(), "כתובת דואר אלקטרוני לא חוקית")]', 1000)) {
                isBlocked = true;
            }

            if (isBlocked && shouldBeAllowed) {
                this.log.info(`🐛 באג בשדה "${name}": התו "${x[i]}" חסום אבל צריך להיות מאופשר! 1`);
                bugs++;
            } else if (!isBlocked && !shouldBeAllowed) {
                this.log.info(`🐛 באג בשדה "${name}": התו "${x[i]}" מאופשר אבל צריך להיות חסום! 2`);
                bugs++;
            }
        }
        await loc.clear();

        if (bugs > 0) {
            this.log.info(`\n⚠️ נמצאו ${bugs} באגים בשדה "${name}":`);
        } else {
            this.log.info(`✅ שדה "${name}": לא נמצאו באגים - כל התווים מתנהגים כצפוי`);
        }
    }

    async CheckMaxEmail(locatorOrString, max, name) {
        this.log.info(`בודק אורך מקסימלי למייל (${max}) בשדה: ${name}...`);
        const domain = '@a.co';
        const usernameLength = max - domain.length;
        const emailAddress = 'a'.repeat(usernameLength) + domain;
        const loc = (typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)
            : locatorOrString).first();

        await loc.clear();
        await loc.fill(emailAddress);
        await this.page.keyboard.press('Tab');

        let actualLength = (await loc.inputValue()).length;
        if (actualLength === max) {
            this.log.info(`✓ שדה "${name}" מוגבל ל-${max} תווים`);
        } else if (await this.isVisibleSafe('//*[@class="error-message ng-star-inserted"]', 1000)) {
            await loc.click();
            while (await this.isVisibleSafe('//*[@class="error-message ng-star-inserted"]', 1000)) {
                await this.page.keyboard.press('Home');
                await this.page.keyboard.press('Delete');
            }
            actualLength = (await loc.inputValue()).length;
            if (actualLength === max) {
                this.log.info(`✓ שדה "${name}" מוגבל ל-${max} תווים`);
            } else {
                this.log.error(`✗ שדה "${name}" - צפוי ${max} תווים, בפועל ${actualLength} תווים`);
            }
        } else {
            this.log.error(`✗ שדה "${name}" - צפוי ${max} תווים, בפועל ${actualLength} תווים`);
        }
        await loc.clear();
    }

    async TestIsraeliPhoneNumberValidation(phoneInputOrString, fieldName = "טלפון") {
        this.log.info(`בודק ולידציית מספרי טלפון ישראליים במימוש הכללי...`);
        const phoneInput = phoneInputOrString || '//input[@aria-label="טלפון ראשי"]';
        const loc = (typeof phoneInput === 'string' ? this.page.locator(phoneInput) : phoneInput).first();

        const errors = {
            errorTelefonNo: '//span[contains(text(), "מספר הטלפון אינו תקין")]',
            errorTelefonArea: '//span[contains(text(), "קידומת לא תקינה")]',
            errorTelefonNum: '//span[contains(text(), "יש להזין ספרות בלבד")]'
        };
        
        const testCases = [
            { name: 'נייד תקין', input: '0521234567', valid: true },
            { name: 'נייח 1800', input: '1800454714', valid: true },
            { name: 'נייח 02', input: '024443432', valid: true },
            { name: 'נייח 03', input: '034443432', valid: true },
            { name: 'נייח 04', input: '044443432', valid: true },
            { name: 'נייח 08', input: '084443432', valid: true },
            { name: 'נייח 09', input: '094443432', valid: true },
            { name: 'נייח 07', input: '0744434329', valid: true },
            { name: 'קצר מדי', input: '0521234', valid: false, error: 'errorTelefonNo' },
            { name: 'ארוך מדי', input: '05212345678', valid: false, error: 'errorTelefonNo' },
            { name: 'אותיות', input: '052ABCDEFG', valid: false, error: 'errorTelefonNum' },
            { name: 'כוכבית', input: '*4300', valid: false, error: 'errorTelefonNum' },
            { name: 'ללא קידומת', input: '12145412368', valid: false, error: 'errorTelefonArea' },
            { name: 'עם מקף', input: '052-764-7412', valid: false, error: 'errorTelefonNum' },
            { name: 'נייח 02 ארוך', input: '0244434328', valid: false, error: 'errorTelefonNo' },
            { name: 'קידומת 01', input: '011234567', valid: false, error: 'errorTelefonArea' },
            { name: 'קידומת 05', input: '051234567', valid: false, error: 'errorTelefonNo' },
            { name: 'קידומת 06', input: '061234567', valid: false, error: 'errorTelefonArea' },
            { name: 'קידומת 07 קצר', input: '071234567', valid: false, error: 'errorTelefonNo' },
            { name: 'קידומת 00', input: '001234567', valid: false, error: 'errorTelefonArea' }
        ];

        let passed = 0, failed = 0;

        for (const test of testCases) {
            await loc.clear();
            await loc.fill(test.input);
            await this.page.keyboard.press('Tab');
            await this.page.waitForTimeout(500);

            let errorShown = null;
            for (const [key, locatorStr] of Object.entries(errors)) {
                if (await this.isVisibleSafe(locatorStr, 500)) {
                    errorShown = [key, locatorStr];
                    break;
                }
            }

            const hasError = !!errorShown;
            const errorType = errorShown ? errorShown[0] : null;
            const success = test.valid ? !hasError : (hasError && errorType === test.error);

            if (success) {
                passed++;
            } else {
                this.log.info(`✗ נכשל - צפוי: ${test.valid ? 'תקין' : test.error}, קיבלתי: ${hasError ? errorType : 'תקין'}`);
                failed++;
            }
        }
        this.log.info(`בדיקת שדה ${fieldName} הסתיימה`);
        this.log.info(`\n=== ${passed}/${testCases.length} עברו ===`);
    }

    // ===== פונקציה לבדיקת שדות חובה לפי איפיון =====
    async TestRequiredFieldsBySpec(requiredFields, pageName = "טופס") {
        this.log.info("\n" + "=".repeat(60));
        this.log.info(`=== התחלת בדיקת שדות חובה לפי איפיון - ${pageName} ===`);

        if (!requiredFields || requiredFields.length === 0) {
            this.log.error("❌ לא הועברו שדות חובה לבדיקה!");
            return { success: false, error: "No required fields provided" };
        }

        await this.page.waitForTimeout(2000);
        if (await this.isVisibleSafe('//moh-button[@class="next-btn ng-star-inserted"]', 1000)) {
            await this.page.locator('//moh-button[@class="next-btn ng-star-inserted"]').click();
        }
        if (await this.isVisibleSafe('//moh-button[@type="submit"]', 1000)) {
            await this.page.locator('//moh-button[@type="submit"]').click();
        }
        await this.page.waitForTimeout(2000);
        
        if (await this.isVisibleSafe('//button[@class="main-button narrow"]', 1000)) {
             await this.page.locator('//button[@class="main-button narrow"]').click();
        }
        await this.page.waitForTimeout(2000);

        let passed = 0;
        let failed = 0;
        const errors = [];

        for (const field of requiredFields) {
            const hasAsterisk = await this.isVisibleSafe(field.asteriskLocator, 1000);
            const hasError = await this.isVisibleSafe(field.errorLocator, 1000);

            if (hasAsterisk && hasError) {
                passed++;
            } else {
                failed++;
                if (!hasAsterisk && !hasError) {
                    errors.push(`${field.name}: חסרה כוכבית וחסרה הודעת שגיאה`);
                } else if (!hasAsterisk) {
                    errors.push(`${field.name}: חסרה כוכבית (יש הודעת שגיאה אבל אין סימון בכוכבית)`);
                } else if (!hasError) {
                    errors.push(`${field.name}: חסרה הודעת שגיאה (יש כוכבית אבל אין הודעת שגיאה)`);
                }
            }
        }

        this.log.info(`=== סיכום תוצאות - ${pageName} ===`);
        this.log.info(`סה"כ שדות חובה שנבדקו: ${requiredFields.length}`);
        this.log.info(`✓ שדות תקינים: ${passed}`);
        this.log.info(`✗ שדות עם בעיות: ${failed}`);

        if (errors.length > 0) {
            this.log.info("\n❌ רשימת בעיות שנמצאו:");
            errors.forEach((error, index) => {
                this.log.info(`   ${index + 1}. ${error}`);
            });
        } else {
            this.log.info("\n✅ מעולה! כל שדות החובה מסומנים נכון ומתריעים כשצריך!");
        }

        this.log.info("=".repeat(60));
    }

    async Hover() {
        await this.page.waitForTimeout(5000);
        let _attempts = 0;
        while (_attempts < 3) {
            try {
                await this.page.waitForTimeout(5000);
                const element = this.page.locator(this.po.regulationNotification.li).first();
                await element.scrollIntoViewIfNeeded();
                await element.hover();
                await this.page.waitForTimeout(1000);
                break;
            } catch (err) {
                _attempts++;
                this.log.info('Hover/click failed, attempt ' + _attempts, err);
                if (_attempts >= 3) throw err;
                await this.page.waitForTimeout(1000);
            }
        }
    }

    async EzerOpen() {
        let oldfilepath = this.po.dataFolder + '\\RP.txt';
        let bussines = await this.ReadFile(oldfilepath);
        return bussines[0] || bussines;
    }

    async OpenPageMancal(b = "") {
        let bussines = "";
        let code = "";
        if (b === "") {
            bussines = await this.EzerOpen();
        } else {
            bussines = b;
        }
        code = `//span[text() ="${bussines}"]`;
        await this.page.waitForTimeout(1000);

        this.log.info(`פותח עמוד מנכל של עסק ${bussines}`);
        await this.page.locator('//*[contains(text(), "מנכל")]').click();
        
        if (await this.isVisibleSafe('//div[@role="dialog"]', 2000)) {
            await this.page.locator('//button[@class="main-button narrow"]').click();
        }
        await this.page.waitForTimeout(500);
        
        if (!(await this.isVisibleSafe(code, 2000))) {
            bussines = await this.EzerOpen();
            code = `//span[text() ="${bussines}"]`;
        }
        await this.page.locator(code).click();
        return bussines;
    }

    async OpenDetails(locatorStr) {
        try {
            await this.OpenPageMancal();
            await this.page.locator('//a[contains(text(),"פרטי העסק")]').waitFor({ state: 'visible' });
            await this.page.waitForTimeout(2000);
            await this.page.locator('//a[contains(text(),"פרטי העסק")]').click();
            
            await this.page.waitForTimeout(2000);
            await this.page.locator('//span[contains(text(),"פעולות נוספות")]').waitFor({ state: 'visible' });
            await this.page.waitForTimeout(2000);
            await this.page.locator('//span[contains(text(),"פעולות נוספות")]').click();
            
            if (await this.isVisibleSafe(locatorStr, 1000)) {
                await locatorStr.click();
                await this.page.waitForTimeout(2000);
                return true;
            } else {
                this.log.info("הכפתור לא קיים");
                return false;
            }
        } catch (err) {
            this.log.info(err.message);
            return false;
        }
    }
}
module.exports = SharedUtils;