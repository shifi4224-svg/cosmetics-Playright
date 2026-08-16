const path = require('path');

class FilesPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;

        // לוקטורים שקשורים לקבצים - מוגדרים כאן כדי למנוע תלות מעגלית במחלקות אחרות
        this.errorFileBug = this.page.locator('//span[contains(text(),"העלאת קובץ נכשלה")]');
        this.delFile = this.page.locator('//i[@class="moh-icon delete"] | //button[normalize-space()="הסרה"]');
        this.errorFile = this.page.locator('//span[contains(text(), "לא נתמך")]');
        this.errorFileSize = this.page.locator('//span[contains(text(), "עברת את הגודל המירבי המותר 10 MB")]');
        this.errorFileName = this.page.locator('//span[contains(text(), "לא ניתן להעלות קובץ בשם זה")]');
        this.errorFileCount = this.page.locator('//span[contains(text(), "הינך מורשה לעלות עד 1 קבצים")]');
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
                // המתן שהשגיאה תיעלם אחרי המחיקה
                await this.errorFileBug.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
                await this.page.waitForTimeout(500);
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
                    || await this.isVisibleSafe(this.errorFile, 1000)
                    || await this.isVisibleSafe(this.errorFileName, 1000);

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
        const longName = 'a'.repeat(maxLength + 1 - ext.length - 1) + `.${ext}`;
        const longPath = path.join(os.tmpdir(), longName);
        try {
            fs.copyFileSync(sourcePath, longPath);
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles(longPath);
            await this.page.waitForTimeout(1500);

            const hasError = await this.isVisibleSafe(this.errorFileBug, 2000)
                || await this.isVisibleSafe(this.errorFile, 1000)
                || await this.isVisibleSafe(this.errorFileName, 1000);

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
        const exactName = 'a'.repeat(maxLength - ext.length - 1) + `.${ext}`;
        const exactPath = path.join(os.tmpdir(), exactName);
        try {
            fs.copyFileSync(sourcePath, exactPath);
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles(exactPath);
            await this.page.waitForTimeout(1500);

            const hasError = await this.isVisibleSafe(this.errorFileBug, 2000)
                || await this.isVisibleSafe(this.errorFile, 1000)
                || await this.isVisibleSafe(this.errorFileName, 1000);

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

    // פונקציה לבדיקת גודל קובץ מקסימלי (10MB)
    async TestFileSizeValidation(uploadLocator = "", fname = "קובץ") {
        this.log.info(`בדיקת גודל קובץ מקסימלי בשדה: ${fname}`);

        let upload;
        if (uploadLocator) {
            const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
            upload = baseLocator.locator('//*[@type="file"]');
        } else {
            upload = this.page.locator('//*[@type="file"]');
        }

        let bugs = 0;
        const tempDir = this.po?.dataFolder || require('path').join(__dirname, '../Data');

        // --- בדיקה 1: קובץ 11MB — צריך להידחות ---
        const largePath = require('path').join(tempDir, 'file11mb.pdf');
        await this.openFileDialog(fname);
        await this.page.waitForTimeout(500);
        await upload.setInputFiles(largePath);
        await this.page.waitForTimeout(1500);

        const largeRejected = await this.isVisibleSafe(this.errorFileSize, 3000);
        if (largeRejected) {
            this.log.info(`✅ קובץ 11MB נדחה עם הודעת שגיאה כצפוי`);
            await this.deleteAttachedFile(uploadLocator, fname);
        } else {
            this.log.error(`✗ קובץ 11MB התקבל — לא צפוי`);
            bugs++;
            await this.deleteAttachedFile(uploadLocator, fname);
        }

        // --- בדיקה 2: קובץ 9.5MB — צריך להתקבל ---
        const smallPath = require('path').join(tempDir, 'file9mb.pdf');
        await this.openFileDialog(fname);
        await this.page.waitForTimeout(500);
        await upload.setInputFiles(smallPath);
        await this.page.waitForTimeout(1500);

        const smallAccepted = await this.isVisibleSafe(this.errorFileSize, 2000);
        if (!smallAccepted) {
            this.log.info(`✅ קובץ 9.5MB התקבל כצפוי`);
            await this.deleteAttachedFile(uploadLocator, fname);
        } else {
            this.log.error(`✗ קובץ 9.5MB נדחה — לא צפוי`);
            bugs++;
        }

        this.log.info(`========================================`);
        this.log.info(`סיכום בדיקת גודל קובץ — שדה: ${fname}`);
        if (bugs > 0) {
            this.log.error(`נמצאו ${bugs} באגים`);
        } else {
            this.log.info(`✅ הבדיקה הסתיימה ללא באגים`);
        }
        this.log.info(`========================================`);

        await this.closeFileDialog(fname);
        return bugs;
    }

    // פונקציה לבדיקת צירוף 2 קבצים — צריכה להופיע הודעת שגיאה
    async TestFileCountValidation(uploadLocator = "", fname = "קובץ") {
        this.log.info(`בדיקת מגבלת כמות קבצים בשדה: ${fname}`);

        let upload;
        if (uploadLocator) {
            const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
            upload = baseLocator.locator('//*[@type="file"]');
        } else {
            upload = this.page.locator('//*[@type="file"]');
        }

        let bugs = 0;
        const tempDir = this.po?.dataFolder || require('path').join(__dirname, '../Data');

        // צרף קובץ ראשון
        const file1 = require('path').join(tempDir, 'Doc1.pdf');
        await this.openFileDialog(fname);
        await this.page.waitForTimeout(500);
        await upload.setInputFiles(file1);
        await this.page.waitForTimeout(1000);

        const firstError = await this.isVisibleSafe(this.errorFileBug, 1000);
        if (firstError) {
            this.log.error(`✗ קובץ ראשון לא צורף`);
            return 1;
        }
        this.log.info(`✅ קובץ ראשון צורף`);

        // ניסיון לצרף קובץ שני — צריך להופיע שגיאה
        await this.openFileDialog(fname);
        await this.page.waitForTimeout(500);
        await upload.setInputFiles(file1);
        await this.page.waitForTimeout(1500);

        const countError = await this.isVisibleSafe(this.errorFileCount, 3000);
        if (countError) {
            this.log.info(`✅ קובץ שני נדחה עם הודעת שגיאה כצפוי`);
            await this.deleteAttachedFile(uploadLocator, fname);
        } else {
            this.log.error(`✗ קובץ שני התקבל — לא צפוי`);
            bugs++;
            await this.deleteAttachedFile(uploadLocator, fname);
        }

        this.log.info(`========================================`);
        if (bugs > 0) {
            this.log.error(`נמצאו ${bugs} באגים בבדיקת כמות קבצים`);
        } else {
            this.log.info(`✅ בדיקת כמות קבצים עברה`);
        }
        this.log.info(`========================================`);

        await this.closeFileDialog(fname);
        return bugs;
    }

    async TestMultipleFilesAtOnce(uploadLocator = "", fname = "קובץ", count = 3, baseFileName = "Doc1.pdf") {
        this.log.info(`בדיקת צירוף ${count} קבצים בבת אחת בשדה: ${fname}`);
        const fs = require('fs');
        const os = require('os');
        const tempDir = this.po?.dataFolder || path.join(__dirname, '../Data');
        const ext = baseFileName.split('.').pop();
        const sourcePath = path.join(tempDir, baseFileName);
        const filePaths = [];
        for (let i = 0; i < count; i++) {
            const p = path.join(os.tmpdir(), `multi_test_${i}.${ext}`);
            fs.copyFileSync(sourcePath, p);
            filePaths.push(p);
        }
        let upload;
        if (uploadLocator) {
            const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
            upload = baseLocator.locator('//*[@type="file"]');
        } else {
            upload = this.page.locator('//*[@type="file"]');
        }
        let bugs = 0;
        try {
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles(filePaths);
            await this.page.waitForTimeout(1500);
            const hasError = await this.isVisibleSafe(this.errorFileBug, 2000)
                || await this.isVisibleSafe(this.page.locator('//span[contains(text(), "הינך מורשה לעלות עד")]'), 1000);
            if (!hasError) {
                this.log.info(`✅ ${count} קבצים צורפו בבת אחת בהצלחה`);
                await this.deleteAttachedFile(uploadLocator, fname);
            } else {
                this.log.error(`✗ צירוף ${count} קבצים בבת אחת נכשל`);
                bugs++;
            }
        } finally {
            for (const p of filePaths) { try { fs.unlinkSync(p); } catch {} }
        }
        await this.closeFileDialog(fname);
        return bugs;
    }

    async TestCombinedSizePass(uploadLocator = "", fname = "קובץ") {
        this.log.info(`בדיקת צירוף קבצים שסה"כ גודלם מעל 10MB - צריך לעבור בשדה: ${fname}`);
        const fs = require('fs');
        const os = require('os');
        const tempDir = this.po?.dataFolder || path.join(__dirname, '../Data');
        const file9mb = path.join(tempDir, 'file9mb.pdf');
        const copy9mb = path.join(os.tmpdir(), 'file9mb_copy2.pdf');
        fs.copyFileSync(file9mb, copy9mb);
        let upload;
        if (uploadLocator) {
            const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
            upload = baseLocator.locator('//*[@type="file"]');
        } else {
            upload = this.page.locator('//*[@type="file"]');
        }
        let bugs = 0;
        try {
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles([file9mb, copy9mb]);
            await this.page.waitForTimeout(2000);
            const hasSizeError = await this.isVisibleSafe(this.errorFileSize, 3000);
            if (!hasSizeError) {
                this.log.info(`✅ 2 קבצים (סה"כ ~18MB, כל אחד 9MB<10MB) התקבלו - המגבלה לפי קובץ ולא סה"כ`);
                await this.deleteAttachedFile(uploadLocator, fname);
            } else {
                this.log.error(`✗ 2 קבצים (סה"כ ~18MB) נדחו - ייתכן שיש מגבלת גודל כוללת`);
                bugs++;
            }
        } finally {
            try { fs.unlinkSync(copy9mb); } catch {}
        }
        await this.closeFileDialog(fname);
        return bugs;
    }

    async TestMaxFilesCount(uploadLocator = "", fname = "קובץ", maxCount = 6, baseFileName = "Doc1.pdf") {
        this.log.info(`בדיקת מגבלת כמות קבצים (מקסימום ${maxCount}) בשדה: ${fname}`);
        const fs = require('fs');
        const os = require('os');
        const tempDir = this.po?.dataFolder || path.join(__dirname, '../Data');
        const ext = baseFileName.split('.').pop();
        const sourcePath = path.join(tempDir, baseFileName);
        let bugs = 0;
        const countErrorLocator = this.page.locator('//span[contains(text(), "הינך מורשה לעלות עד")]');
        let upload;
        if (uploadLocator) {
            const baseLocator = typeof uploadLocator === 'string' ? this.page.locator(uploadLocator) : uploadLocator;
            upload = baseLocator.locator('//*[@type="file"]');
        } else {
            upload = this.page.locator('//*[@type="file"]');
        }
        // בדיקה 1: בדיוק maxCount קבצים — צריכים להתקבל
        const files1 = [];
        for (let i = 0; i < maxCount; i++) {
            const p = path.join(os.tmpdir(), `maxcount_${i}.${ext}`);
            fs.copyFileSync(sourcePath, p);
            files1.push(p);
        }
        try {
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles(files1);
            await this.page.waitForTimeout(1500);
            const hasError = await this.isVisibleSafe(countErrorLocator, 2000);
            if (!hasError) {
                this.log.info(`✅ ${maxCount} קבצים התקבלו כצפוי`);
                await this.deleteAttachedFile(uploadLocator, fname);
            } else {
                this.log.error(`✗ ${maxCount} קבצים נדחו (לא צפוי)`);
                bugs++;
            }
        } finally {
            for (const p of files1) { try { fs.unlinkSync(p); } catch {} }
        }
        // בדיקה 2: maxCount+1 קבצים — צריכים להידחות
        const files2 = [];
        for (let i = 0; i < maxCount + 1; i++) {
            const p = path.join(os.tmpdir(), `maxcount2_${i}.${ext}`);
            fs.copyFileSync(sourcePath, p);
            files2.push(p);
        }
        try {
            await this.openFileDialog(fname);
            await this.page.waitForTimeout(500);
            await upload.setInputFiles(files2);
            await this.page.waitForTimeout(1500);
            const hasError = await this.isVisibleSafe(countErrorLocator, 3000);
            if (hasError) {
                this.log.info(`✅ ${maxCount + 1} קבצים נדחו כצפוי`);
                await this.deleteAttachedFile(uploadLocator, fname);
            } else {
                this.log.error(`✗ ${maxCount + 1} קבצים התקבלו (לא צפוי)`);
                bugs++;
                await this.deleteAttachedFile(uploadLocator, fname);
            }
        } finally {
            for (const p of files2) { try { fs.unlinkSync(p); } catch {} }
        }
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