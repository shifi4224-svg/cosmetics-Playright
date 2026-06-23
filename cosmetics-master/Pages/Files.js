const path = require('path');

class FilesPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        // לוקטורים שקשורים לקבצים - מוגדרים כאן כדי למנוע תלות מעגלית במחלקות אחרות
        this.errorFileBug = this.page.locator('//span[contains(text(),"העלאת קובץ נכשלה")]');
        this.delFile = this.page.locator('//i[@class="moh-icon delete"]');
        this.errorFile = this.page.locator('//span[contains(text(), "לא נתמך")]');
        this.selectFileShades = this.page.locator('//app-notification-shades//div[@class="upload-button"]');
        this.selectFileKit = this.page.locator('//app-notification-kits//div[@class="upload-button"]');
        this.closeButton = this.page.locator('//moh-button[@textkey="סגור"]');
    }

    // מתודת עזר להמתנה ובדיקת נראות
    async isVisibleSafe(locatorOrString, timeout = 0) {
        const loc = typeof locatorOrString === 'string'
            ? this.page.locator(locatorOrString)  // ← נכון
            : locatorOrString;
        const firstLoc = loc.first();
        if (timeout > 0) {
            await firstLoc.waitFor({ state: 'visible', timeout }).catch(() => { });
        }
        return await firstLoc.isVisible();
    }

    // פונקציה לפתיחת דיאלוג בחירת קובץ (רק לגוון וערכה)
    async openFileDialog(name) {
        if (name === "גוון") {
            await this.selectFileShades.click();
        } else if (name === "ערכה") {
            await this.selectFileKit.click();
        }
    }

    // פונקציה לסגירת דיאלוג (רק לגוון וערכה)
    async closeFileDialog(name) {
        console.log(`מנסה לסגור את דיאלוג הקבצים עבור סוג: ${name}  42`);
        if (name === "גוון" || name === "ערכה") {
            console.log("נלחץ על כפתור סגירת הדיאלוג  44");
            await this.closeButton.click();
        }
    }

    // פונקציה לצירוף קובץ בודד
    async AtachFile(elementAttach = "", fileName = "Doc1.pdf", name = "קובץ") {
        await this.page.waitForTimeout(1000);
        console.log(`מצרף קובץ: ${fileName}`);

        let upload;
        if (elementAttach) {
            const baseLocator = typeof elementAttach === 'string' ? this.page.locator(elementAttach) : elementAttach;
            upload = baseLocator.locator('//*[@type="file"]');
        } else {
            upload = this.page.locator('//*[@type="file"]');
        }

        try {
            // אם זה גוון או ערכה - פותחים את הדיאלוג
            await this.openFileDialog(name);
            await this.page.waitForTimeout(2000);
            // מצרפים את הקובץ
            const oldfilepath = path.join(__dirname, '../Data', fileName);
            // ב-Playwright פקודת setInputFiles מטפלת ברוב המקרים גם ב-inputs מוסתרים
            await upload.setInputFiles(oldfilepath);
            // בודקים אם יש שגיאה
            let hasError = 0;
            if (await this.isVisibleSafe(this.errorFileBug, 2000)) {
                hasError = 1;
            }
            await this.page.waitForTimeout(1000);

            // הדיאלוג נסגר אוטומטית אחרי צירוף קובץ - לא צריך לסגור ידנית
            return hasError;

        } catch (err) {
            this.log.error(`קובץ לא צורף: ${fileName}`);
            this.log.error(err.message);
            return 1;
        }
    }

    // פונקציה למחיקת קובץ מצורף
    async deleteAttachedFile(uploadLocator = "", name) {
        try {
            // אם זה גוון או ערכה - פותחים את הדיאלוג שוב כדי לגשת למחיקה
            await this.openFileDialog(name);

            await this.page.waitForTimeout(1000);

            let delFile;
            if (uploadLocator) {
                const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
                delFile = baseLocator.locator('//i[@class="moh-icon delete"]');
            } else {
                delFile = this.delFile;
            }

            if (await delFile.count() > 0) {
                await delFile.first().click();
                await this.page.waitForTimeout(1000);
                //this.log.info("הקובץ נמחק בהצלחה");
                return true;
            }
            return false;

        } catch (err) {
            this.log.error(`שגיאה במחיקת קובץ: ${err.message}`);
            return false;
        }
    }

    // פונקציה לבדיקת תווים מאופשרים בשם קובץ
    async TestFileNameValidation(uploadLocator = "", fname = "קובץ", baseFileName = "Doc1.pdf") {
        this.log.info(`בדיקת תווים מאופשרים בשם קובץ עבור שדה: ${fname}`);

        const fs = require('fs');
        const os = require('os');

        // כל התווים לבדיקה — אותו סט כמו CheckCharacters
        const charsToTest = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~אבגדהוזחטיכלמנסעפצקרשתABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('');

        const ext = baseFileName.includes('.') ? baseFileName.split('.').pop() : 'pdf';
        const tempDir = this.po?.dataFolder || path.join(__dirname, '../Data');

        let allowedChars = '';
        let bugs = 0;

        this.log.info(`בודק ${charsToTest.length} תווים אחד אחד...`);

        for (const char of charsToTest) {
            // תווים שלא חוקיים כלל ב-Windows כשמות קבצים — דלג
            if ('\\/:"*?<>|'.includes(char)) {
                this.log.info(`ℹ️ תו "${char}" — לא חוקי בשם קובץ ב-Windows, מדלג`);
                continue;
            }

            const testFileName = `test_${char}.${ext}`;
            const sourcePath = path.join(tempDir, baseFileName);
            const tempPath = path.join(os.tmpdir(), testFileName);

            try {
                // יצירת קובץ זמני עם השם הנבדק
                fs.copyFileSync(sourcePath, tempPath);
            } catch (err) {
                this.log.info(`ℹ️ תו "${char}" — לא ניתן ליצור קובץ עם שם זה: ${err.message}`);
                continue;
            }

            // ניסיון לצרף
            let upload;
            if (uploadLocator) {
                const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
                upload = baseLocator.locator('//*[@type="file"]');
            } else {
                upload = this.page.locator('//*[@type="file"]');
            }

            try {
                await this.openFileDialog(fname);
                await this.page.waitForTimeout(500);
                await upload.setInputFiles(tempPath);
                await this.page.waitForTimeout(1000);

                const hasError = await this.isVisibleSafe(this.errorFileBug, 2000)
                    || await this.isVisibleSafe(this.errorFile, 1000);

                if (!hasError) {
                    this.log.info(`✅ תו "${char}" — מאופשר בשם קובץ`);
                    allowedChars += char;
                    await this.deleteAttachedFile(uploadLocator, fname);
                } else {
                    this.log.info(`🚫 תו "${char}" — חסום בשם קובץ`);
                }
            } catch (err) {
                this.log.info(`🚫 תו "${char}" — שגיאה בצירוף: ${err.message}`);
            } finally {
                try { fs.unlinkSync(tempPath); } catch {}
            }
        }

        // יצירת קובץ עם כל התווים המאופשרים בשמו וצירופו
        if (allowedChars.length > 0) {
            const allAllowedName = `test_${allowedChars}.${ext}`;
            const allAllowedPath = path.join(os.tmpdir(), allAllowedName);

            try {
                fs.copyFileSync(path.join(tempDir, baseFileName), allAllowedPath);

                this.log.info(`\n📎 מצרף קובץ עם כל התווים המאופשרים: "${allAllowedName}"`);

                let upload;
                if (uploadLocator) {
                    const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
                    upload = baseLocator.locator('//*[@type="file"]');
                } else {
                    upload = this.page.locator('//*[@type="file"]');
                }

                await this.openFileDialog(fname);
                await this.page.waitForTimeout(500);
                await upload.setInputFiles(allAllowedPath);
                await this.page.waitForTimeout(1000);

                const finalError = await this.isVisibleSafe(this.errorFileBug, 2000);
                if (!finalError) {
                    this.log.info(`✅ קובץ עם כל התווים המאופשרים צורף בהצלחה`);
                    await this.deleteAttachedFile(uploadLocator, fname);
                } else {
                    this.log.error(`✗ קובץ עם כל התווים המאופשרים נכשל בצירוף`);
                    bugs++;
                }

                try { fs.unlinkSync(allAllowedPath); } catch {}
            } catch (err) {
                this.log.error(`שגיאה ביצירת קובץ תווים מאופשרים: ${err.message}`);
            }
        }

        // סיכום
        this.log.info(`\n========================================`);
        this.log.info(`סיכום בדיקת שמות קבצים — שדה: ${fname}`);
        this.log.info(`תווים מאופשרים (${allowedChars.length}): "${allowedChars}"`);
        if (bugs > 0) {
            this.log.error(`נמצאו ${bugs} באגים`);
        } else {
            this.log.info(`✅ הבדיקה הסתיימה ללא באגים`);
        }
        this.log.info(`========================================`);

        await this.closeFileDialog(fname);
        return { allowedChars, bugs };
    }

    // פונקציה לבדיקת אורך מקסימלי של שם קובץ (100 תווים)
    async TestFileNameMaxLength(uploadLocator = "", fname = "קובץ", baseFileName = "Doc1.pdf", maxLength = 100) {
        this.log.info(`בדיקת אורך מקסימלי (${maxLength}) לשם קובץ בשדה: ${fname}`);

        const fs = require('fs');
        const os = require('os');

        const ext = baseFileName.includes('.') ? baseFileName.split('.').pop() : 'pdf';
        const sourcePath = path.join(this.po?.dataFolder || path.join(__dirname, '../Data'), baseFileName);

        let upload;
        if (uploadLocator) {
            const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
            upload = baseLocator.locator('//*[@type="file"]');
        } else {
            upload = this.page.locator('//*[@type="file"]');
        }

        let bugs = 0;

        // --- בדיקה 1: שם של maxLength+1 תווים — צריך לגרום לשגיאה ---
        const longName = 'א'.repeat(maxLength + 1 - ext.length - 1) + `.${ext}`;
        const longPath = path.join(os.tmpdir(), longName);
        try {
            fs.copyFileSync(sourcePath, longPath);
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles(longPath);
            await this.page.waitForTimeout(1500);

            const hasError = await this.isVisibleSafe(this.errorFileBug, 2000)
                || await this.isVisibleSafe(this.errorFile, 1000);

            if (hasError) {
                this.log.info(`✅ שם קובץ עם ${maxLength + 1} תווים — נחסם כצפוי`);
                await this.deleteAttachedFile(uploadLocator, fname);
            } else {
                this.log.error(`✗ שם קובץ עם ${maxLength + 1} תווים — התקבל (לא צפוי)`);
                bugs++;
                await this.deleteAttachedFile(uploadLocator, fname);
            }
        } catch (err) {
            this.log.info(`ℹ️ שם קובץ ארוך — לא ניתן ליצור/לצרף: ${err.message}`);
        } finally {
            try { fs.unlinkSync(longPath); } catch {}
        }

        // --- בדיקה 2: שם של בדיוק maxLength תווים — צריך להתקבל ---
        const exactName = 'א'.repeat(maxLength - ext.length - 1) + `.${ext}`;
        const exactPath = path.join(os.tmpdir(), exactName);
        try {
            fs.copyFileSync(sourcePath, exactPath);
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles(exactPath);
            await this.page.waitForTimeout(1500);

            const hasError = await this.isVisibleSafe(this.errorFileBug, 2000)
                || await this.isVisibleSafe(this.errorFile, 1000);

            if (!hasError) {
                this.log.info(`✅ שם קובץ עם ${maxLength} תווים — התקבל כצפוי`);
                await this.deleteAttachedFile(uploadLocator, fname);
            } else {
                this.log.error(`✗ שם קובץ עם ${maxLength} תווים — נחסם (לא צפוי)`);
                bugs++;
            }
        } catch (err) {
            this.log.error(`שגיאה בבדיקת אורך מקסימלי: ${err.message}`);
            bugs++;
        } finally {
            try { fs.unlinkSync(exactPath); } catch {}
        }

        // סיכום
        this.log.info(`========================================`);
        this.log.info(`סיכום בדיקת אורך שם קובץ — שדה: ${fname}`);
        if (bugs > 0) {
            this.log.error(`נמצאו ${bugs} באגים`);
        } else {
            this.log.info(`✅ הבדיקה הסתיימה ללא באגים`);
        }
        this.log.info(`========================================`);

        await this.closeFileDialog(fname);
        return bugs;
    }

    // פונקציה לבדיקת ולידציה של סוגי קבצים
    async TestFileTypeValidation(uploadLocator = "", fname = "קובץ") {
        this.log.info(`בדיקת צירוף קבצים בשדה: ${fname}`);

        let errorLocator;
        if (uploadLocator) {
            const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
            errorLocator = baseLocator.locator('//span[contains(text(), "לא נתמך")]');
        } else {
            errorLocator = this.errorFile;
        }

        let bugs = 0;

        const filesToTest = [
            { name: 'תמונה תקינה (png)', path: 'image.png', expected: 'ACCEPTED' },
            { name: 'תמונה תקינה (jpg)', path: 'image.jpg', expected: 'ACCEPTED' },
            { name: 'תמונה תקינה (jpeg)', path: 'image.jpeg', expected: 'ACCEPTED' },
            { name: 'תמונה תקינה (gif)', path: 'image.gif', expected: 'ACCEPTED' },
            { name: 'מסמך תקין (pdf)', path: 'Doc1.pdf', expected: 'ACCEPTED' },
            { name: 'קובץ וורד (DOCX)', path: 'report.docx', expected: 'REJECTED' },
            { name: 'קובץ טקסט (txt)', path: 'RP.txt', expected: 'REJECTED' },
            { name: 'קובץ לא חוקי (ZIP)', path: 'dir.zip', expected: 'REJECTED' },
        ];

        for (const file of filesToTest) {
            // צירוף הקובץ
            const uploadResult = await this.AtachFile(uploadLocator, file.path, fname);
            console.log("בודק קובץ" + file.name)

            // בדיקת תוצאה
            if (file.expected === 'ACCEPTED') {
                console.log("מצפים שהקובץ יתקבל, בודקים אם יש הודעת שגיאה... 149");
                // מצפים שהקובץ יתקבל
                const isErrorDisplayed = await this.isVisibleSafe(errorLocator, 1000);
                console.log("האם  152הודעת שגיאה מוצגת?", isErrorDisplayed);
                if (!isErrorDisplayed) {
                    // מוחקים את הקובץ לפני המעבר לבדיקה הבאה
                    await this.deleteAttachedFile(uploadLocator, fname);
                } else {
                    this.log.error(`✗ הולידציה נכשלה: הקובץ ${file.name} נפסל (לא צפוי)`);
                    bugs++;
                }

            } else if (file.expected === 'REJECTED') {
                // מצפים שהקובץ ייפסל
                const isErrorDisplayed = await this.isVisibleSafe(errorLocator, 3000);

                if (isErrorDisplayed) {
                    const errorMessage = await errorLocator.first().textContent();
                    //this.log.info(`✓ הולידציה עברה: הקובץ ${file.name} נפסל בהודעה: "${errorMessage}" (כצפוי)`);
                } else {
                    this.log.error(`✗ הולידציה נכשלה: הקובץ ${file.name} התקבל (לא צפוי)`);
                    bugs++;

                    // אם הקובץ התקבל בטעות - מוחקים אותו
                    await this.deleteAttachedFile(uploadLocator, fname);
                }
            }
        }
        console.log("סיימתי לבדוק את כל הקבצים, 174סוג הקובץ: " + fname)
        // סגירת הדיאלוג בסוף (רק לגוון וערכה)
        await this.closeFileDialog(fname);

        // סיכום
        if (bugs > 0) {
            this.log.error(`סיכום בדיקה: נמצאו ${bugs} באגים בצירוף קבצים`);
        } else {
            this.log.info("✓ הבדיקה של צירוף קבצים עברה בהצלחה");
        }

        return bugs;
    }
}

module.exports = FilesPage;