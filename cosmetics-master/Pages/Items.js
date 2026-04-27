const SharedUtils = require('./SharedUtils');

class ItemsPage {
    constructor(page, po, env, log) {
        this.page = page;
        this.po = po;
        this.env = env;
        this.log = log || console;
        this.sharedUtils = new SharedUtils(page, po, env, log);

        // Locators
        this.notificationCompleted = this.page.locator("//div[text()=' נוטיפקציות שהושלמו']//..//div[@class='cardTitle']");
        this.notificationInProcess = this.page.locator("//div[text()='נוטיפקציות בתהליך']//..//div[@class='cardTitle']");
        this.itemsApprovedAfterChange = this.page.locator("//div[text()='פריטים שאושרו על ידי נציג אחראי']//..//div[@class='cardTitle']");
        this.itemsWaitingForApproval = this.page.locator("//div[text()='פריטים שממתינים לאישור נציג אחראי']//..//div[@class='cardTitle']");
        this.itemsRejectedAfterChange = this.page.locator("//div[text()='פריטים שנדחו על ידי נציג אחראי']//..//div[@class='cardTitle']");
        this.tableRows = this.page.locator("//mat-row");
        this.statusColumn = this.page.locator("//mat-row//div[@class='status-container']");
        this.paginationNext = this.page.locator("//*[@class='grid_ar_prev md moh-icon page-button']");
    }

    async HasNextPage(nextButtonLocator) {
        try {
            const nextBtn = nextButtonLocator.first();
            const isDisabled = await nextBtn.getAttribute('disabled');
            const classes = await nextBtn.getAttribute('class') || '';
            return isDisabled === null && !classes.includes('disabled');
        } catch (err) {
            return false;
        }
    }

