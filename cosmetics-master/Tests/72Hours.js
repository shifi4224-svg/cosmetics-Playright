po.InitLogCapture()
web.transaction("בדיקת פתוח לעריכה פריט רגיל לאחר 72 שעות")
po.after72HBasic.ValidateFieldEditability("uncheck")//check,uncheck

web.init()
web.open('https://cnpdev.health.gov.il/')
web.type(po.loginPage.tZ, "322638727")
web.type(po.loginPage.sL, "2000")
web.click(po.loginPage.bb)
web.waitForVisible(po.loginPage.card)
web.pause(5000)
web.waitForVisible(po.loginPage.card)
web.pause(5000)
let flug = null
//flug = po.regulationItem.OpenItem1("עסק אוטומציה91","עסק אוטומציה91","", "פריט רגיל", "נוטיפקציה הושלמה")
//if (flug) {
 //   po.after72HBasic.ClickOnForm()
//}

web.transaction("בדיקת סיבת שינוי פריט נאות לאחר 72 שעות")
web.refresh()
flug = po.regulationItem.OpenItem1("שפרה הקר נציג 7","תאגיד","", "פריט נאות", "נוטיפקציה הושלמה")
if (flug) {
    po.after72HBasic.Reasons()
}




po.SaveLogsToFile();
