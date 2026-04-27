"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLighthouseDriver = exports.isBrowserSupported = exports.getBrowserMajorVersion = exports.isBrowserVersionLower = exports.isSupportedUrl = exports.sumByKey = exports.setUnsupportedCommand = void 0;
const driver_1 = __importDefault(require("lighthouse/lighthouse-core/gather/driver"));
const cri_1 = __importDefault(require("./lighthouse/cri"));
const constants_1 = require("./constants");
const VERSION_PROPS = ['browserVersion', 'browser_version', 'version'];
const SUPPORTED_BROWSERS_AND_MIN_VERSIONS = {
    'chrome': 63,
    'chromium': 63,
    'googlechrome': 63,
    'google chrome': 63,
    'firefox': 86
};
const CUSTOM_COMMANDS = [
    'cdp',
    'getNodeId',
    'getMetrics',
    'startTracing',
    'getDiagnostics',
    'getCoverageReport',
    'enablePerformanceAudits',
    'disablePerformanceAudits',
    'getMainThreadWorkBreakdown',
    'emulateDevice',
    'checkPWA'
];
function setUnsupportedCommand(browser) {
    for (const command of CUSTOM_COMMANDS) {
        browser.addCommand(command, /* istanbul ignore next */ () => {
            throw new Error(constants_1.UNSUPPORTED_ERROR_MESSAGE);
        });
    }
}
exports.setUnsupportedCommand = setUnsupportedCommand;
/**
 * Create a sum of a specific key from a list of objects
 * @param list list of key/value objects
 * @param key  key of value to be summed up
 */
function sumByKey(list, key) {
    return list.map((data) => data[key]).reduce((acc, val) => acc + val, 0);
}
exports.sumByKey = sumByKey;
/**
 * check if url is supported for tracing
 * @param  {String}  url to check for
 * @return {Boolean}     true if url was opened by user
 */
function isSupportedUrl(url) {
    return constants_1.IGNORED_URLS.filter((ignoredUrl) => url.startsWith(ignoredUrl)).length === 0;
}
exports.isSupportedUrl = isSupportedUrl;
/**
 * check if browser version is lower than `minVersion`
 * @param {object} caps capabilities
 * @param {number} minVersion minimal chrome browser version
 */
function isBrowserVersionLower(caps, minVersion) {
    const versionProp = VERSION_PROPS.find((prop) => caps[prop]);
    const browserVersion = getBrowserMajorVersion(caps[versionProp]);
    return typeof browserVersion === 'number' && browserVersion < minVersion;
}
exports.isBrowserVersionLower = isBrowserVersionLower;
/**
 * get chromedriver major version
 * @param   {string|*}      version chromedriver version like `78.0.3904.11` or just `78`
 * @return  {number|*}              either major version, ex `78`, or whatever value is passed
 */
function getBrowserMajorVersion(version) {
    if (typeof version === 'string') {
        const majorVersion = Number(version.split('.')[0]);
        return isNaN(majorVersion) ? parseInt(version, 10) : majorVersion;
    }
    return version;
}
exports.getBrowserMajorVersion = getBrowserMajorVersion;
/**
 * check if browser is supported based on caps.browserName and caps.version
 * @param {object} caps capabilities
 */
function isBrowserSupported(caps) {
    if (!caps.browserName ||
        !(caps.browserName.toLowerCase() in SUPPORTED_BROWSERS_AND_MIN_VERSIONS) ||
        isBrowserVersionLower(caps, SUPPORTED_BROWSERS_AND_MIN_VERSIONS[caps.browserName.toLowerCase()])) {
        return false;
    }
    return true;
}
exports.isBrowserSupported = isBrowserSupported;
/**
 * Either request the page list directly from the browser or if Selenium
 * or Selenoid is used connect to a target manually
 */
async function getLighthouseDriver(session, target) {
    const connection = session.connection();
    if (!connection) {
        throw new Error('Couldn\'t find a CDP connection');
    }
    const cUrl = new URL(connection.url());
    const cdpConnection = new cri_1.default(cUrl.port, cUrl.hostname);
    /**
     * only create a new DevTools session if our WebSocket url doesn't already indicate
     * that we are using one
     */
    if (!cUrl.pathname.startsWith('/devtools/browser')) {
        await cdpConnection._connectToSocket({
            webSocketDebuggerUrl: connection.url(),
            id: target._targetId
        });
        const { sessionId } = await cdpConnection.sendCommand('Target.attachToTarget', undefined, { targetId: target._targetId, flatten: true });
        cdpConnection.setSessionId(sessionId);
        return new driver_1.default(cdpConnection);
    }
    const list = await cdpConnection._runJsonCommand('list');
    await cdpConnection._connectToSocket(list[0]);
    return new driver_1.default(cdpConnection);
}
exports.getLighthouseDriver = getLighthouseDriver;
