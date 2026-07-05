const fs = require('fs');
const path = require('path');

const BUSINESSES_PATH = path.join(__dirname, 'Data', 'businesses.json');
const TEMPLATE_PATH = path.join(__dirname, 'Data', 'businesses.template.json');

// מפתחות עסק + הפלאג שמעיד שיש להם RP מקושר
const RP_REQUIREMENTS = [
    { businessKey: 'taagid',      rpKey: 'taagid_rp',      usedIn: '08, 09, 10, 20' },
    { businessKey: 'rp_taagid',   rpKey: 'rp_taagid_rp',   usedIn: '03 (תאגיד RP)' },
    { businessKey: 'taagid_naot', rpKey: 'taagid_naot_rp', usedIn: '08 (פריט נאות)' },
];

module.exports = async function globalSetup() {
    // אם businesses.json לא קיים — מעתיק מהתבנית
    if (!fs.existsSync(BUSINESSES_PATH)) {
        if (fs.existsSync(TEMPLATE_PATH)) {
            fs.copyFileSync(TEMPLATE_PATH, BUSINESSES_PATH);
            console.warn('\n⚠️  businesses.json לא נמצא — נוצר מהתבנית. אנא מלא את שמות העסקים שלך.');
        } else {
            console.error('\n❌  לא נמצא businesses.json ולא businesses.template.json!');
        }
        return;
    }

    const data = JSON.parse(fs.readFileSync(BUSINESSES_PATH, 'utf8'));
    let allOk = true;

    console.log('\n🔍  בדיקת תנאי מוקדמים — נציגים אחראיים מקושרים לעסקים:');

    for (const req of RP_REQUIREMENTS) {
        const businessName = data[req.businessKey] || '(לא הוגדר)';
        const hasRP = data[req.rpKey] === true;

        if (!data[req.businessKey]) {
            console.warn(`  ⚠️  [${req.businessKey}] שם עסק ריק — הרץ תחילה טסטי הקמת עסק`);
            allOk = false;
        } else if (!hasRP) {
            console.warn(`  ⚠️  [${req.businessKey}] "${businessName}" — אין נציג אחראי מקושר`);
            console.warn(`       טסטים שישפיעו: ${req.usedIn}`);
            console.warn(`       כדי לתקן: הרץ את טסט 03_rp-registration`);
            allOk = false;
        } else {
            console.log(`  ✅  [${req.businessKey}] "${businessName}" — יש נציג אחראי`);
        }
    }

    if (!allOk) {
        console.warn('\n⚠️  חלק מהטסטים עלולים להיכשל עקב העדר נציג אחראי מקושר.\n');
    } else {
        console.log('\n✅  כל תנאי המוקדמים תקינים.\n');
    }
};
