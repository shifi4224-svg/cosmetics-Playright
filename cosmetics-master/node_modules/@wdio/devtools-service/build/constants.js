"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PWA_AUDITS = exports.NETWORK_RECORDER_EVENTS = exports.DEFAULT_THROTTLE_STATE = exports.CLICK_TRANSITION = exports.NETWORK_STATES = exports.UNSUPPORTED_ERROR_MESSAGE = exports.DEFAULT_FORM_FACTOR = exports.DEFAULT_NETWORK_THROTTLING_STATE = exports.MAX_TRACE_WAIT_TIME = exports.TRACING_TIMEOUT = exports.FRAME_LOAD_START_TIMEOUT = exports.IGNORED_URLS = exports.DEFAULT_TRACING_CATEGORIES = void 0;
const installable_manifest_1 = __importDefault(require("lighthouse/lighthouse-core/audits/installable-manifest"));
const service_worker_1 = __importDefault(require("lighthouse/lighthouse-core/audits/service-worker"));
const splash_screen_1 = __importDefault(require("lighthouse/lighthouse-core/audits/splash-screen"));
const themed_omnibox_1 = __importDefault(require("lighthouse/lighthouse-core/audits/themed-omnibox"));
const content_width_1 = __importDefault(require("lighthouse/lighthouse-core/audits/content-width"));
const viewport_1 = __importDefault(require("lighthouse/lighthouse-core/audits/viewport"));
const apple_touch_icon_1 = __importDefault(require("lighthouse/lighthouse-core/audits/apple-touch-icon"));
const maskable_icon_1 = __importDefault(require("lighthouse/lighthouse-core/audits/maskable-icon"));
const constants_1 = require("lighthouse/lighthouse-core/config/constants");
/**
 * performance tracing categories
 */
exports.DEFAULT_TRACING_CATEGORIES = [
    // Exclude default categories. We'll be selective to minimize trace size
    '-*',
    // Used instead of 'toplevel' in Chrome 71+
    'disabled-by-default-lighthouse',
    // Used for Cumulative Layout Shift metric
    'loading',
    // All compile/execute events are captured by parent events in devtools.timeline..
    // But the v8 category provides some nice context for only <0.5% of the trace size
    'v8',
    // Same situation here. This category is there for RunMicrotasks only, but with other teams
    // accidentally excluding microtasks, we don't want to assume a parent event will always exist
    'v8.execute',
    // For extracting UserTiming marks/measures
    'blink.user_timing',
    // Not mandatory but not used much
    'blink.console',
    // Most of the events we need are from these two categories
    'devtools.timeline',
    'disabled-by-default-devtools.timeline',
    // Up to 450 (https://goo.gl/rBfhn4) JPGs added to the trace
    'disabled-by-default-devtools.screenshot',
    // This doesn't add its own events, but adds a `stackTrace` property to devtools.timeline events
    'disabled-by-default-devtools.timeline.stack',
    // Additional categories used by devtools. Not used by Lighthouse, but included to facilitate
    // loading traces from Lighthouse into the Performance panel.
    'disabled-by-default-devtools.timeline.frame',
    'latencyInfo',
    // CPU sampling profiler data only enabled for debugging purposes
    // 'disabled-by-default-v8.cpu_profiler',
    // 'disabled-by-default-v8.cpu_profiler.hires',
];
/**
 * ignored urls in request logger
 */
exports.IGNORED_URLS = [
    'data:,',
    'about:',
    'chrome-extension://' // all chrome extensions
];
exports.FRAME_LOAD_START_TIMEOUT = 2000;
exports.TRACING_TIMEOUT = 15000;
exports.MAX_TRACE_WAIT_TIME = 45000;
exports.DEFAULT_NETWORK_THROTTLING_STATE = 'online';
exports.DEFAULT_FORM_FACTOR = 'desktop';
exports.UNSUPPORTED_ERROR_MESSAGE = ('The @wdio/devtools-service currently only supports Chrome version 63 and up, ' +
    'Firefox 86 and up, and Chromium as the browserName!\n\n' +
    'Given that cloud vendors don\'t expose access to the Chrome DevTools Protocol ' +
    'this service also usually only works when running tests locally or through a ' +
    'Selenium Grid (https://www.selenium.dev/documentation/grid/) v4 or higher.');
exports.NETWORK_STATES = {
    offline: {
        offline: true,
        latency: 0,
        downloadThroughput: 0,
        uploadThroughput: 0
    },
    GPRS: {
        offline: false,
        downloadThroughput: 50 * 1024 / 8,
        uploadThroughput: 20 * 1024 / 8,
        latency: 500
    },
    'Regular 2G': {
        offline: false,
        downloadThroughput: 250 * 1024 / 8,
        uploadThroughput: 50 * 1024 / 8,
        latency: 300
    },
    'Good 2G': {
        offline: false,
        downloadThroughput: 450 * 1024 / 8,
        uploadThroughput: 150 * 1024 / 8,
        latency: 150
    },
    'Regular 3G': {
        offline: false,
        latency: constants_1.throttling.mobileRegular3G.requestLatencyMs,
        // DevTools expects throughput in bytes per second rather than kbps
        downloadThroughput: Math.floor(constants_1.throttling.mobileRegular3G.downloadThroughputKbps * 1024 / 8),
        uploadThroughput: Math.floor(constants_1.throttling.mobileRegular3G.uploadThroughputKbps * 1024 / 8)
    },
    'Good 3G': {
        offline: false,
        latency: constants_1.throttling.mobileSlow4G.requestLatencyMs,
        // DevTools expects throughput in bytes per second rather than kbps
        downloadThroughput: Math.floor(constants_1.throttling.mobileSlow4G.downloadThroughputKbps * 1024 / 8),
        uploadThroughput: Math.floor(constants_1.throttling.mobileSlow4G.uploadThroughputKbps * 1024 / 8)
    },
    'Regular 4G': {
        offline: false,
        downloadThroughput: 4 * 1024 * 1024 / 8,
        uploadThroughput: 3 * 1024 * 1024 / 8,
        latency: 20
    },
    'DSL': {
        offline: false,
        downloadThroughput: 2 * 1024 * 1024 / 8,
        uploadThroughput: 1 * 1024 * 1024 / 8,
        latency: 5
    },
    'Wifi': {
        offline: false,
        downloadThroughput: 30 * 1024 * 1024 / 8,
        uploadThroughput: 15 * 1024 * 1024 / 8,
        latency: 2
    },
    online: {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1
    }
};
exports.CLICK_TRANSITION = 'click transition';
exports.DEFAULT_THROTTLE_STATE = {
    networkThrottling: exports.DEFAULT_NETWORK_THROTTLING_STATE,
    cpuThrottling: 0,
    cacheEnabled: false,
    formFactor: exports.DEFAULT_FORM_FACTOR
};
exports.NETWORK_RECORDER_EVENTS = [
    'Network.requestWillBeSent',
    'Network.requestServedFromCache',
    'Network.responseReceived',
    'Network.dataReceived',
    'Network.loadingFinished',
    'Network.loadingFailed',
    'Network.resourceChangedPriority'
];
exports.PWA_AUDITS = {
    isInstallable: installable_manifest_1.default,
    serviceWorker: service_worker_1.default,
    splashScreen: splash_screen_1.default,
    themedOmnibox: themed_omnibox_1.default,
    contentWith: content_width_1.default,
    viewport: viewport_1.default,
    appleTouchIcon: apple_touch_icon_1.default,
    maskableIcon: maskable_icon_1.default
};
