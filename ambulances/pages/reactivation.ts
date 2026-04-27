import { Page, Locator } from '@playwright/test';

export class ReactivationPage {
    readonly page: Page;
    readonly reactivationForm: Locator;
    readonly corpurationName: Locator;
    readonly option: Locator;
    readonly reactivType: Locator;
    readonly nextButton: Locator;
    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly idNumber: Locator;
    readonly licenseNumber: Locator;
    readonly city: Locator;
    readonly startDate: Locator;
    readonly driverNumber: Locator;
    readonly phone: Locator;
    readonly prefix: Locator;
    readonly authorizedToDrive: Locator;
    readonly medicalExperienceDesc: Locator;
    readonly trainingType: Locator;
    readonly trainingProvider: Locator;
    readonly trainingEndDate: Locator;
    readonly addEmployee: Locator;
    readonly vehicleLicenseNumber: Locator;
    readonly vehicleLicenseValidity: Locator;
    readonly defibrillatorCheckDate: Locator;
    readonly defibrillatorSerialNumber: Locator;
    readonly addRescueVehicle: Locator;
    readonly submitRequest: Locator;
    readonly saveDraft: Locator;
    readonly previousButton: Locator;





    constructor(page: Page) {
        this.page = page;
        this.reactivationForm = page.locator('//button[text()=" לחידוש אישור הפעלה "]');
        this.corpurationName = page.locator('//input[@aria-label="בחר תאגיד"]');
        this.option = page.locator('//mat-option[1]');
        this.reactivType = page.locator('//input[@aria-label="סוג האישור המבוקש"]');
        this.nextButton = page.locator('//span[text()="הבא"]');
        this.firstName = page.locator('//input[@aria-label="שם פרטי"]');
        this.lastName = page.locator('//input[@aria-label="שם משפחה"]');
        this.idNumber = page.locator('//input[@aria-label="ת.ז."]');
        this.licenseNumber = page.locator('//input[@aria-label="מ.ר."]');
        this.city = page.locator('//input[@aria-label="ישוב מגורים"]');
        this.startDate = page.locator('//input[@aria-label="תאריך תחילת העסקה"]');
        this.driverNumber = page.locator('//input[@aria-label="מספר כונן"]');
        this.phone = page.locator('//input[@aria-label="tel"]');
        this.prefix = page.locator('//input[@aria-label="קידומת"]');
        this.authorizedToDrive = page.locator('//*[@aria-label="רשאי לנהוג ברכב ביטחון?"]');
        this.medicalExperienceDesc = page.locator('//textarea[@aria-label="תיאור הנסיון הרפואי של הרופא האחראי"]');
        this.trainingType = page.locator('//input[@aria-label="תת סוג הכשרה"]');
        this.trainingProvider = page.locator('//input[@aria-label="גורם מכשיר"]');
        this.trainingEndDate = page.locator('//input[@aria-label="תאריך סיום הכשרה"]');
        this.addEmployee = page.locator('//i[@aria-label="הוספת עובד"]');
        this.vehicleLicenseNumber = page.locator('//input[@aria-label="מספר רישוי"]');
        this.vehicleLicenseValidity = page.locator('//input[@aria-label="תוקף רישיון הרכב"]');
        this.defibrillatorCheckDate = page.locator('//input[@aria-label="תאריך בדיקת דפיברילטור"]');
        this.defibrillatorSerialNumber = page.locator('//input[@aria-label="מס\' סידורי דפיברילטור"]');
        this.addRescueVehicle = page.locator('//i[@aria-label="הוספת כלי הצלה"]');
        this.submitRequest = page.locator('//span[text()="שלח בקשה"]');
        this.saveDraft = page.locator('//span[text()="שמירת טיוטה"]');
        this.previousButton = page.locator('//span[text()="הקודם"]');
    }

