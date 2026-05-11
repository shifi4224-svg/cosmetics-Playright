# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regulation-notification.spec.js >> בדיקות נוטיפיקציות - יצירת נוטיפיקציה מלאה ושפיות >> יצירת נוטיפיקציה - תהליך שפיות (Sanity)
- Location: Tests\regulation-notification.spec.js:46:5

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('//moh-radiobutton-group[@formcontrolname="manufacturerAbroad"]//*[text()="יצרן מקומי"]')

```

# Test source

```ts
  255 |         await this.cosmeticImportValue3.click();
  256 |         await this.cosmeticImportValue3CheckBox1.click();
  257 |         await this.cosmeticImportValue3CheckBox2.click();
  258 |     }
  259 | 
  260 |     async QuantityAndPackaging(p, flug = true) {
  261 |         await this.packType.click();
  262 |         await this.packTypeName.click();
  263 |         await this.unitType.click();
  264 |         await this.unitTypeName.click();
  265 |         await this.amount.fill(p[0] || "");
  266 |         if (flug) {
  267 |             await this.sharedUtils.CheckCharacters(this.barcode, "ברקוד", this.env.charBusinessId);
  268 |             await this.sharedUtils.CheckMaxLength(this.barcode, 9, "ברקוד");
  269 |         }
  270 |     }
  271 | 
  272 |     async SpecialPack(flug = true) {
  273 |         await this.specialPackCheckBox.click();
  274 |         await this.specialPack.click();
  275 |         await this.specialPackValue.click();
  276 |         if (flug) {
  277 |             await this.sharedUtils.CheckCharacters(this.otherspecialPack, "אריזה מיוחדת אחר", this.env.charNotification);
  278 |             await this.sharedUtils.CheckMaxLength(this.otherspecialPack, 50, "אריזה מיוחדת אחר");
  279 |         }
  280 |         await this.otherspecialPack.fill("אא");
  281 |     }
  282 | 
  283 |     async Files(flug = true) {
  284 |         if (flug) {
  285 |             await this.filesPage.TestFileTypeValidation(this.cosmeticsPictures, "תמונות תמרוק");
  286 |             await this.filesPage.TestFileTypeValidation(this.cosmeticsLabel, "תווית תמרוק");
  287 |         }
  288 |         await this.filesPage.AtachFile(this.cosmeticsPictures);
  289 |         await this.filesPage.AtachFile(this.cosmeticsLabel);
  290 |     }
  291 | 
  292 |     async EzerOpen() {
  293 |         let oldfilepath = path.join(this.po.dataFolder, 'RP.txt');
  294 |         let bussines = await this.sharedUtils.ReadFile(oldfilepath);
  295 |         return bussines[0] || bussines;
  296 |     }
  297 | 
  298 |     async Open(b1 = "", b2 = "") {
  299 |         try {
  300 |             let bussines1 = "";
  301 |             let bussines2 = "";
  302 | 
  303 |             if (b1 === "") {
  304 |                 bussines1 = await this.EzerOpen();
  305 |             } else {
  306 |                 bussines1 = b1;
  307 |             }
  308 | 
  309 |             if (b2 === "") {
  310 |                 bussines2 = await this.EzerOpen();
  311 |             } else {
  312 |                 bussines2 = b2;
  313 |             }
  314 | 
  315 |             this.log.info(`פותח עמוד נציג אחראי ${bussines1} לעסק ${bussines2}`);
  316 |             let rama2 = `//span[text() ="${bussines1}"]`;
  317 |             let rama3 = `//span[(@class="sidebar-text") and (text()="${bussines2}")]`;
  318 | 
  319 |             await this.page.waitForTimeout(1000);
  320 |             await this.rpRole.click();
  321 |             await this.page.waitForTimeout(1000);
  322 |             await this.page.locator(rama2).click();
  323 |             await this.page.waitForTimeout(1000);
  324 |             await this.page.locator(rama3).click();
  325 |             await this.page.waitForTimeout(1000);
  326 |         } catch (err) {
  327 |             this.log.error(err.message);
  328 |             throw err; // ← חובה
  329 |         }
  330 |     }
  331 | 
  332 |     async ReadValues(fileName) {
  333 |         return await this.sharedUtils.ReadFileComment(path.join(this.po.dataFolder, fileName));
  334 |     }
  335 | 
  336 |     async CheckDialog() {
  337 |         let dialogTaxt = await this.dialog.textContent() || "";
  338 |         this.log.info(dialogTaxt);
  339 |         if (dialogTaxt.includes("אנא נסה שוב")) {
  340 |             this.log.info("התקבלה הודעת שגיאה והנוטיפיקציה לא נשמרה");
  341 |         } else if (dialogTaxt.includes("בהצלחה")) {
  342 |             this.log.info("התקבלה הודעת הצלחה והנוטיפיקציה נשמרה");
  343 |         } else {
  344 |             this.log.info("התקבלה הודעת שגיאה לא קלאסית: " + dialogTaxt);
  345 |         }
  346 |     }
  347 | 
  348 |     async CreateNotificationSanity(itemName = "", flug = true) {
  349 |         const v = await this.ReadValues("sanity.txt");
  350 |         //await this.Open();
  351 |         console.log(3)
  352 |         await this.regulationItemPage.OpenItem1("","",itemName, "", null, "פריט רגיל", "");
  353 |         console.log(3)
  354 |         //יצרן מקומי
> 355 |         await this.israelManufacturerAbroad.click();
      |                                             ^ Error: locator.click: Target page, context or browser has been closed
  356 |         await this.manufacturerName.fill(v[0]);
  357 |         await this.option.first().click();
  358 |         await this.nextStep.click();
  359 |         //קטגוריות
  360 |         await this.category1.click();
  361 |         await this.typeName1.waitFor({ state: 'visible' });
  362 |         await this.typeName1.click();
  363 |         await this.category2.click();
  364 |         await this.typeName2.waitFor({ state: 'visible' });
  365 |         await this.typeName2.click();
  366 |         await this.category3.click();
  367 |         await this.typeName3.waitFor({ state: 'visible' });
  368 |         await this.typeName3.click();
  369 |         //מאפייני התמרוק
  370 |         await this.SpecialPack(flug);
  371 |         //תיאור התמרוק
  372 |         await this.phases.click();
  373 |         await this.typePhases.click();
  374 |         await this.physicochemical.click();
  375 |         await this.typePhysicochemical.waitFor({ state: 'visible', timeout: 1000 }).catch(() => { });
  376 |         await this.typePhysicochemical.click();
  377 |         //קבצים
  378 |         await this.Files(flug);
  379 |         //כמות ואריזה
  380 |         await this.QuantityAndPackaging([v[1]], flug);
  381 |         if (flug) {
  382 |             await this.sharedUtils.CheckCharacters(this.instructionsForUse, "הוראות שימוש", this.env.charNotification);
  383 |             await this.sharedUtils.CheckMaxLength(this.instructionsForUse, 4000, "הוראות שימוש");
  384 |         }
  385 |         await this.instructionsForUse.fill(v[2]);
  386 | 
  387 |         //תוקף המוצר
  388 |         await this.exp.click();
  389 |         await this.numOfMonth.fill("200");
  390 |         await this.frequencyOfUse.click();
  391 |         await this.frequencyOfUseName.click();
  392 |         //גוונים
  393 |         await this.AddShades(v[3], flug);
  394 |         await this.nextStep.click();
  395 |         //חומרים
  396 |         await this.page.waitForTimeout(5000);
  397 |         await this.oKmaterials.click();
  398 |         await this.page.waitForTimeout(5000);
  399 |         await this.nextStep.click();
  400 |         await this.nextStep.click();
  401 |         //אוכלוסית יעד
  402 |         await this.populationTitle.click();
  403 |         await this.populationTitleName.click();
  404 |         await this.nextStep.click();
  405 |         //ננו
  406 |         await this.noContainNano.click();
  407 |         await this.saveSubmit.click();
  408 | 
  409 |         if (await this.sharedUtils.isVisibleSafe(this.manufAddress, 2000)) {
  410 |             await this.manuftype1.click();
  411 |             await this.manufSave.click();
  412 |         }
  413 |         await this.dialog.waitFor({ state: 'visible' });
  414 |         await this.CheckDialog();
  415 |         await this.okEnd.click();
  416 |         await this.page.waitForTimeout(5000);
  417 |     }
  418 | 
  419 |     async CreateNotificationFull(flug = true) {
  420 |         const value = '1'.repeat(50);
  421 |         const h = '1'.repeat(2000);
  422 |         const v = await this.ReadValues("full.txt");
  423 | 
  424 |         await this.Open();
  425 |         //יצרן בחו"ל
  426 |         if (flug) {
  427 |             await this.OverseasManufacturerAbroad(v[0], v[1], v[2], v[3], v[4], v[5], true);
  428 |         } else {
  429 |             await this.OverseasManufacturerAbroad(value, value, value, "45", "777", value, false);
  430 |         }
  431 |         await this.nextStep.click();
  432 |         //קטגוריות
  433 |         await this.category1.click();
  434 |         await this.typeName1.waitFor({ state: 'visible' });
  435 |         await this.typeName1.click();
  436 |         await this.category2.click();
  437 |         await this.typeName2.waitFor({ state: 'visible' });
  438 |         await this.typeName2.click();
  439 |         await this.category3.click();
  440 |         await this.typeName3.waitFor({ state: 'visible' });
  441 |         await this.typeName3.click();
  442 |         //מאפייני התמרוק
  443 |         await this.washable.click();
  444 |         await this.granules.click();
  445 |         //תיאור התמרוק
  446 |         await this.phases.click();
  447 |         await this.typePhases.click();
  448 |         await this.physicochemical.click();
  449 |         await this.typePhysicochemical.click();
  450 |         //קבצים
  451 |         await this.Files(flug);
  452 |         //כמות ואריזה
  453 |         await this.QuantityAndPackaging([v[8], v[9]], flug);
  454 |         if (flug) {
  455 |             await this.sharedUtils.CheckCharacters(this.instructionsForUse, "הוראות שימוש", this.env.charNotification);
```