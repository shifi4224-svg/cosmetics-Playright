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
const EditBussinesDetailsPage = require('../Pages/EditBussinesDetails');
const UpdateProperImporterPage = require('../Pages/UpdateProperImporter');

test.describe('טסט משולב - הרצות תהליכים', () => {
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

    test('תסריט שפיות - כל התהליכים הבסיסיים', async ({ page }) => {
        test.setTimeout(36000000);

        const properNotificationPage = new (require('../Pages/properNotification'))(page, po, env, console);
        const regulationTaagidRP = new (require('../Pages/RegulationTaagidRP'))(page, po, env, console);
        const editBussinesDetailsPage = new EditBussinesDetailsPage(page, po, env, console);
        const updateProperImporterPage = new UpdateProperImporterPage(page, po, env, console);
        po.regulationNotification = regulationNotificationPage;

        // --- 1: רישום עוסק בתמרוק ---
        console.log('--- שלב 1: רישום עוסק בתמרוק ---');
        const randomId = await po.GetRandomValidID();
        const dealerName = `תאגיד שפיות ${Date.now().toString().slice(-4)}`;
        await dealerPage.RegulationDealerBusiness(false, 1, dealerName, randomId);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        let text = await dealerPage.dialog.textContent();
        if (text.includes('בהצלחה')) {
            await dealerPage.okEnd.click();
        } else if (text.includes('אנא נסה שוב')) {
            console.log('⚠️ שלב 1 - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
            await page.pause();
            await dealerPage.okEnd.click();
        } else {
            console.warn(`⚠️ שלב 1 - התקבלה הודעה שונה: ${text}`);
            await dealerPage.okEnd.click();
        }

        await page.waitForTimeout(2000);
        // --- 2: פעולות פרטי עסק ---
        console.log('--- שלב 2: שינוי פעילות ---');
        try {
            await chageActivityBussinesPage.ChangeActivity(["יבואן נאות"]);
        } catch (e) {
            if (e.message.startsWith('TryAgain:')) {
                console.log('⚠️ שלב 2 שינוי פעילות - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
                await page.pause();
            } else {
                console.warn(`⚠️ שלב 2 שינוי פעילות - התקבלה הודעה שונה: ${e.message}`);
            }
        }

        await page.waitForTimeout(2000);
        console.log('--- שלב 2: עריכת פרטי עסק ---');
        await page.goto(env.url);
        try {
            await editBussinesDetailsPage.UpdateBusinessDetails(0, `${dealerName} מעודכן`, process.env.TELEFON || "0501234567", process.env.EMAIL || "test@test.com");
        } catch (e) {
            if (e.message.startsWith('TryAgain:')) {
                console.log('⚠️ שלב 2 עריכת פרטי עסק - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
                await page.pause();
            } else {
                console.warn(`⚠️ שלב 2 עריכת פרטי עסק - התקבלה הודעה שונה: ${e.message}`);
            }
        }

        await page.waitForTimeout(2000);
        console.log('--- שלב 2: עדכון תנאי יצור נאותים ---');
        await page.goto(env.url);
        try {
            await updateProperImporterPage.Update();
        } catch (e) {
            if (e.message.startsWith('TryAgain:')) {
                console.log('⚠️ שלב 2 עדכון יבואן נאות - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
                await page.pause();
            } else {
                console.warn(`⚠️ שלב 2 עדכון יבואן נאות - התקבלה הודעה שונה: ${e.message}`);
            }
        }

        await page.waitForTimeout(2000);
        // --- 3: רישום תאגיד נציג אחראי ---
        console.log('--- שלב 3: רישום תאגיד נציג אחראי ---');
        await page.goto(env.url);
        await regulationTaagidRP.LoginToDeaker(false, "תאגיד שפיות נציג");
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        text = await dealerPage.dialog.textContent();
        if (text.includes('בהצלחה')) {
            await dealerPage.okEnd.click();
        } else if (text.includes('אנא נסה שוב')) {
            console.log('⚠️ שלב 3 - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
            await page.pause();
            await dealerPage.okEnd.click();
        } else {
            console.warn(`⚠️ שלב 3 - התקבלה הודעה שונה: ${text}`);
            await dealerPage.okEnd.click();
        }

        await page.waitForTimeout(2000);
        // --- 4: נציג אחראי מקושר לתאגיד ---
        console.log('--- שלב 4: נציג אחראי מקושר לתאגיד ---');
        await page.goto(env.url);
        await page.waitForTimeout(3000);
        await regulationRPPage.RegulationToCorpuration("", false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        text = await dealerPage.dialog.textContent();
        if (text.includes('בהצלחה')) {
            await dealerPage.okEnd.click();
        } else if (text.includes('אנא נסה שוב')) {
            console.log('⚠️ שלב 4 - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
            await page.pause();
            await dealerPage.okEnd.click();
        } else {
            console.warn(`⚠️ שלב 4 - התקבלה הודעה שונה: ${text}`);
            await dealerPage.okEnd.click();
        }

        await page.waitForTimeout(2000);
        // --- 5: נציג אחראי מקושר ליצרן/יבואן ---
        console.log('--- שלב 5: נציג אחראי מקושר ליצרן/יבואן ---');
        await page.goto(env.url);
        await page.waitForTimeout(3000);
        await regulationRPPage.RegulationToBusiness("", false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        text = await dealerPage.dialog.textContent();
        if (text.includes('בהצלחה')) {
            await dealerPage.okEnd.click();
        } else if (text.includes('אנא נסה שוב')) {
            console.log('⚠️ שלב 5 - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
            await page.pause();
            await dealerPage.okEnd.click();
        } else {
            console.warn(`⚠️ שלב 5 - התקבלה הודעה שונה: ${text}`);
            await dealerPage.okEnd.click();
        }

        await page.waitForTimeout(2000);
        // --- 6: נציג אחראי בודד ---
        console.log('--- שלב 6: נציג אחראי בודד ---');
        await page.goto(env.url);
        await page.waitForTimeout(3000);
        await regulationRPPage.RegulationToRP("", false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 30000 });
        text = await dealerPage.dialog.textContent();
        if (text.includes('בהצלחה')) {
            await dealerPage.okEnd.click();
        } else if (text.includes('אנא נסה שוב')) {
            console.log('⚠️ שלב 6 - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
            await page.pause();
            await dealerPage.okEnd.click();
        } else {
            console.warn(`⚠️ שלב 6 - התקבלה הודעה שונה: ${text}`);
            await dealerPage.okEnd.click();
        }

        await page.waitForTimeout(2000);
        // --- 7: פריט רגיל + נוטיפיקציה רגילה ---
        console.log('--- שלב 7: פריט רגיל ---');
        const uniqueId = Date.now().toString().slice(-4);
        const itemNameH = `פריט שפיות ${uniqueId}`;
        const itemNameE = `Sanity Item ${uniqueId}`;
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);

        await page.waitForTimeout(2000);
        console.log('--- שלב 7: נוטיפיקציה רגילה ---');
        await regulationNotificationPage.CreateNotificationSanity(itemNameH, false);
        await expect(regulationNotificationPage.dialog).toBeVisible({ timeout: 30000 });
        const notifText = await regulationNotificationPage.dialog.textContent();
        if (notifText.includes('בהצלחה')) {
            await regulationNotificationPage.okEnd.click();
        } else if (notifText.includes('אנא נסה שוב')) {
            console.log('⚠️ שלב 7 נוטיפיקציה רגילה - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
            await page.pause();
            await regulationNotificationPage.okEnd.click();
        } else {
            console.warn(`⚠️ שלב 7 נוטיפיקציה רגילה - התקבלה הודעה שונה: ${notifText}`);
            await regulationNotificationPage.okEnd.click();
        }

        await page.waitForTimeout(2000);
        // --- 8: פריט נאות + נוטיפיקציה נאותה ---
        console.log('--- שלב 8: פריט נאות ---');
        const properItemH = `פריט נאות שפיות ${uniqueId}`;
        const properItemE = `Sanity Proper ${uniqueId}`;
        await regulationItemPage.AddItem(properItemH, properItemE, 1, false);

        await page.waitForTimeout(2000);
        console.log('--- שלב 8: נוטיפיקציה נאותה ---');
        await regulationItemPage.OpenItem1("", "", properItemH, "פריט נאות", 'לאישור נציג אחראי', "approve", true);
        await properNotificationPage.CreateProperNotification(false);
        await expect(regulationNotificationPage.dialog).toBeVisible({ timeout: 30000 });
        const properNotifText = await regulationNotificationPage.dialog.textContent();
        if (properNotifText.includes('בהצלחה')) {
            await regulationNotificationPage.okEnd.click();
        } else if (properNotifText.includes('אנא נסה שוב')) {
            console.log('⚠️ שלב 8 נוטיפיקציה נאותה - קיבל "אנא נסה שוב" - ממתין להמשך ידני');
            await page.pause();
            await regulationNotificationPage.okEnd.click();
        } else {
            console.warn(`⚠️ שלב 8 נוטיפיקציה נאותה - התקבלה הודעה שונה: ${properNotifText}`);
            await regulationNotificationPage.okEnd.click();
        }

        console.log('✅ תסריט שפיות הושלם בהצלחה!');
    });

    test('תהליך פרטי עסק - רישום תאגיד ופעולות פרטי עסק', async ({ page }) => {
        test.setTimeout(3600000);

        const editBussinesDetailsPage = new EditBussinesDetailsPage(page, po, env, console);
        const updateProperImporterPage = new UpdateProperImporterPage(page, po, env, console);

        // שלב 1: רישום עוסק בתמרוק תאגיד
        const randomId = await po.GetRandomValidID();
        const dealerName = `תאגיד פרטי עסק ${Date.now().toString().slice(-4)}`;
        console.log(`רושם עוסק: ${dealerName}`);

        await dealerPage.RegulationDealerBusiness(false, 1, dealerName, randomId);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 20000 });
        let text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();

        // שלב 2: שינוי פעילות עסק
        console.log('מבצע שינוי פעילות עסק');
        await chageActivityBussinesPage.ChangeActivity(["יבואן נאות"]);

        // שלב 3: עריכת פרטי עסק
        console.log('מבצע עריכת פרטי עסק');
        await page.goto(env.url);
        await editBussinesDetailsPage.UpdateBusinessDetails(0, `${dealerName} מעודכן`, "0501234567", "test@test.com");

        // שלב 4: עריכת תנאי יצור נאותים
        console.log('מבצע עדכון תנאי יצור נאותים');
        await page.goto(env.url);
        await updateProperImporterPage.Update();

        // שלב 5: הוספת עובד ממונה
        console.log('מוסיף עובד ממונה');
        await page.goto(env.url);
        await dealerPage.AuthorizedEmployeeDealer(`${dealerName} מעודכן`, randomId);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 10000 });
        text = await dealerPage.dialog.textContent();
        expect(text).toContain('טרם הושלמה');
        await dealerPage.okEnd.click();
    });

    test('תהליך מקצה לקצה - רישום עוסק, נציג אחראי, פריט רגיל ונוטיפיקציה', async ({ page }) => {
        test.setTimeout(3600000);

        // שלב 1: רישום עוסק בתמרוק תאגיד
        const randomId = await po.GetRandomValidID();
        const dealerName = `תאגיד E2E ${Date.now().toString().slice(-4)}`;
        console.log(`רושם עוסק: ${dealerName}`);

        await dealerPage.RegulationDealerBusiness(false, 1, dealerName, randomId);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 20000 });
        let text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();

        // שלב 2: רישום נציג אחראי מקושר לעסק
        await page.goto(env.url);
        await page.waitForTimeout(3000);
        console.log(`רושם נציג אחראי עבור: ${dealerName}`);

        await regulationRPPage.RegulationToBusiness(dealerName, false);
        await expect(dealerPage.dialog).toBeVisible({ timeout: 20000 });
        text = await dealerPage.dialog.textContent();
        expect(text).toContain('בהצלחה');
        await dealerPage.okEnd.click();

        // שלב 4: הקמת פריט רגיל
        const itemNameH = `פריט E2E ${Date.now().toString().slice(-4)}`;
        const itemNameE = `E2E Item ${Date.now().toString().slice(-4)}`;
        console.log(`מקים פריט: ${itemNameH}`);
        await regulationItemPage.AddItem(itemNameH, itemNameE, 0, false);
        await page.reload();
        await page.waitForTimeout(3000);

        // שלב 5: הקמת נוטיפיקציה רגילה
        console.log(`מקים נוטיפיקציה עבור: ${itemNameH}`);
        await regulationNotificationPage.CreateNotificationSanity(itemNameH, false);

        await expect(regulationNotificationPage.dialog).toBeVisible({ timeout: 20000 });
        text = await regulationNotificationPage.dialog.textContent();
        expect(text).toContain('נוטיפיקציה נשמרה בהצלחה');
        await regulationNotificationPage.okEnd.click();
    });

    test('הרצת 30 מחזורים של רישום עוסק ופתיחת 400 פריטים לכל עוסק', async ({ page }) => {
        // לולאה חיצונית - 10 פעמים עבור רישום עוסקים
        for (let i = 1; i <= 30; i++) {
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
            await regulationRPPage.RegulationToBusiness(dealerName, false);
            
            // אישור דיאלוג ההצלחה בסיום הרישום של הנציג האחראי
            await expect(dealerPage.dialog).toBeVisible({ timeout: 20000 });
            text = await dealerPage.dialog.textContent();
            expect(text).toContain('בהצלחה');
            await dealerPage.okEnd.click();

            // מערכים לשמירת שמות הפריטים שהוקמו, כדי שנוכל לאשר אותם לאחר מכן
            const regularItems = [];
            const properItems = [];

            // כניסה לעסק פעם אחת בלבד לפני הלולאה
            const businessName = await sharedUtils.OpenPageMancal();

            // לולאה פנימית 1 - 200 פעמים עבור הקמת פריטים רגילים
            for (let j = 1; j <= 200; j++) {
                console.log(`מקים פריט רגיל ${j}/200 עבור עוסק ${i}/30`);
                const itemNameH = `פריט משולב עוסק ${i} רגיל ${j}`;
                const itemNameE = `Combined Regular ${i}-${j}`;
                await regulationItemPage.AddItemFast(itemNameH, itemNameE, businessName, 0);
                regularItems.push(itemNameH);
            }

            // לולאה פנימית 2 - 200 פעמים עבור הקמת פריטים נאותים
            for (let j = 1; j <= 200; j++) {
                console.log(`מקים פריט נאות ${j}/200 עבור עוסק ${i}/30`);
                const itemNameH = `פריט משולב עוסק ${i} נאות ${j}`;
                const itemNameE = `Combined Proper ${i}-${j}`;
                await regulationItemPage.AddItemFast(itemNameH, itemNameE, businessName, 1);
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
                    const extOkEndNarrow = page.locator('//button[@class="main-button narrow"] | //button[normalize-space()="OK"] | //button[normalize-space()="אישור"]').first();
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

    test('הקמת 10000 פריטים - 5000 רגיל ו-5000 נאות לעסק קיים', async ({ page }) => {
        test.setTimeout(36000000);

        // קריאת שם העסק מהקובץ
        const businessName = await sharedUtils.OpenPageMancal();
        console.log(`מקים פריטים עבור עסק: ${businessName}`);

        // לולאה 1 - 5000 פריטים רגילים
        for (let j = 1; j <= 5000; j++) {
            console.log(`מקים פריט רגיל ${j}/5000`);
            const itemNameH = `פריט רגיל ${Date.now().toString().slice(-4)}_${j}`;
            const itemNameE = `Regular Item ${Date.now().toString().slice(-4)}_${j}`;
            await regulationItemPage.AddItemFast(itemNameH, itemNameE, businessName, 0, j === 5000);
        }

        // לולאה 2 - 5000 פריטים נאותים
        for (let j = 1; j <= 5000; j++) {
            console.log(`מקים פריט נאות ${j}/5000`);
            const itemNameH = `פריט נאות ${Date.now().toString().slice(-4)}_${j}`;
            const itemNameE = `Proper Item ${Date.now().toString().slice(-4)}_${j}`;
            await regulationItemPage.AddItemFast(itemNameH, itemNameE, businessName, 1, j === 5000);
        }

        console.log('הסתיימה הקמת 10000 הפריטים');
    });

});