    async submitReactivationForm() {
        console.log('מתחיל תהליך אישור חידוש הפעלה...');
        // הוסיפי כאן את הלוגיקה של העמוד (locators, clicks, fills) כמו שעשית ב-loginPage
        await this.reactivationForm.click();

        // עמוד ראשון: בחירת תאגיד
        await this.corpurationName.click();
        await this.option.click(); // בחירת האופציה הראשונה

        // עמוד ראשון: סוג אישור מבוקש
        await this.reactivType.click();
        await this.option.click(); // בחירת האופציה הראשונה

        // לחיצה על כפתור "הבא" לסיום העמוד הראשון
        await this.nextButton.click();
        await this.page.waitForLoadState('networkidle'); // המתנה לטעינת הדף/הנתונים

        // עמוד שני: מילוי דינמי של עובדים (3 עובדים, לכל אחד 2 הכשרות)
        await this.fillEmployees(3);

        // מעבר לעמוד הבא (כלי הצלה)
        await this.nextButton.click();
        await this.page.waitForLoadState('networkidle'); // המתנה לטעינת הדף/הנתונים

        // עמוד שלישי: מילוי פרטי כלי הצלה והדפיברילטור
        // קריאה לפונקציה הדינמית - בדוגמה זו נבקש למלא 2 רכבים (אפשר לשנות לכל מספר)
        await this.fillRescueVehicles(3);

        // מעבר לעמוד האחרון
        await this.nextButton.click();
        await this.page.waitForLoadState('networkidle'); // המתנה לטעינת הדף/הנתונים

        // סיום התהליך ושליחת הבקשה
        await this.submitRequest.click();
    }

    async fillRescueVehicles(numberOfVehicles: number) {
        for (let i = 0; i < numberOfVehicles; i++) {
            // שימוש ב-nth(i) כדי לגשת לשדה הספציפי של הרכב הנוכחי (0 לרכב הראשון, 1 לשני וכו')
            await this.vehicleLicenseNumber.nth(i).fill(`12-345-6${i}`); // תבנית של XX-XXX-XX כאשר הספרה האחרונה ייחודית
            // await this.vehicleLicenseValidity.nth(i).fill('31/12/2025');
            await this.defibrillatorSerialNumber.nth(i).fill(`DEF-987${i}`);
            // await this.defibrillatorCheckDate.nth(i).fill('01/01/2024');

            // לחיצה על "הוספת כלי הצלה" רק אם זה לא הרכב האחרון שביקשנו להוסיף
            if (i < numberOfVehicles - 1) {
                console.log("הגעתי לכאן")
                await this.addRescueVehicle.click();
                await this.page.waitForTimeout(500); // השהייה קלה כדי לתת לשורת הרכב החדשה להתרנדר בדף
            }
        }
        console.log("סיימתי למלא רכבים")
        await this.page.pause();
    }

    async fillEmployees(numberOfEmployees: number) {
        for (let i = 0; i < numberOfEmployees; i++) {
            // מילוי פרטי העובד עם שימוש ב-nth(i)
            await this.firstName.nth(i).fill(`ישראל${i}`);
            await this.lastName.nth(i).fill(`ישראלי${i}`);
            await this.idNumber.nth(i).fill(`12345678${i}`); // יצירת ת.ז ייחודית לעובד
            await this.licenseNumber.nth(i).fill(`1234${i}`);

            await this.city.nth(i).click();
            await this.option.click();

            await this.prefix.nth(i).click();
            await this.option.click();
            await this.phone.nth(i).fill(`123456${i}`);

            // await this.startDate.nth(i).fill('01/01/2023'); 
            await this.driverNumber.nth(i).fill(`9876${i}`);
            await this.authorizedToDrive.nth(i).click();
            await this.medicalExperienceDesc.nth(i).fill(`תיאור ניסיון רפואי עבור עובד מספר ${i + 1}`);

            // קריאה לפונקציה הפנימית להוספת 2 הכשרות לעובד הנוכחי
            await this.fillTrainings(i, 2);

            // לחיצה על "הוספת עובד" רק אם זה לא העובד האחרון
            if (i < numberOfEmployees - 1) {
                await this.addEmployee.click();
                await this.page.waitForTimeout(500); // השהייה לרינדור השורה החדשה
            }
        }
    }

    async fillTrainings(employeeIndex: number, numberOfTrainings: number) {
        for (let j = 0; j < numberOfTrainings; j++) {
            // חישוב האינדקס הגלובלי של ההכשרה בתוך כלל ההכשרות שעל המסך
            let globalTrainingIndex = employeeIndex * numberOfTrainings + j;

            await this.trainingType.nth(globalTrainingIndex).click();
            await this.option.click();

            await this.trainingProvider.nth(globalTrainingIndex).click();
            await this.option.click();

            // await this.trainingEndDate.nth(globalTrainingIndex).click();
            // await this.option.click();

            // שימי לב: אם בתוך המערכת צריך ללחוץ על לחצן כלשהו כמו "+" כדי לפתוח עוד שורת הכשרה לעובד הזה - זה יצטרך לבוא כאן!
        }
    }
}