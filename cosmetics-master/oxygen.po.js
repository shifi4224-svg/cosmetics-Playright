module.exports = {
    oneSecondTimeout: 1000,
    fiveSecondsTimeout: 5000,
    oneMinuteTimeout: 60 * 1000,
    dataFolder: require('path').join(__dirname, '/Data'),
    loginPage: require('./Pages/LoginPage.js'),
    emailPage: require('./Pages/EmailPage.js'),
    regulationDealer: require('./Pages/Dealer.js'),
    regulationTaagidRP: require('./Pages/RegulationTaagidRP.js'),
    regulationRP: require('./Pages/RegulationRP.js'),
    regulationItem: require('./Pages/RegulationItem.js'),
    regulationNotification: require('./Pages/RegulationNotification.js'),
    materials: require('./Pages/Materials.js'),
    address: require('./Pages/Address.js'),
    pagesDealer: require('./Pages/PagesDealer.js'),
    editBussinesDetails: require('./Pages/EditBussinesDetails.js'),
    chageActivityBussines: require('./Pages/ChageActivityBussines.js'),
    updateProperImporter: require('./Pages/UpdateProperImporter.js'),
    properNotification: require('./Pages/properNotification.js'),
    properProduction: require('./Pages/ProperProduction.js'),
    supervisedEmploee: require('./Pages/SupervisedEmploee.js'),
    files: require('./Pages/Files.js'),
    pagesNotification: require('./Pages/PagesNotification.js'),
    items: require('./Pages/Items.js'),
    settings: require('./Pages/Settings.js'),
    after72HBasic: require('./Pages/After72HBasic.js'),






    utils: {
        pressENTER: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE007')
        },

        pressEND: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE010')
        },

        pressTAB: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE004')
        },

        pressBACKSPACE: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE003')
        },

        pressF12: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE035')
        },

        pressARROW_DOWN: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE015')
        },

        pressDELETE: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE017')
        },
        pressHOME: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE011')
        },

        pressESC: () => {
            web.pause(po.oneSecondTimeout)
            web.sendKeys('\uE00C')
        },

    },
    sessionLogs: "",
    originalLog: null,
    InitLogCapture: function () {
        this.sessionLogs = ""; // איפוס
        this.originalLog = log.info; // שמירת המקור

        // דריסת הפונקציה - שימי לב לשימוש ב-self או חץ כדי לשמור על ההקשר
        const self = this;
        log.info = function (message) {
            self.sessionLogs += message + "\n";
            self.originalLog.apply(log, arguments);
        };
    },

    SaveLogsToFile: function () {
        const fs = require('fs');
        const path = require('path');

        try {
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}`;
            const filePath = path.join(__dirname, `Log_${timestamp}.txt`);

            fs.writeFileSync(filePath, this.sessionLogs, 'utf8');

            // החזרת המצב לקדמותו
            log.info = this.originalLog;
            log.info("--- File saved: " + filePath + " ---");
        } catch (e) {
            if (this.originalLog) this.originalLog.call(log, "Error: " + e.message);
        }
    },


    ReadFileUpdate: (filePath) => {
        var fs = require('fs')
        // קריאת הקובץ
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const lines = fileContent.split(',');
        var x = (parseInt(lines[0]) + 1).toString()
        var y = (parseInt(lines[2]) + 1).toString()
        lines[0] = x
        lines[2] = y
        fs.writeFileSync(filePath, lines, 'utf8')
        //fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
        // החזרת התוכן כמשתנה
        return lines
    },

    ReadFile: (filePath) => {
        var fs = require('fs')
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const lines = fileContent.split('\n');
        return lines
    },

    ReadFileComment: (filePath) => {
        var fs = require('fs')
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const lines = fileContent.split('\n')
            .map(line => {
                // הסר הערות מסוף השורה (# או //)
                const withoutComment = line.split('//')[0];
                return withoutComment.trim();
            })
            .filter(line => line !== ''); // התעלם משורות ריקות
        return lines
    },

    WriteFile: (filePath, line) => {
        try {
            var fs = require('fs')
            fs.writeFileSync(filePath, line, 'utf8')
        } catch (err) { logg.info(err) }
    },

    CheckMaxLength: (locator, expectedMax, fieldName) => {
        log.info(`בדיקת אורך שדה ${fieldName}:`)
        web.clear(locator)
        web.type(locator, '1'.repeat(expectedMax + 10))
        po.utils.pressTAB()
        var actualLength = web.getValue(locator).length

        if (actualLength === expectedMax) {
            log.info(`✓ שדה "${fieldName}" מוגבל ל-${expectedMax} תווים`)
        }
        else if (web.isVisible(po.regulationDealer.errorMax, 3000)) {
            web.click(locator)
            while (web.isVisible(po.regulationDealer.errorMax, 3000)) {
                po.utils.pressEND()
                po.utils.pressBACKSPACE()
            }
            actualLength = web.getValue(locator).length
            if (actualLength === expectedMax) {
                log.info(`✓ שדה "${fieldName}" מוגבל ל-${expectedMax} תווים`)
            }
            else {
                log.error(`✗ שדה "${fieldName}" - צפוי ${expectedMax} תווים, בפועל ${actualLength} תווים`)
            }
        }
        else {
            log.error(`✗ שדה "${fieldName}" - צפוי ${expectedMax} תווים, בפועל ${actualLength} תווים`)
        }
        web.clear(locator)
    },

    CheckMaxEmail: (locator, expectedMax, fieldName = "מייל") => {
        log.info(`בדיקת אורך שדה ${fieldName}:`)
        var domain = '@a.co'
        var usernameLength = expectedMax - domain.length;
        const username = 'a'.repeat(usernameLength);
        const emailAddress = username + domain;
        web.clear(locator)
        web.type(locator, emailAddress)
        po.utils.pressTAB()
        var actualLength = web.getValue(locator).length
        if (actualLength == expectedMax) {
            log.info(`✓ שדה "${fieldName}" מוגבל ל-${expectedMax} תווים`)
        }
        else if (web.isVisible(po.regulationDealer.error, 1000)) {
            web.click(locator)
            while (web.isVisible(po.regulationDealer.error, 1000)) {
                po.utils.pressHOME()
                po.utils.pressDELETE()
            }
            actualLength = web.getValue(locator).length
            if (actualLength === expectedMax) {
                log.info(`✓ שדה "${fieldName}" מוגבל ל-${expectedMax} תווים`)
            }
            else {
                log.error(`✗ שדה "${fieldName}" - צפוי ${expectedMax} תווים, בפועל ${actualLength} תווים`)
            }
        }
        else {
            log.error(`✗ שדה "${fieldName}" - צפוי ${expectedMax} תווים, בפועל ${actualLength} תווים`)
        }
        web.clear(locator)
    },

    CharactersFile: () => {
        var fs = require('fs')
        var filePath = po.dataFolder + '\\characters.txt'
        const lines = fs.readFileSync(filePath, 'utf8')
        return lines
    },

    CheckCharacters: (locator, fieldName, chars = "") => {
        log.info(`בדיקת תוים לשדה ${fieldName}:`)
        var x = po.CharactersFile()
        var actualValue = ""
        var bugs = 0
        for (var i = 0; i < x.length; i++) {
            web.clear(locator)
            web.type(locator, x[i])
            actualValue = web.getValue(locator)
            po.utils.pressTAB()
            web.pause(500)
            if (web.isVisible('mat-option', 2000)) {
                po.utils.pressESC()
            }
            web.click(locator)
            var isBlocked = false;
            var shouldBeAllowed = chars.includes(x[i]);
            if (actualValue != x[i]) {
                isBlocked = true;
            } else if (web.isVisible(po.regulationDealer.errorChar, 1000)) {
                isBlocked = true;
            }
            if (isBlocked && shouldBeAllowed) {
                log.info(`🐛 באג בשדה "${fieldName}": התו "${x[i]}" חסום אבל צריך להיות מאופשר!`);
                bugs++
            } else if (!isBlocked && !shouldBeAllowed) {
                log.info(`🐛 באג בשדה "${fieldName}": התו "${x[i]}" מאופשר אבל צריך להיות חסום!`);
                bugs++
            }
            actualValue = "";
        }
        web.clear(locator);

        if (bugs > 0) {
            log.info(`\n⚠️ נמצאו ${bugs} באגים בשדה "${fieldName}":`);
        } else {
            log.info(`✅ שדה "${fieldName}": לא נמצאו באגים - כל התווים מתנהגים כצפוי`);
        }
    },

    CalculateCheckDigit: (digits) => { // פונקציית עזר: מחשבת את ספרת הביקורת (Check Digit) לפי אלגוריתם מודולו 10.
        let sum = 0;
        for (let i = 0; i < digits.length; i++) { // עוברים על 8 הספרות
            let digit = parseInt(digits[i]);
            if (i % 2 !== 0) { // מכפילים את הספרות במקומות הזוגיים (1, 3, 5, 7) פי 2
                digit *= 2;
            }
            if (digit > 9) {  // אם המכפלה גדולה מ-9 (כלומר 10-18), מחברים את הספרות שלה (למשל: 15 הופך ל-1+5=6)
                digit = (digit % 10) + Math.floor(digit / 10);
            }
            sum += digit;
        }
        return (10 - (sum % 10)) % 10; // מציאת ספרת הביקורת: המספר שצריך להוסיף לסכום כדי שיתחלק ב-10
    },

    GetRandomValidID: () => { // הפונקציה הראשית: יוצרת תעודת זהות ישראלית תקינה רנדומלית בת 9 ספרות.
        let baseDigits = '';
        for (let i = 0; i < 8; i++) {
            baseDigits += Math.floor(Math.random() * 10); // 1. ייצור 8 הספרות הראשונות באופן רנדומלי (0-9):
        }
        const checkDigit = po.CalculateCheckDigit(baseDigits); // 2. חישוב ספרת הביקורת עבור 8 הספרות הללו
        const fullID = baseDigits + checkDigit.toString(); // 3. הרכבת המספר הסופי בן 9 ספרות
        //log.info(`Generated random valid ID: ${fullID}`);
        return fullID;
    },

    TestIsraeliPhoneNumberValidation: (phoneInput = po.address.telefon, fieldName = "טלפון") => {
        log.info(`בדיקת ולידציה על שדה ${fieldName}:`)
        const errors = {
            errorTelefonNo: po.address.errorTelefonNo,
            errorTelefonArea: po.address.errorTelefonArea,
            errorTelefonNum: po.address.errorTelefonNum
        }
        const testCases = [
            // מקרים תקינים
            { name: 'נייד תקין', input: '0521234567', valid: true },
            { name: 'נייח 1800', input: '1800454714', valid: true },
            { name: 'נייח 02', input: '024443432', valid: true },
            { name: 'נייח 03', input: '034443432', valid: true },
            { name: 'נייח 04', input: '044443432', valid: true },
            { name: 'נייח 08', input: '084443432', valid: true },
            { name: 'נייח 09', input: '094443432', valid: true },
            { name: 'נייח 07', input: '0744434329', valid: true },

            // מקרים לא תקינים
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
            { name: 'קידומת 00', input: '001234567', valid: false, error: 'errorTelefonArea' },
        ];
        let passed = 0, failed = 0;
        testCases.forEach(test => {
            //log.info(`--- ${test.name}: ${test.input} ---`);
            web.clear(phoneInput);
            web.type(phoneInput, test.input);
            po.utils.pressTAB();
            // המתן שההולידציה תסתיים
            web.pause(500);
            // בדיקת נוכחות שגיאה
            const errorShown = Object.entries(errors).find(([key, locator]) => {
                try {
                    return web.isVisible(locator, 500);
                } catch {
                    return false;
                }
            })

            const hasError = !!errorShown;
            const errorType = errorShown ? errorShown[0] : null;

            // אימות תוצאה
            const success = test.valid ? !hasError : (hasError && errorType === test.error);

            if (success) {
                //log.info(`✓ עבר`);
                passed++;
            } else {
                log.info(`✗ נכשל - צפוי: ${test.valid ? 'תקין' : test.error}, קיבלתי: ${hasError ? errorType : 'תקין'}`);
                failed++;
            }
        })
        log.info(`בדיקת שדה ${fieldName} הסתיימה`)
        log.info(`\n=== ${passed}/${testCases.length} עברו ===`);
    },

    // ===== פונקציה לבדיקת שדות חובה לפי איפיון =====
    TestRequiredFieldsBySpec: (requiredFields, pageName = "טופס") => {
        log.info("\n" + "=".repeat(60));
        log.info(`=== התחלת בדיקת שדות חובה לפי איפיון - ${pageName} ===`);
        //log.info(`מספר שדות חובה צפויים: ${requiredFields.length}`);

        // בדיקת תקינות קלט
        if (!requiredFields || requiredFields.length === 0) {
            log.error("❌ לא הועברו שדות חובה לבדיקה!");
            return { success: false, error: "No required fields provided" };
        }

        /*// הדפסת רשימת השדות שייבדקו
        log.info("\n📋 שדות חובה לפי איפיון:");
        requiredFields.forEach((field, index) => {
            log.info(`   ${index + 1}. ${field.name}`);
        })*/

        // 1. ניקוי כל השדות החובה
        // log.info("\n--- שלב 1: ניקוי כל השדות ---");
        //for (const field of requiredFields) {
        // try {
        //    web.waitForVisible(field.inputLocator, 5000);
        // הוספת קליק קטן כדי לתת לשדה פוקוס
        //    web.click(field.inputLocator); 
        //    web.clear(field.inputLocator);
        //  log.info(`  ניקיתי: ${field.name}`);
        //} catch (e) {
        //  log.info(`⚠ לא ניתן לנקות שדה: ${field.name}`);
        // }
        //}

        // 2. לחיצה על כפתור "הבא" כדי להפעיל ולידציה
        //log.info("\n--- שלב 2: לחיצה על כפתור 'הבא' להפעלת ולידציה ---");
        web.pause(2000)
        if (web.isVisible(po.regulationDealer.nextStep, 1000)) {
            web.click(po.regulationDealer.nextStep);
        }
        if (web.isVisible(po.regulationDealer.saveSubmit, 1000)) {
            web.click(po.regulationDealer.saveSubmit)
        }
        web.pause(2000);
        web.click(po.regulationDealer.okEnd)
        web.pause(2000);

        // 3. בדיקה לכל שדה חובה: כוכבית + הודעת שגיאה
        //log.info("\n--- שלב 3: בדיקת כוכבית והודעת שגיאה לכל שדה ---");

        let passed = 0;
        let failed = 0;
        const errors = [];

        // עבור כל שדה ברשימת שדות החובה
        for (const field of requiredFields) {
            // בדיקה האם יש כוכבית שמסמנת שדה חובה
            const hasAsterisk = web.isVisible(field.asteriskLocator, 1000);

            // בדיקה האם יש הודעת שגיאה שמופיעה בזמן שהשדה ריק
            const hasError = web.isVisible(field.errorLocator, 1000);

            // אם מופיעה גם כוכבית וגם הודעת שגיאה - השדה תקין
            if (hasAsterisk && hasError) {
                passed++;
            } else {
                failed++;
                // תיעוד מה בדיוק חסר בשדה
                if (!hasAsterisk && !hasError) {
                    errors.push(`${field.name}: חסרה כוכבית וחסרה הודעת שגיאה`);
                } else if (!hasAsterisk) {
                    errors.push(`${field.name}: חסרה כוכבית (יש הודעת שגיאה אבל אין סימון בכוכבית)`);
                } else if (!hasError) {
                    errors.push(`${field.name}: חסרה הודעת שגיאה (יש כוכבית אבל אין הודעת שגיאה)`);
                }
            }
        }

        // סיכום תוצאות הבדיקה
        log.info(`=== סיכום תוצאות - ${pageName} ===`);
        log.info(`סה"כ שדות חובה שנבדקו: ${requiredFields.length}`);
        log.info(`✓ שדות תקינים: ${passed}`);
        log.info(`✗ שדות עם בעיות: ${failed}`);

        if (errors.length > 0) {
            log.info("\n❌ רשימת בעיות שנמצאו:");
            errors.forEach((error, index) => {
                log.info(`   ${index + 1}. ${error}`);
            })
        } else {
            log.info("\n✅ מעולה! כל שדות החובה מסומנים נכון ומתריעים כשצריך!");
        }

        log.info("=".repeat(60));

    },

    // CheckCharactersEmail - בדיקת תווים בשדה מייל (מצמיד סיומת) ומחפש חריגות
    CheckCharactersEmail: (locator, fieldName, chars) => {
        log.info(`בדיקת תוים לשדה ${fieldName}:`)
        var x = po.CharactersFile(); // כל התווים מהרשימה
        var actualValue = "";
        var mail = "@tast.com"; // סיומת לדוגמה
        var y = "";
        var bugs = 0;

        for (var i = 0; i < x.length; i++) {
            web.clear(locator);
            y = x[i] + mail; // החזקת תו + סיומת
            web.type(locator, y);
            actualValue = web.getValue(locator);
            po.utils.pressTAB();
            web.pause(500);
            web.click(locator);

            var isBlocked = false;
            var shouldBeAllowed = chars.includes(x[i]);

            // בדוק אם התו חסום או הופיעה שגיאה
            if (actualValue != y) {
                isBlocked = true;
            } else if (web.isVisible(po.address.errorEmail, 1000)) {
                isBlocked = true;
            }

            // בדוק חוסר התאמה בין המצופה לבין המצב בפועל
            if (isBlocked && shouldBeAllowed) {
                log.info(`🐛 באג בשדה "${fieldName}": התו "${x[i]}" חסום אבל צריך להיות מאופשר! 1`);
                bugs++
            } else if (!isBlocked && !shouldBeAllowed) {
                log.info(`🐛 באג בשדה "${fieldName}": התו "${x[i]}" מאופשר אבל צריך להיות חסום! 2`);
                bugs++
            }

            actualValue = "";
        }

        web.clear(locator);

        // סיכום בעיות
        if (bugs > 0) {
            log.info(`\n⚠️ נמצאו ${bugs} באגים בשדה "${fieldName}":`);
        } else {
            log.info(`✅ שדה "${fieldName}": לא נמצאו באגים - כל התווים מתנהגים כצפוי`);
        }

    },

    // Hover - ריחוף מעל אלמנט (מייצר אירועי mouse) עם ניסיונות חוזרים
    Hover: () => {
        web.pause(5000)
        let _attempts = 0
        while (_attempts < 3) {
            try {
                web.pause(5000)

                // מציאת האלמנט
                const element = web.findElement(po.regulationNotification.li)

                // שליחת אירועי עכבר כדי לחקות hover
                web.execute(
                    "var el = arguments[0];" +
                    "el.scrollIntoView({block: 'center'});" +
                    "var mouseenter = new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window});" +
                    "var mouseover = new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window});" +
                    "var mousemove = new MouseEvent('mousemove', {bubbles: true, cancelable: true, view: window});" +
                    "el.dispatchEvent(mouseenter);" +
                    "el.dispatchEvent(mouseover);" +
                    "el.dispatchEvent(mousemove);",
                    element
                )

                web.pause(1000) // המתנה קצרה לאחר הפעולה

                break

            } catch (err) {
                _attempts++
                log.info('Hover/click failed, attempt ' + _attempts, err)
                if (_attempts >= 3) throw err
                web.pause(1000)
            }
        }
    },

    // EzerOpen - קורא רשימת עסקים מקובץ RP.txt
    EzerOpen: () => {
        let oldfilepath = po.dataFolder + '\\RP.txt'
        let bussines = po.ReadFile(oldfilepath) // קריאת קובץ בעזרת ReadFile
        return bussines
    },

    // OpenPageMancal - לפתיחת פריט מסוים ברשימה באמצעות XPath שמבוסס על תוכן
    OpenPageMancal: (b = "") => {
        let bussines = ""
        let code = ""
        if (b == "") {
            bussines = po.EzerOpen() // אם לא הועבר קוד, קבל מהקובץ
        }
        else {
            bussines = b
        }
        code = `//span[text() ="${bussines}"]` // יצירת XPath לחיפוש על פי טקסט
        web.pause(1000)

        log.info(`פותח עמוד מנכל של עסק ${bussines}`)
        web.click(po.regulationItem.mancal) // פתיחת הרשימה
        if (web.isVisible(po.regulationDealer.dialog, 2000)) {
            web.click(po.regulationDealer.okEnd)
        }
        web.pause(500)
        if (!web.isVisible(code, 2000)) {
            bussines = po.EzerOpen()
            code = `//span[text() ="${bussines}"]`
        }
        web.click(code) // לחיצה על הפריט שנמצא
        return bussines
    },

    OpenDetails: (locator) => {
        try {
            po.OpenPageMancal()
            web.waitForVisible(po.updateProperImporter.businessDetails)
            web.pause(2000)
            web.click(po.updateProperImporter.businessDetails)
            web.pause(2000)
            web.waitForVisible(po.updateProperImporter.actions)
            web.pause(2000)
            web.click(po.updateProperImporter.actions)
            if (web.isVisible(locator, 1000)) {
                web.click(locator)
                web.pause(2000)
                return true
            }
            else {
                log.info("הכפתור לא קיים")
                return false
            }
        } catch (err) {
            log.info(err.message)
        }
    },

}