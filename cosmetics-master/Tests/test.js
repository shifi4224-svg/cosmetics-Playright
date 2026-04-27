po.InitLogCapture()
web.transaction('התחברות למערכת')
//po.loginPage.Login()
po.loginPage.LoginDev()


po.regulationNotification.EditNotificationX(20,false,"פריט שני")

/*web.transaction("פתיחת הרבה פריטים רגיל")
po.regulationItem.AddMultipleItems("פריט טסט","TTT",20,0)
web.transaction("פתיחת הרבה פריטים נאות")
po.regulationItem.AddMultipleItems("פריט טסט","TTT",20,1)
web.transaction("בדיקת לוגיקת יצרן ברישום עוסק בתמרוק")
po.regulationDealer.ManufacturerDealer()*/



po.SaveLogsToFile();

