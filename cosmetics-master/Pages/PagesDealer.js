module.exports = {

    Page1: (locator) => {
        var GetPage1RequiredFields = [
            {
                name: 'שם עסק/תאגיד',
                inputLocator: locator,
                asteriskLocator: po.regulationDealer.markerBusinessName,
                errorLocator: po.regulationDealer.errorBusinessName
            },
            {
                name: 'ישות משפטית',
                inputLocator: po.regulationDealer.legalEntity,
                asteriskLocator: po.regulationDealer.markerLegalEntity,
                errorLocator: po.regulationDealer.errorLegalEntity
            },
            {
                name: 'מספר מזהה',
                inputLocator: po.regulationDealer.businessId,
                asteriskLocator: po.regulationDealer.markerBusinessId,
                errorLocator: po.regulationDealer.errorBusinesId
            }]
        po.TestRequiredFieldsBySpec(GetPage1RequiredFields, 1)

    },
    Page2: () => {
        var GetPage1RequiredFields = [
            {
                name: 'מה תפקידך',
                inputLocator: po.regulationDealer.manufactorCheckbox,
                asteriskLocator: po.regulationDealer.markerDealer,
                errorLocator: po.regulationDealer.errorDealer
            },
            {
                name: 'טלפון ראשי',
                inputLocator: po.regulationDealer.telefon,
                asteriskLocator: po.regulationDealer.markerTel,
                errorLocator: po.regulationDealer.errorTel
            },
            {
                name: 'דואר אלקטרוני',
                inputLocator: po.regulationDealer.doal,
                asteriskLocator: po.regulationDealer.markerDoal,
                errorLocator: po.regulationDealer.errorEmail
            },
            {
                name: 'עיר',
                inputLocator: po.regulationDealer.city,
                asteriskLocator: po.regulationDealer.markerCity,
                errorLocator: po.regulationDealer.errorCity
            },
            {
                name: 'סוג כתובת',
                inputLocator: po.regulationDealer.addressType,
                asteriskLocator: po.regulationDealer.markerType,
                errorLocator: po.regulationDealer.errorType
            },
            {
                name: 'הצהרה 1',
                inputLocator: po.regulationDealer.oK1,
                asteriskLocator: po.regulationDealer.markerOK1,
                errorLocator: po.regulationDealer.errorOK1
            },
            {
                name: 'הצהרה 2',
                inputLocator: po.regulationDealer.oK2,
                asteriskLocator: po.regulationDealer.markerOK2,
                errorLocator: po.regulationDealer.errorOK2
            }]
        po.TestRequiredFieldsBySpec(GetPage1RequiredFields, 2)
    },
    Page3: () => {
        var GetPage1RequiredFields = [{
            name: 'הצהרה על רישיון עסק',
            inputLocator: po.regulationDealer.businessLicense,
            asteriskLocator: po.regulationDealer.markerBusinessLicense,
            errorLocator: po.regulationDealer.errorBusinessLicense
        },
        {
            name: 'הצהרה על תנאי יצור נאותים',
            inputLocator: po.regulationDealer.addressOK,
            asteriskLocator: po.regulationDealer.markerAddress,
            errorLocator: po.regulationDealer.errorAddress
        },
        {
            name: 'אמיתות הנתונים 1',
            inputLocator: po.regulationDealer.accuracyOfData1,
            asteriskLocator: po.regulationDealer.markerStatement1,
            errorLocator: po.regulationDealer.errorStatement1
        },
        {
            name: 'אמיתות הנתונים 2',
            inputLocator: po.regulationDealer.accuracyOfData2,
            asteriskLocator: po.regulationDealer.markerStatement2,
            errorLocator: po.regulationDealer.errorStatement2
        }]
        po.TestRequiredFieldsBySpec(GetPage1RequiredFields, 3)
    },
}