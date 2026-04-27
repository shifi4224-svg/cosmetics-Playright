po.InitLogCapture()
web.transaction('התחברות למערכת')
//po.loginPage.Login()
po.loginPage.LoginDev()

web.transaction('פתיחת פריט רגיל ע"י מנכל')
//po.regulationItem.AddItem("פריט טסט","TTT",0)
web.pause(3000)
web.transaction('הקמת נוטיפיקציה ע"י נציג אחראי רגיל')
po.regulationNotification.CreateNotificationFull()
web.transaction('פתיחת פריט נאות ע"י מנכל')
po.regulationItem.AddItem("פריט טסט","TTT",1)
web.transaction('הקמת נוטיפיקציה ע"י נציג אחראי נאות')
po.properNotification.CreateProperNotification()

po.SaveLogsToFile();
