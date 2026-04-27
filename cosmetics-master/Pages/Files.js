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
        if (name === "גוון" || name === "ערכה") {
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
                // מצפים שהקובץ יתקבל
                const isErrorDisplayed = await this.isVisibleSafe(errorLocator, 1000);

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