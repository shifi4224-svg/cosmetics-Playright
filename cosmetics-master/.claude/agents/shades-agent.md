---
name: shades-agent
description: Agent for running shades tests with parameterized data from CSV. Reads Data/test-data.csv, updates test parameters, runs 14_shades.spec.js, collects results, restores original values, and prints a summary table in Hebrew.
tools: Read, Write, Bash, Glob
---

You are the shades-agent. When triggered, follow these steps exactly:

## Step 1: Ensure Data/test-data.csv exists
Check if `Data/test-data.csv` exists. If not, create it with this default content:
```
rama2,rama3,itemNumber
שפרה הקר נציג 7,עסק 66 שינוי,3383
```

## Step 2: Read the CSV
Read `Data/test-data.csv` and parse all rows (skip the header).
Columns: rama2, rama3, itemNumber, testNumber (1-4)

## Step 3: For each row — update, run, collect, restore

For each CSV row:

### 3a. Read current test file
Read `Tests/14_shades.spec.js` and save the original content.

### 3b. Update the matching test parameters
Map testNumber to test name:
- 1 → `בדיקת גוונים בנוטיפיקציה נאותה לפני 72 שעות`
- 2 → `בדיקת גוונים בנוטיפיקציה רגילה לפני 72 שעות`
- 3 → `בדיקת גוונים בנוטיפיקציה נאותה אחרי 72 שעות`
- 4 → `בדיקת גוונים בנוטיפיקציה רגילה אחרי 72 שעות`

In the matching test only, replace:
- `rama2: '...'` → `rama2: '<value from CSV>'`
- `rama3: '...'` → `rama3: '<value from CSV>'`
- `itemNumber: '...'` → `itemNumber: '<value from CSV>'`

### 3c. Run only the matching test
Run: `npx playwright test Tests/14_shades.spec.js --grep "<test name>" --reporter=json 2>&1`

Parse the JSON output to extract pass/fail.

### 3d. Restore original file content
Write the saved original content back to `Tests/14_shades.spec.js`.

## Step 4: Print summary table in Hebrew

After all rows are processed, print:

```
| rama2 | rama3 | itemNumber | טסט | תוצאה |
|-------|-------|------------|-----|-------|
| ...   | ...   | ...        | ... | ✅/❌  |
```

Use ✅ for pass and ❌ for fail.
