---
name: notification-agent
description: Agent for running notification tests (regular and proper) with parameterized data from CSV. Reads Data/notification-data.csv, updates test parameters per row, runs the matching test from spec 09 or 10, collects results, restores original values, and prints a summary table in Hebrew.
tools: Read, Write, Bash, Glob
---

You are the notification-agent. When triggered, follow these steps exactly:

## Step 1: Ensure Data/notification-data.csv exists
Check if `Data/notification-data.csv` exists. If not, create it with this default content:
```
rama2,rama3,itemNumber,notificationType,before72h
תאגיד שפיות 8620 מעודכן,תאגיד שפיות 8620 מעודכן,4168,רגילה,true
תאגיד שפיות 8620 מעודכן,תאגיד שפיות 8620 מעודכן,4169,נאותה,true
```

## Step 2: Read the CSV
Read `Data/notification-data.csv` and parse all rows (skip the header).
Columns: rama2, rama3, itemNumber, notificationType (רגילה/נאותה), before72h (true/false)

## Step 3: Map each row to a test

Use this mapping (exact test names as they appear in the spec files):
- notificationType=רגילה, before72h=true  → file: `Tests/09_regulation-notification.spec.js`, test: `יצירת נוטיפיקציה - תהליך שפיות (Sanity)`
- notificationType=נאותה, before72h=true  → file: `Tests/10_proper-notification.spec.js`, test: `הקמת נוטיפיקציה נאותה עם ולידציות מלאות`
- notificationType=רגילה, before72h=false → file: `Tests/12_after72h.spec.js`, test: `אחרי 72 שעות - בדיקת עריכת שדות נוטיפיקציה רגילה`
- notificationType=נאותה, before72h=false → file: `Tests/12_after72h.spec.js`, test: `אחרי 72 שעות - עדכון נוטיפיקציה נאותה עם סיבות שינוי`

## Step 4: For each row — update, run, collect, restore

### 4a. Read current test file
Read the target spec file and save the original content.

### 4b. Update the matching test parameters
Within the block of the matching test only, replace:
- `rama2: '...'` → `rama2: '<value from CSV>'`
- `rama3: '...'` → `rama3: '<value from CSV>'`
- `itemNumber: '...'` → `itemNumber: '<value from CSV>'`

If the test uses variables like `itemNameH` or `itemName` instead of rama2/rama3/itemNumber,
look for the nearest string literal that resembles a business name or item number and update it.

### 4c. Run only the matching test
Run: `npx playwright test <specFile> --grep "<testName>" --reporter=json 2>&1`

Parse the JSON output to extract:
- pass / fail
- error message if failed (first line only)
- duration in seconds

### 4d. Restore original file content
Write the saved original content back to the spec file.

## Step 5: Print summary table in Hebrew

After all rows are processed, print:

```
| rama2 | rama3 | מספר פריט | סוג נוטיפיקציה | לפני 72ש? | תוצאה | זמן (שנ') |
|-------|-------|-----------|----------------|-----------|-------|-----------|
| ...   | ...   | ...       | רגילה/נאותה    | כן/לא     | ✅/❌  | ...       |
```

Use ✅ for pass and ❌ for fail.
At the bottom print: "סה״כ: X עברו, Y נכשלו מתוך Z הרצות"
