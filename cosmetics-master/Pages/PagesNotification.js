const { error } = require("./Dealer")

module.exports = {

    markerMunufactor: '//*[text()="  פרטי יצרן *"]',
    errorManufactor:'//*[text()="  פרטי יצרן *"]//..//span[text()="שדה חובה"]',

    //page2:
    markerKategory1: '//mat-label[text()=" קטגוריית תמרוק 1 "]//span[@class="requiredMarker ng-star-inserted"]',
    markerKategory2: '//mat-label[text()=" קטגוריית תמרוק 2 "]//span[@class="requiredMarker ng-star-inserted"]',
    markerKategory3: '//mat-label[text()=" קטגוריית תמרוק 3 "]//span[@class="requiredMarker ng-star-inserted"]',
    errorKategory1: '//mat-label[text()=" קטגוריית תמרוק 1 "]//..//..//..//..//..//..//..//..//*[text()="שדה חובה"]',
    errorKategory2: '//mat-label[text()=" קטגוריית תמרוק 2 "]//..//..//..//..//..//..//..//..//*[text()="שדה חובה"]',
    errorKategory3: '//mat-label[text()=" קטגוריית תמרוק 3 "]//..//..//..//..//..//..//..//..//*[text()="שדה חובה"]',


    Page1: () => {
        var GetPage1RequiredFields = [
            {
                name: 'פרטי יצרן',
                inputLocator: po.pagesNotification.markerMunufactor,
                asteriskLocator: po.pagesNotification.markermunufactor,
                errorLocator: po.pagesNotification.errorManufactor
            },
        ]
        po.TestRequiredFieldsBySpec(GetPage1RequiredFields, 1)
    },

    Page2: () => {
        var GetPage1RequiredFields = [
            {
                name: 'קטגוריית תמרוק 1',
                inputLocator: po.reglationNotification.kategory1,
                asteriskLocator: po.pagesNotification.markerKategory1,
                errorLocator: po.pagesNotification.errorKategory1
            },
            {
                name: 'קטגוריית תמרוק 2',
                inputLocator: po.reglationNotification.kategory2,
                asteriskLocator: po.pagesNotification.markerKategory2,
                errorLocator: po.pagesNotification.errorKategory2
            },
            {
                name: 'קטגוריית תמרוק 3',
                inputLocator: po.reglationNotification.kategory3,
                asteriskLocator: po.pagesNotification.markerKategory3,
                errorLocator: po.pagesNotification.errorKategory3
            },
        ]
        po.TestRequiredFieldsBySpec(GetPage1RequiredFields, 2)
    },
}