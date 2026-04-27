po.InitLogCapture()
web.transaction('התחברות למערכת')
po.loginPage.Login()
//po.loginPage.LoginDev()

web.transaction('רישום עוסק בתמרוק')
po.regulationDealer.RegulationDealerBusiness(false,0)
po.regulationDealer.RegulationDealerBusiness(false,1)

web.transaction('רישום נציג אחראי')
po.regulationRP.RegulationToBusiness()

po.SaveLogsToFile();