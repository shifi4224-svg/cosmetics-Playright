
po.InitLogCapture()
web.transaction('התחברות למערכת')
po.loginPage.Login()
//po.loginPage.LoginDev()

web.transaction("רישום תאגיד נציג אחראי")
po.regulationTaagidRP.LoginToDeaker(false)
web.transaction('רישום נציג אחראי')
po.regulationRP.RegulationToCorpuration()
po.regulationRP.RegulationToRP()



po.SaveLogsToFile();