po.InitLogCapture()
web.transaction('התחברות למערכת')
po.loginPage.Login()
//po.loginPage.LoginDev()
web.transaction('עריכת תנאי יצור נאותים')
//po.properProduction.AddAddressesForProperProduction(5)
web.transaction('עדכון יבואן נאות')
//po.updateProperImporter.Update()
web.transaction('שינוי פעילות עסק')
//po.chageActivityBussines.ChangeActivity(["יבואן", "מפיץ"])
//po.chageActivityBussines.ChangeActivity(["יבואן", "מפיץ"])
web.transaction('עריכת פרטי עסק')
//po.editBussinesDetails.UpdateBusinessDetails()
web.transaction('הוספת עובד ממונה')
po.supervisedEmploee.AddSupervisedEmployee()




/*var oldfilepath = po.dataFolder + '\\dealer.txt'
var t = po.ReadFileUpdate(oldfilepath)
log.info(t)*/
/*web.init()
web.open(env.url)
web.type(po.loginPage.tZ,"322638727")
web.type(po.loginPage.sL,"2000")
web.click(po.loginPage.bb)
web.waitForVisible(po.loginPage.card)
web.pause(5000)*/

po.SaveLogsToFile();
