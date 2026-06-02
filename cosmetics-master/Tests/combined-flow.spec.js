require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

// ייבוא המחלקות הנדרשות
const LoginPage = require('../Pages/LoginPage');
const DealerPage = require('../Pages/Dealer');
const AddressPage = require('../Pages/Address');
const FilesPage = require('../Pages/Files');
const SharedUtils = require('../Pages/SharedUtils');
const RegulationRPPage = require('../Pages/RegulationRP');
const RegulationItemPage = require('../Pages/RegulationItem');
const RegulationNotificationPage = require('../Pages/RegulationNotification');
const ChageActivityBussinesPage = require('../Pages/ChageActivityBussines');

test.describe('טסט משולב - רישום 10 עוסקים והקמת 50 פריטים רגילים ו-50 נאות לכל עוסק', () => {
    let po;
    let env;
    let dealerPage;
    let regulationItemPage;
    let sharedUtils;
    let regulationRPPage;
    let regulationNotificationPage;
    let chageActivityBussinesPage;

    // נותנים לטסט 10 שעות לרוץ (36,000,000 אלפיות שנייה) בגלל כמות הפריטים הגדולה
    test.setTimeout(36000000);

    test.beforeEach(async ({ page }) => {
        env = {
            url: process.env.BASE_URL || 'https://cnpdev.health.gov.il',
            user: process.env.USER_ID || '322638727',
            password: process.env.USER_BIRTH_YEAR || '2000',
            charBusinessName: '&"\'W-\,ף.ץת_ 43 ()dדA',
            charBusinessId: '34',
            telefon: process.env.TELEFON || '0501234567',
            email: process.env.EMAIL || 'test@test.com',
            houseNumber: process.env.HOUSE_NUMBER || '5',
            charEmail: '',
            charAddressNotes: '',
            charOtherAddress: '',
        };

        po = {};
        po.dataFolder = path.join(__dirname, '../Data');

        // הוספת פונקציות מקלדת הנדרשות עבור מחלקות אחרות (כמו Address)
        po.utils = {
            pressF12: async () => await page.keyboard.press('F12'),
            pressTAB: async () => await page.keyboard.press('Tab'),
        };

        // מוקים נדרשים למקרה שעדיין לא הומרו כל עמודי pagesDealer
        po.pagesDealer = {
            Page1: async (locator) => { console.log('Mock Page1 executed'); },
            Page2: async () => { console.log('Mock Page2 executed'); },
            Page3: async () => { console.log('Mock Page3 executed'); }
        };

        // אתחול מחלקת עזר מרכזית ושיוך הפונקציות
        sharedUtils = new SharedUtils(page, po, env, console);
        po.ReadFileUpdate = sharedUtils.ReadFileUpdate.bind(sharedUtils);
        po.ReadFile = sharedUtils.ReadFile.bind(sharedUtils);
        po.GetRandomValidID = sharedUtils.GetRandomValidID.bind(sharedUtils);
        po.CheckCharacters = sharedUtils.CheckCharacters.bind(sharedUtils);
        po.CheckMaxLength = sharedUtils.CheckMaxLength.bind(sharedUtils);
        po.CheckCharactersEmail = sharedUtils.CheckCharactersEmail.bind(sharedUtils);
        po.CheckMaxEmail = sharedUtils.CheckMaxEmail.bind(sharedUtils);
        po.TestIsraeliPhoneNumberValidation = sharedUtils.TestIsraeliPhoneNumberValidation.bind(sharedUtils);
        
        // אתחול הדפים הרלוונטיים
        po.loginPage = new LoginPage(page, po, env, console);
        po.address = new AddressPage(page, po, env, console);
        po.files = new FilesPage(page, po, env, console);
        dealerPage = new DealerPage(page, po, env, console);
        regulationItemPage = new RegulationItemPage(page, po, env, console);
        regulationRPPage = new RegulationRPPage(page, po, env, console);
        regulationNotificationPage = new RegulationNotificationPage(page, po, env, console);
        chageActivityBussinesPage = new ChageActivityBussinesPage(page, po, env, console);
        po.regulationRP = regulationRPPage;
        po.regulationDealer = dealerPage; // חובה כדי שמחלקות אחרות יוכלו לגשת לאלמנטי שגיאה של העוסק
        po.regulationNotification = regulationNotificationPage; // חובה עבור פונקציות החיפוש והאישור (OpenItem1)

        // התחברות לסביבת פיתוח פעם אחת בתחילת הטסט
        await po.loginPage.LoginDev();
    });

    test('הרצת 10 מחזורים של רישום עוסק ופתיחת 100 פריטים בסך הכל', async ({ page }) => {
        // לולאה חיצונית - 10 פעמים עבור רישום עוסקים
        for (let i = 1; i <= 10; i++) {
            console.log(`\n--- מתחיל מחזור עוסק ${i} מתוך 10 ---`);
            
            // החל מהמחזור השני - אף על פי שאנחנו כבר בדף הבית, ייתכן ויש חסימה נסתרת
            // (Overlay) או דיאלוג מהפריט ה-20 שמונעים לחיצה על "רישום חדש".
            // לכן נבצע רענון מלא (Hard Refresh) כדי לאפס את המסך לחלוטין.
            if (i > 1) {
                console.log('מבצע רענון קשיח לדף הבית כדי לנקות חסימות...');
                await page.goto(env.url);
                await page.reload(); // רענון הדפדפן
                await page.waitForTimeout(5000); // המתנה לטעינה מחדש
                
                // נוודא ששום דיאלוג לא פתוח אחרי הרענון
                if (await dealerPage.dialog.isVisible()) {
                    await dealerPage.okEnd.click();
                }
            }

            // ייצור מזהה תקין ושם ייחודי לעוסק
            const randomId = await po.GetRandomValidID();
            const dealerName = `תאגיד אוטומציה מקבץ ${Date.now().toString().slice(-4)}_${i}`;

            // רישום עוסק בתמרוק (flug=false כדי לרוץ מהר ללא בדיקות תווים, co=1 עבור תאגיד)
            await dealerPage.RegulationDealerBusiness(false, 1, dealerName, randomId);
            
            // אישור דיאלוג ההצלחה בסיום הרישום
            await expect(dealerPage.dialog).toBeVisible({ timeout: 20000 });
            let text = await dealerPage.dialog.textContent();
            expect(text).toContain('בהצלחה');
            await dealerPage.okEnd.click();

            console.log(`שינוי פעילות עסק והוספת יבואן נאות עבור: ${dealerName}`);
            // פתיחת כרטיסיית 'פרטי העסק' ושינוי פעילות
            await chageActivityBussinesPage.ChangeActivity(["יבואן נאות"]);
            
            // חזרה לדף הבית לפני רישום נציג אחראי כדי שהמערכת תמצא את כפתור 'רישום חדש'
            await page.goto(env.url);
            await page.waitForTimeout(3000);

            console.log(`רישום נציג אחראי מקושר ליצרן/יבואן עבור: ${dealerName}`);
            // הוספת רישום נציג אחראי המקושר לעוסק שכרגע הוקם
            await regulationRPPage.RegulationToBusiness(false, dealerName);
            
            // אישור דיאלוג ההצלחה בסיום הרישום של הנציג האחראי
            await expect(dealerPage.dialog).toBeVisible({ timeout: 20000 });
            text = await dealerPage.dialog.textContent();
            expect(text).toContain('בהצלחה');
            await dealerPage.okEnd.click();

            // מערכים לשמירת שמות הפריטים שהוקמו, כדי שנוכל לאשר אותם לאחר מכן
            const regularItems = [];
            const properItems = [];

            // לולאה פנימית 1 - 50 פעמים עבור הקמת פריטים רגילים
            for (let j = 1; j <= 50; j++) {
                console.log(`מקים פריט רגיל ${j}/50 עבור עוסק ${i}/10`);
                const itemNameH = `פריט משולב עוסק ${i} רגיל ${j}`;
                const itemNameE = `Combined Regular ${i}-${j}`;
                
                // הוספת פריט רגיל (מסלול 0) ללא ולידציות (false) כדי לזרז את התהליך
                await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
                regularItems.push(itemNameH);
            }

            // לולאה פנימית 2 - 50 פעמים עבור הקמת פריטים נאותים
            for (let j = 1; j <= 50; j++) {
                console.log(`מקים פריט נאות ${j}/50 עבור עוסק ${i}/10`);
                const itemNameH = `פריט משולב עוסק ${i} נאות ${j}`;
                const itemNameE = `Combined Proper ${i}-${j}`;
                
                // הוספת פריט נאות (מסלול 1) ללא ולידציות (false)
                await regulationItemPage.AddItem(itemNameH, itemNameE, 1, false);
                properItems.push(itemNameH);
            }

            console.log(`\n--- עובר לאישור הפריטים בטבלה ע"י נציג אחראי (עוסק ${i}) ---`);
            
            // פתיחת מסך המשימות של הנציג האחראי
            await po.regulationNotification.Open("", "");
            await page.waitForTimeout(3000); // המתנה לטעינת הטבלה
            
            let approvedCount = 0;
            let hasMore = true;

            // לולאה שתרוץ עד שתאשר את כל 100 הפריטים, או עד שלא יישארו פריטים לאישור
            while (hasMore && approvedCount < 100) {
                // מחפש את כפתור 'אשר פריט' הראשון שזמין בעמוד הנוכחי
                const approveBtn = page.locator('//button[@title="אשר פריט"]').first();
                
                try {
                    await approveBtn.waitFor({ state: 'visible', timeout: 4000 });
                } catch (e) {} // התעלם אם הכפתור לא הופיע

                if (await approveBtn.isVisible()) {
                    console.log(`מאשר פריט ${approvedCount + 1} מתוך 100...`);
                    await approveBtn.click();
                    
                    // אישור פעולת האישור (כפתור צר בחלונית המעבר)
                    const extOkEndNarrow = page.locator('//button[@class="main-button narrow"]').first();
                    try {
                        await extOkEndNarrow.waitFor({ state: 'visible', timeout: 3000 });
                        await extOkEndNarrow.click();
                    } catch (e) {}
                    
                    // אישור דיאלוג ההצלחה "הפריט אושר בהצלחה"
                    try {
                        await dealerPage.dialog.waitFor({ state: 'visible', timeout: 5000 });
                        await dealerPage.okEnd.click();
                    } catch (e) {}
                    
                    approvedCount++;
                    await page.waitForTimeout(2000); // המתנה קצרה לריענון הטבלה אחרי אישור
                } else {
                    // אם אין כפתור אישור בעמוד, נבדוק אם אפשר לעבור לעמוד הבא בטבלה
                    const paginationNext = page.locator("//*[@class='grid_ar_prev md moh-icon page-button']").first();
                    let isNextVisible = await paginationNext.isVisible();
                    
                    if (isNextVisible) {
                        // נוודא שהכפתור לעמוד הבא לא מנוטרל (Disabled)
                        const ariaDisabled = await paginationNext.getAttribute('aria-disabled');
                        const disabled = await paginationNext.getAttribute('disabled');
                        if (ariaDisabled === 'true' || disabled !== null) {
                            isNextVisible = false;
                        }
                    }

                    if (isNextVisible) {
                        console.log('עובר לעמוד הבא בטבלה...');
                        await paginationNext.click();
                        await page.waitForTimeout(3000); // המתנה לטעינת העמוד הבא
                    } else {
                        console.log('אין יותר כפתורי אישור בטבלה.');
                        hasMore = false; // סיום הלולאה
                    }
                }
            }
        }
    });
});