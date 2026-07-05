const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  globalSetup: require.resolve('./global-setup'),
  // מגדיר כמה זמן (באלפיות שנייה) לכל טסט לרוץ לפני שהוא נכשל על טיימאאוט
  timeout: 60000,
  testDir: './Tests',
  use: {
    // headless: false פותח את הדפדפן הפיזי כדי שתוכלי לראות את ההרצה
    headless: false,

    // שומר צילום מסך אם הטסט נכשל
    screenshot: 'only-on-failure',

    // פותח את הדפדפן בגודל מסך מלא
    viewport: null,
    launchOptions: {
      args: ['--start-maximized', '--auto-open-devtools-for-tabs', '--force-device-scale-factor=0.7'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
      testMatch: [
        '**/01_combined-flow.spec.js',
        '**/02_dealer-registration.spec.js',
        '**/03_rp-registration.spec.js',
        '**/04_change-activity-business.spec.js',
        '**/05_proper-production.spec.js',
        '**/06_edit-business-details.spec.js',
        '**/07_supervised-employee.spec.js',
        '**/08_regulation-item.spec.js',
        '**/09_regulation-notification.spec.js',
        '**/10_notification-files.spec.js',
        '**/11_proper-notification.spec.js',
        '**/12_items.spec.js',
        '**/13_after72h.spec.js',
        '**/14_tipulit-dealer.spec.js',
        '**/15_shades.spec.js',
        '**/16_general-request.spec.js',
        '**/17_cancel-notification.spec.js',
        '**/18_update-proper-importer.spec.js',
        '**/19_side-effect.spec.js',
        '**/20_missing-scenarios.spec.js',
        '**/21_tipulit-sync.spec.js',
      ]
    }
  ]
});