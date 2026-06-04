const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  // מגדיר כמה זמן (באלפיות שנייה) לכל טסט לרוץ לפני שהוא נכשל על טיימאאוט
  timeout: 60000,
  testDir: './Tests',
  use: {
    // headless: false פותח את הדפדפן הפיזי כדי שתוכלי לראות את ההרצה
    headless: false,

    // שומר צילום מסך אם הטסט נכשל
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
      testMatch: [
        '01_combined-flow.spec.js',
        '**/02_dealer-registration.spec.js',
        '**/03_rp-registration.spec.js',
        '**/04_change-activity-business.spec.js',
        '**/05_proper-production.spec.js',
        '**/06_edit-business-details.spec.js',
        '**/07_supervised-employee.spec.js',
        '**/08_regulation-item.spec.js',
        '**/09_regulation-notification.spec.js',
        '**/10_proper-notification.spec.js',
        '**/11_items.spec.js',
      ]
    }
  ]
});