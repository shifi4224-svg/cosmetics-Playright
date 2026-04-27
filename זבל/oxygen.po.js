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
}