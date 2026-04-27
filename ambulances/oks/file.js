  module.exports = {

  // פונקציה בסיסית לקריאת תוכן של קובץ טקסט ופיצולו למערך של שורות.
    ReadFile: (filePath) => {
        var fs = require('fs')
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const lines = fileContent.split('\n');
        return lines
    },

     // קריאת קובץ טקסט, הסרת הערות מכל שורה (כל טקסט שמופיע אחרי //)
    // וסינון שורות ריקות, לקבלת נתוני אמת בלבד.
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

    // כתיבת שורה בודדת (או טקסט) לתוך קובץ (פעולת דריסה - Overwrite).
    WriteFile: (filePath, line) => {
        try {
            var fs = require('fs')
            fs.writeFileSync(filePath, line, 'utf8')
        } catch (err) { logg.info(err) }
    },

    // בדיקת ולידציה לאורך מקסימלי של שדה.
    // מזינה לשדה טקסט שארוך מהמקסימום המותר, ומוודאת שהמערכת חותכת את הטקסט או מציגה שגיאת ולידציה.
    CheckMaxLength: (locator, expectedMax, fieldName) => {
        errMax = po.regulationDealer.errorMax;//לשנות ללוקטור של הERROR במערכת
        log.info(`בדיקת אורך שדה ${fieldName}:`)
        web.clear(locator)
        // הקלדת ערך ארוך בכוונה - אורך מקסימלי בתוספת 10 תווים
        web.type(locator, '1'.repeat(expectedMax + 10))
        po.utils.pressTAB()
        var actualLength = web.getValue(locator).length

        if (actualLength === expectedMax) {
            log.info(`✓ שדה "${fieldName}" מוגבל ל-${expectedMax} תווים`)
        }
        else if (web.isVisible(errMax, 3000)) {
            // אם הופיעה שגיאת חריגה באורך, מוחקים תו-תו מסוף השדה עד שהשגיאה נעלמת
            web.click(locator)
            while (web.isVisible(errMax, 3000)) {
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

    // בדיקת ולידציה לאורך מקסימלי בשדה מסוג אימייל.
    // מייצרת כתובת אימייל ארוכה ובודקת את מגבלת התווים (תוך התחשבות באורך תבנית הדומיין).
    CheckMaxEmail: (locator, expectedMax, fieldName = "מייל") => {
        errMax = po.regulationDealer.error;//לשנות ללוקטור של הERROR במערכת
        log.info(`בדיקת אורך שדה ${fieldName}:`)
        var domain = '@a.co'
        var usernameLength = expectedMax - domain.length;
        // מרכיבה כתובת אימייל באורך המקסימלי המדויק (לפני ניסיון ההכשלה)
        const username = 'a'.repeat(usernameLength);
        const emailAddress = username + domain;
        web.clear(locator)
        web.type(locator, emailAddress)
        po.utils.pressTAB()
        var actualLength = web.getValue(locator).length
        if (actualLength == expectedMax) {
            log.info(`✓ שדה "${fieldName}" מוגבל ל-${expectedMax} תווים`)
        }
        else if (web.isVisible(errMax, 1000)) {
            web.click(locator)
            // מחיקת תווים מתחילת השדה כדי לבדוק מתי נעלמת שגיאת האורך
            while (web.isVisible(errMax, 1000)) {
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

     // סורקת שדה טקסט על ידי הזנת מגוון תווים מיוחדים.
    // עבור כל תו היא מוודאת האם המערכת חוסמת אותו או מאשרת אותו, בהתאמה למחרוזת `chars` המכילה את התווים המותרים.
    CheckCharacters: (locator, fieldName, chars = "") => {
        log.info(`בדיקת תוים לשדה ${fieldName}:`)
        var x = "!@#$%^&*()_+-"
        var actualValue = ""
        var bugs = 0
        for (var i = 0; i < x.length; i++) {
            web.clear(locator)
            web.type(locator, x[i])
            actualValue = web.getValue(locator)
            po.utils.pressTAB()
            web.pause(500)
            // אם כתוצאה מההקלדה נפתחה במפתיע רשימה נפתחת, מפעילים Esc לסגירה
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
            // השוואה בין ההתנהגות בפועל להתנהגות המצופה - ספירת חריגות (באגים)
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

     // פונקציית עזר: מחשבת את ספרת הביקורת (Check Digit) של תעודת זהות ישראלית לפי אלגוריתם מודולו 10.
    CalculateCheckDigit: (digits) => { 
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

    // הפונקציה הראשית: מחוללת ומחזירה מספר תעודת זהות ישראלית תקין ורנדומלי (9 ספרות) כולל ספרת ביקורת חוקית.
    GetRandomValidID: () => { 
        let baseDigits = '';
        for (let i = 0; i < 8; i++) {
            baseDigits += Math.floor(Math.random() * 10); // 1. ייצור 8 הספרות הראשונות באופן רנדומלי (0-9):
        }
        const checkDigit = po.CalculateCheckDigit(baseDigits); // 2. חישוב ספרת הביקורת עבור 8 הספרות הללו
        const fullID = baseDigits + checkDigit.toString(); // 3. הרכבת המספר הסופי בן 9 ספרות
        //log.info(`Generated random valid ID: ${fullID}`);
        return fullID;
    },

    // מבצעת בדיקת ולידציה מקיפה על שדה מספר טלפון ישראלי.
    // מריצה סט של עשרות מקרי בדיקה (כגון קידומות לא תקינות, אותיות, אורך חורג) ומוודאת את הופעת הודעת השגיאה המדויקת.
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
            // חיפוש וזיהוי של אחת מהודעות השגיאה (מתוך מערך השגיאות האפשריות) המופיעה על המסך
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
            var errChar = po.address.errorEmail;
            if (web.isVisible(errChar, 1000)) {
                isBlocked = true;
            } else if (actualValue != y) {
                isBlocked = true;
            }
            if (actualValue != y) {
                isBlocked = true;
            } else if (web.isVisible(errChar, 1000)) {
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



}