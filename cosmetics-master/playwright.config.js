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
        'dealer-registration.spec.js',
        'rp-registration.spec.js',
        'proper-production.spec.js',
        'update-proper-importer.spec.js',
        'business-details.spec.js',
        'edit-business-details.spec.js',
        'supervised-employee.spec.js',
        'items.spec.js',
        'regulation-item.spec.js',
        'proper-notification.spec.js',
        'regulation-notification.spec.js',
      ]
    }
  ]
});