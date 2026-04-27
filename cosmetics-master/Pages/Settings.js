module.exports = {

settingsButton:'//button[@title="הגדרות"]',
maarechet:'//span[contains(text(), "מערכת")]',
permiss:'//span[contains(text(), "הרשאות")]',
logs:'//span[contains(text(), "לוגים")]',
sadot:'//span[contains(text(), "שדות לעריכה")]',
parameters:'//span[contains(text(), "מערכתיים")]',
mimshak:'//span[contains(text(), "ממשקים")]',
country:'//span[contains(text(), "מדינות")]',
importP:'//span[contains(text(), "מקביל")]',
rakefetMegik:'//span[contains(text(), "הקבלת")]',
users:'//*[contains(text(), "משתמשים")]',
teams:'//*[contains(text(), "צוותים")]',
profile:'//*[contains(text(), "פרופילים")]',
changeLog:'//*[contains(text(), "שינויים")]',
mimshakLog:'//*[contains(text(), "ממשקים")]',
yeshutSearch:'//input[@placeholder="מקושר לישות"]',
rashi:'//*[contains(text(), "ראשי")]',
addTeam:'//*[contains(text(), "הוספת")]',
taemName:'//input[@aria-label="שם צוות"]',
pail:'//*[@aria-label="פעיל"]',
saveTeam:'//*[contains(text(), "שמירה")]',
oK:'//*[contains(text(), "OK")]',
chekBox:'(//tbody//tr)[1]//input[@type="checkbox"]',
changeLogSearchId:'//input[@id="search_id"]',
changeLogSearchEntity:'//input[@id="search_entity"]',
changeLogSearchPropertyName:'//input[@id="search_propertyName"]',
changeLogSearchEntityId:'//input[@id="search_entityId"]',
changeLogSearchOldValue:'//input[@id="search_oldValue"]',
changeLogSearchNewValue:'//input[@id="search_newValue"]',
changeLogSearchModifiedBy:'//input[@id="search_modifiedBy"]',
changeLogSearchModifedDate:'//input[@id="search_modifedDate"]',
mimshakLogSearchInterfaceName:'//input[@id="search_interfaceName"]',
mimshakLogSearchCreatedOn:'//input[@id="search_createdOn"]',
mimshakLogSearchCreatedBy:'//input[@id="search_createdBy"]',
mimshakLogSearchResult:'//input[@id="search_result"]',
mimshakLogSearchReasonFailure:'//input[@id="search_reasonFailure"]',
usersSearchUserName:'//input[@id="search_userName"]',
usersSearchFullName:'//input[@id="search_fullName"]',
usersSearchPhoneNum:'//input[@id="search_phoneNum"]',
usersSearchEmailAddress:'//input[@id="search_emailAddress"]',
teamsSearchTeamName:'//input[@id="search_teamName"]',
teamsSearchValue:'//input[@id="search_state_value"]',
profileSearchValue:'//input[@id="search_value"]',
profileSearchStateValue:'//input[@id="search_state_value"]',
sadotSearchEntityName:'//input[@id="search_entityName"]',
sadotSearchPropertyDescription:'//input[@id="search_propertyDescription"]',
parametersSearchKey:'//input[@id="search_key"]',
parametersSearchValue:'//input[@id="search_value"]',
parametersSearchParameterName:'//input[@id="search_parameterName"]',
parametersSearchValue2:'//input[@id="search_value2"]',
mimshakSearchInterfaceName:'//input[@id="search_interfaceName"]',
mimshakSearchDescription:'//input[@id="search_description"]',
mimshakSearchInterfaceTypeId:'//input[@id="search_interfaceTypeId"]',
countrySearchCode:'//input[@id="search_code"]',
countrySearchCountry:'//input[@id="search_country"]',
importPSearchFieldName:'//input[@id="search_fieldName"]',
importPSearchFieldDesc:'//input[@id="search_fieldDesc"]',
rakefetMegikSearchId:'//input[@id="search_id"]',
rakefetMegikSearchRakefetTableName:'//input[@id="search_rakefet_TableName"]',
rakefetMegikSearchRakefetVal:'//input[@id="search_rakefet_Val"]',
rakefetMegikSearchMagicVal:'//input[@id="search_magic_Val"]',
table:'//table',








    AddV: (action) => {
        web.waitForVisible(po.settings.settingsButton)
        web.waitForInteractable(po.settings.settingsButton)
        web.click(po.settings.settingsButton)
        web.waitForInteractable(po.settings.maarechet)
        web.click(po.settings.maarechet)
        web.click(po.settings.sadot)
        web.type(po.settings.yeshutSearch, "notification")

        let rowCheckbox = ''
        let rowsElement = '//tbody//tr'
        let rows = web.getElementCount(rowsElement)

        if (action == 'uncheck') {
            rowCheckbox = `//input[@type="checkbox" and contains(@class, "selected")]//..//div[@class="mdc-checkbox__background"]`
        } else if (action == 'check') {
            rowCheckbox = `//input[@type="checkbox" and not(contains(@class, "selected"))]//..//div[@class="mdc-checkbox__background"]`
        }

        for (let x = 1; x <= rows; x++) {
            web.pause(1000)
            web.click(`(${rowsElement})[${x}]`)
            
            let firstRowCheckbox = `((${rowsElement})[${x}]${rowCheckbox})[1]`
            let secondRowCheckbox = `((${rowsElement})[${x}]${rowCheckbox})[2]`

            log.info('firstRowCheckbox -> ' + firstRowCheckbox)
            log.info('firstRowCheckbox visible -> ' + web.isVisible(firstRowCheckbox, 3000))

            po.utils.pressTAB()
            if (web.isVisible(firstRowCheckbox, 3000)) {
                po.utils.pressSPACE()
                log.info('pressed firstRowCheckbox -> ' + firstRowCheckbox)
            }

            log.info('secondRowCheckbox -> ' + secondRowCheckbox)
            log.info('secondRowCheckbox visible -> ' + web.isVisible(secondRowCheckbox, 3000))

            po.utils.pressTAB()
            if (web.isVisible(secondRowCheckbox, 3000)) {
                po.utils.pressSPACE()
                log.info('pressed secondRowCheckbox -> ' + secondRowCheckbox)
            }

            // log.info('*'.repeat(100))
            // document.evaluate('((//tbody//tr)[2]//input[@type="checkbox" and contains(@class, "selected")]//..//div[@class="mdc-checkbox__background"])[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
        }


    },
    SaveTeam:()=>{
        web.waitForInteractable(po.settings.settingsButton)
        web.click(po.settings.settingsButton)
        web.waitForInteractable(po.settings.permiss)
        web.click(po.settings.permiss)
        web.waitForInteractable(po.settings.teams)
        web.click(po.settings.teams)
        web.waitForInteractable(po.settings.addTeam)
        web.click(po.settings.addTeam)
        web.type(po.settings.taemName,"טסט אוטומציה")
        web.click(po.settings.pail)
        web.click(po.settings.saveTeam)
        web.click(po.settings.oK)
    },
    Search:(parameter, str, par2, par1)=>{
         web.click(po.settings.settingsButton)
         web.click(par1)
         web.click(par2)
         web.waitForInteractable(parameter)
        web.type(parameter, str)
        let rowsElement = '//tbody//tr'
        let rows = web.getElementCount(rowsElement)
        log.info(rows)
        for (let x = 1; x <= rows; x++) {
            web.waitForInteractable(parameter)
            web.pause(1000)
            let v = `((${rowsElement})[${x}]//td[2])`
            log.info(web.getText(v))
            let value = web.getText(v)
            web.waitForInteractable(parameter)
            if(value.includes(str) == true){
                log.info(rowsElement[x])
            }
            else{
                log.info("!!!!!!!!!!!!!takala!!!!!!!!!!!!!")
            }
        }
        web.clear(parameter)
    },
    OpanMimshakLog:()=>{
        web.click(po.settings.settingsButton)
        web.click(po.settings.logs)
        web.click(po.settings.mimshakLog)
        log.info(web.getText('(//tbody//tr)[1]//td[2]'))
        if(web.getText('(//tbody//tr)[1]//td[2]').includes(getDate()) = false ){
            log.info("takala")
        }
    },
    ProperProfile:()=>{
        web.click(po.settings.settingsButton)
        web.click(po.settings.permiss)
        web.click(po.settings.profile)
        if(web.isVisible(po.settings.table))
        log.info("תקין")
        else
        log.info("לא תקין")
    }
   //איך ללחוץ על כל הV בשדות לעריכה
   //דרך לוודא שהוא לחץ ונהיה פעיל באמת
}