    async ValidateStatusSummary() {
        await this.page.waitForTimeout(2000);
        await this.sharedUtils.OpenPageMancal("עסק אוטומציה91");
        await this.page.waitForTimeout(3000);
        this.log.info('מתחיל בדיקת סכימות סטטוס...');

        const countByStatus = {
            notificationInProcess: 0,
            notificationCompleted: 0,
            approvedByGanatz: 0,
            rejectedByGanatz: 0,
            waitingForApproval: 0
        };

        const summaryCards = {
            notificationCompleted: 0,
            notificationInProcess: 0,
            itemsApprovedAfterChange: 0,
            itemsWaitingForApproval: 0,
            itemsRejectedAfterChange: 0,
            sideEffects: 0
        };
        
        let currentPage = 1;
        let totalRowsProcessed = 0;
        
        try {
            this.log.info('מתחיל לעבור על כל העמודים...');

            let hasNext = true;
            while (hasNext) {
                await this.page.waitForTimeout(2000);

                    const totalRows = await this.tableRows.count();
                this.log.info(`\n📄 עמוד ${currentPage}: נמצאו ${totalRows} שורות`);

                for (let i = 1; i <= totalRows; i++) {
                    try {
                        totalRowsProcessed++;
                        this.log.info(`\n========== עמוד ${currentPage}, שורה ${i} (סה"כ שורה ${totalRowsProcessed}) ==========`);

                            const fullRowText = await this.tableRows.nth(i - 1).textContent();

                        this.log.info(`📄 טקסט מלא של השורה ${i}:`);
                        this.log.info(fullRowText);

                        let statusFound = false;

                        if (fullRowText.includes('בתהליך')) {
                            countByStatus.notificationInProcess++;
                            countByStatus.approvedByGanatz++;
                            this.log.info('➕ נוטיפיקציה בתהליך');
                            statusFound = true;
                        }

                        if (fullRowText.includes('הושלמה')) {
                            countByStatus.notificationCompleted++;
                            countByStatus.approvedByGanatz++;
                            this.log.info('➕ נוטיפיקציה הושלמה');
                            statusFound = true;
                        }

                        if (fullRowText.includes('התקבל') && fullRowText.includes('נציג')) {
                            countByStatus.approvedByGanatz++;
                            this.log.info('➕ התקבל מנציג אחראי');
                            statusFound = true;
                        }

                        if (fullRowText.includes('נדחה') && fullRowText.includes('נציג')) {
                            countByStatus.rejectedByGanatz++;
                            this.log.info('➕ נדחה מנציג אחראי');
                            statusFound = true;
                        }

                        if (fullRowText.includes('ביטול') && fullRowText.includes('נציג')) {
                            countByStatus.approvedByGanatz++;
                            this.log.info('➕ ביטול מנציג אחראי');
                            statusFound = true;
                        }

                        if (fullRowText.includes('לאישור') && fullRowText.includes('נציג')) {
                            countByStatus.waitingForApproval++;
                            this.log.info('➕ לאישור מנציג אחראי');
                            statusFound = true;
                        }

                        if (!statusFound) {
                            this.log.info('⚠️ לא נמצא סטטוס מזוהה בשורה זו');
                        }

                    } catch (err) {
                        this.log.error(`❌ שגיאה בקריאת שורה ${i}:`, err.message);
                    }
                }

                    hasNext = await this.HasNextPage(this.paginationNext);
                if (hasNext) {
                    this.log.info(`\n➡️ עובר לעמוד ${currentPage + 1}...`);
                        await this.paginationNext.click();
                    currentPage++;
                } else {
                    this.log.info(`\n✅ הגענו לעמוד האחרון (עמוד ${currentPage})`);
                }
            }

            this.log.info(`\n📊 סה"כ עובדו ${totalRowsProcessed} שורות מ-${currentPage} עמודים`);
            this.log.info('\n============================================');
            this.log.info('--- תוצאות ספירה מהטבלה ---');
            this.log.info(JSON.stringify(countByStatus, null, 2));

            try {
                const text = await this.notificationCompleted.textContent();
                summaryCards.notificationCompleted = parseInt(text) || 0;
            } catch (e) {
                this.log.info('⚠️ לא נמצאה כרטיסיית נוטיפיקציות שהושלמו');
            }

            try {
                const text = await this.notificationInProcess.textContent();
                summaryCards.notificationInProcess = parseInt(text) || 0;
            } catch (e) {
                this.log.info('⚠️ לא נמצאה כרטיסיית נוטיפיקציות בתהליך');
            }

            try {
                const text = await this.itemsApprovedAfterChange.textContent();
                summaryCards.itemsApprovedAfterChange = parseInt(text) || 0;
            } catch (e) {
                this.log.info('⚠️ לא נמצאה כרטיסיית פריטים שאושרו');
            }

            try {
                const text = await this.itemsWaitingForApproval.textContent();
                summaryCards.itemsWaitingForApproval = parseInt(text) || 0;
            } catch (e) {
                this.log.info('⚠️ לא נמצאה כרטיסיית פריטים ממתינים');
            }

            try {
                const text = await this.itemsRejectedAfterChange.textContent();
                summaryCards.itemsRejectedAfterChange = parseInt(text) || 0;
            } catch (e) {
                this.log.info('⚠️ לא נמצאה כרטיסיית פריטים שנדחו');
            }

            this.log.info('\n--- תוצאות מהכרטיסיות למעלה ---');
            this.log.info(JSON.stringify(summaryCards, null, 2));

            let errors = [];

            if (summaryCards.notificationCompleted > 0 || countByStatus.notificationCompleted > 0) {
                if (countByStatus.notificationCompleted !== summaryCards.notificationCompleted) {
                    errors.push(`❌ נוטיפיקציות שהושלמו: בכרטיסייה ${summaryCards.notificationCompleted}, בטבלה ${countByStatus.notificationCompleted}`);
                } else {
                    this.log.info(`✅ נוטיפיקציות שהושלמו: ${summaryCards.notificationCompleted} - תקין`);
                }
            }

            if (summaryCards.notificationInProcess > 0 || countByStatus.notificationInProcess > 0) {
                if (countByStatus.notificationInProcess !== summaryCards.notificationInProcess) {
                    errors.push(`❌ נוטיפיקציות בתהליך: בכרטיסייה ${summaryCards.notificationInProcess}, בטבלה ${countByStatus.notificationInProcess}`);
                } else {
                    this.log.info(`✅ נוטיפיקציות בתהליך: ${summaryCards.notificationInProcess} - תקין`);
                }
            }

            if (summaryCards.itemsApprovedAfterChange > 0 || countByStatus.approvedByGanatz > 0) {
                if (countByStatus.approvedByGanatz !== summaryCards.itemsApprovedAfterChange) {
                    errors.push(`❌ פריטים שאושרו: בכרטיסייה ${summaryCards.itemsApprovedAfterChange}, בטבלה ${countByStatus.approvedByGanatz}`);
                } else {
                    this.log.info(`✅ פריטים שאושרו: ${summaryCards.itemsApprovedAfterChange} - תקין`);
                }
            }

            if (summaryCards.itemsWaitingForApproval > 0 || countByStatus.waitingForApproval > 0) {
                if (countByStatus.waitingForApproval !== summaryCards.itemsWaitingForApproval) {
                    errors.push(`❌ פריטים ממתינים לאישור: בכרטיסייה ${summaryCards.itemsWaitingForApproval}, בטבלה ${countByStatus.waitingForApproval}`);
                } else {
                    this.log.info(`✅ פריטים ממתינים לאישור: ${summaryCards.itemsWaitingForApproval} - תקין`);
                }
            }

            if (summaryCards.itemsRejectedAfterChange > 0 || countByStatus.rejectedByGanatz > 0) {
                if (countByStatus.rejectedByGanatz !== summaryCards.itemsRejectedAfterChange) {
                    errors.push(`❌ פריטים שנדחו: בכרטיסייה ${summaryCards.itemsRejectedAfterChange}, בטבלה ${countByStatus.rejectedByGanatz}`);
                } else {
                    this.log.info(`✅ פריטים שנדחו: ${summaryCards.itemsRejectedAfterChange} - תקין`);
                }
            }

            this.log.info('\n========== סיכום בדיקת סכימות ==========');
            if (errors.length > 0) {
                this.log.info('❌ נמצאו אי-התאמות:');
                errors.forEach(err => this.log.info(err));
                throw new Error(`נמצאו ${errors.length} אי-התאמות בסכימות הסטטוס`);
            } else {
                this.log.info('✅ כל הסכימות תקינות!');
            }

            return true;
        } catch (err) {
            this.log.error('שגיאה בבדיקת סכימות הסטטוס:', err);
            throw err;
        }
    }
}
module.exports = ItemsPage;