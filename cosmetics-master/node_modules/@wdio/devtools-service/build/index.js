"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@wdio/logger"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const commands_1 = __importDefault(require("./commands"));
const auditor_1 = __importDefault(require("./auditor"));
const pwa_1 = __importDefault(require("./gatherer/pwa"));
const trace_1 = __importDefault(require("./gatherer/trace"));
const coverage_1 = __importDefault(require("./gatherer/coverage"));
const devtools_1 = __importDefault(require("./gatherer/devtools"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const log = (0, logger_1.default)('@wdio/devtools-service');
const TRACE_COMMANDS = ['click', 'navigateTo', 'url'];
class DevToolsService {
    constructor(_options) {
        this._options = _options;
        this._isSupported = false;
        this._shouldRunPerformanceAudits = false;
        this._page = null;
    }
    beforeSession(_, caps) {
        if (!(0, utils_1.isBrowserSupported)(caps)) {
            return log.error(constants_1.UNSUPPORTED_ERROR_MESSAGE);
        }
        this._isSupported = true;
    }
    before(caps, specs, browser) {
        this._browser = browser;
        this._isSupported = this._isSupported || Boolean(this._browser.puppeteer);
        return this._setupHandler();
    }
    async onReload() {
        if (!this._browser) {
            return;
        }
        return this._setupHandler();
    }
    async beforeCommand(commandName, params) {
        const isCommandNavigation = ['url', 'navigateTo'].some(cmdName => cmdName === commandName);
        if (!this._shouldRunPerformanceAudits || !this._traceGatherer || this._traceGatherer.isTracing || !TRACE_COMMANDS.includes(commandName)) {
            return;
        }
        /**
         * set browser profile
         */
        this._setThrottlingProfile(this._networkThrottling, this._cpuThrottling, this._cacheEnabled);
        const url = isCommandNavigation
            ? params[0]
            : constants_1.CLICK_TRANSITION;
        return this._traceGatherer.startTracing(url);
    }
    async afterCommand(commandName) {
        if (!this._traceGatherer || !this._traceGatherer.isTracing || !TRACE_COMMANDS.includes(commandName)) {
            return;
        }
        /**
         * update custom commands once tracing finishes
         */
        this._traceGatherer.once('tracingComplete', (traceEvents) => {
            var _a;
            const auditor = new auditor_1.default(traceEvents, (_a = this._devtoolsGatherer) === null || _a === void 0 ? void 0 : _a.getLogs(), this._formFactor);
            auditor.updateCommands(this._browser);
        });
        this._traceGatherer.once('tracingError', (err) => {
            const auditor = new auditor_1.default();
            auditor.updateCommands(this._browser, /* istanbul ignore next */ () => {
                throw new Error(`Couldn't capture performance due to: ${err.message}`);
            });
        });
        return new Promise((resolve) => {
            var _a;
            log.info(`Wait until tracing for command ${commandName} finishes`);
            /**
             * wait until tracing stops
             */
            (_a = this._traceGatherer) === null || _a === void 0 ? void 0 : _a.once('tracingFinished', async () => {
                log.info('Disable throttling');
                await this._setThrottlingProfile('online', 0, true);
                log.info('continuing with next WebDriver command');
                resolve();
            });
        });
    }
    async after() {
        if (this._coverageGatherer) {
            await this._coverageGatherer.logCoverage();
        }
    }
    /**
     * set flag to run performance audits for page transitions
     */
    _enablePerformanceAudits({ networkThrottling, cpuThrottling, cacheEnabled, formFactor } = constants_1.DEFAULT_THROTTLE_STATE) {
        if (!constants_1.NETWORK_STATES[networkThrottling]) {
            throw new Error(`Network throttling profile "${networkThrottling}" is unknown, choose between ${Object.keys(constants_1.NETWORK_STATES).join(', ')}`);
        }
        if (typeof cpuThrottling !== 'number') {
            throw new Error(`CPU throttling rate needs to be typeof number but was "${typeof cpuThrottling}"`);
        }
        this._networkThrottling = networkThrottling;
        this._cpuThrottling = cpuThrottling;
        this._cacheEnabled = Boolean(cacheEnabled);
        this._formFactor = formFactor;
        this._shouldRunPerformanceAudits = true;
    }
    /**
     * custom command to disable performance audits
     */
    _disablePerformanceAudits() {
        this._shouldRunPerformanceAudits = false;
    }
    /**
     * set device emulation
     */
    async _emulateDevice(device, inLandscape) {
        if (!this._page) {
            throw new Error('No page has been captured yet');
        }
        if (typeof device === 'string') {
            const deviceName = device + (inLandscape ? ' landscape' : '');
            const deviceCapabilities = puppeteer_core_1.default.devices[deviceName];
            if (!deviceCapabilities) {
                const deviceNames = Object.values(puppeteer_core_1.default.devices)
                    .map((device) => device.name)
                    .filter((device) => !device.endsWith('landscape'));
                throw new Error(`Unknown device, available options: ${deviceNames.join(', ')}`);
            }
            return this._page.emulate(deviceCapabilities);
        }
        return this._page.emulate(device);
    }
    /**
     * helper method to set throttling profile
     */
    async _setThrottlingProfile(networkThrottling = constants_1.DEFAULT_THROTTLE_STATE.networkThrottling, cpuThrottling = constants_1.DEFAULT_THROTTLE_STATE.cpuThrottling, cacheEnabled = constants_1.DEFAULT_THROTTLE_STATE.cacheEnabled) {
        if (!this._page || !this._session) {
            throw new Error('No page or session has been captured yet');
        }
        await this._page.setCacheEnabled(Boolean(cacheEnabled));
        await this._session.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottling });
        await this._session.send('Network.emulateNetworkConditions', constants_1.NETWORK_STATES[networkThrottling]);
    }
    async _checkPWA(auditsToBeRun) {
        const auditor = new auditor_1.default();
        const artifacts = await this._pwaGatherer.gatherData();
        return auditor._auditPWA(artifacts, auditsToBeRun);
    }
    _getCoverageReport() {
        return this._coverageGatherer.getCoverageReport();
    }
    async _setupHandler() {
        var _a;
        if (!this._isSupported || !this._browser) {
            return (0, utils_1.setUnsupportedCommand)(this._browser);
        }
        /**
         * casting is required as types differ between core and definitely typed types
         */
        this._puppeteer = await this._browser.getPuppeteer();
        /* istanbul ignore next */
        if (!this._puppeteer) {
            throw new Error('Could not initiate Puppeteer instance');
        }
        this._target = await this._puppeteer.waitForTarget(
        /* istanbul ignore next */
        (t) => t.type() === 'page' || t['_targetInfo'].browserContextId);
        /* istanbul ignore next */
        if (!this._target) {
            throw new Error('No page target found');
        }
        this._page = await this._target.page();
        /* istanbul ignore next */
        if (!this._page) {
            throw new Error('No page found');
        }
        this._session = await this._target.createCDPSession();
        this._driver = await (0, utils_1.getLighthouseDriver)(this._session, this._target);
        new commands_1.default(this._session, this._page, this._browser);
        this._traceGatherer = new trace_1.default(this._session, this._page, this._driver);
        this._session.on('Page.loadEventFired', this._traceGatherer.onLoadEventFired.bind(this._traceGatherer));
        this._session.on('Page.frameNavigated', this._traceGatherer.onFrameNavigated.bind(this._traceGatherer));
        this._page.on('requestfailed', this._traceGatherer.onFrameLoadFail.bind(this._traceGatherer));
        /**
         * enable domains for client
         */
        await Promise.all(['Page', 'Network', 'Runtime'].map((domain) => {
            var _a;
            return Promise.all([
                (_a = this._session) === null || _a === void 0 ? void 0 : _a.send(`${domain}.enable`)
            ]);
        }));
        /**
         * register coverage gatherer if options is set by user
         */
        if ((_a = this._options.coverageReporter) === null || _a === void 0 ? void 0 : _a.enable) {
            this._coverageGatherer = new coverage_1.default(this._page, this._options.coverageReporter);
            this._browser.addCommand('getCoverageReport', this._getCoverageReport.bind(this));
            await this._coverageGatherer.init();
        }
        this._devtoolsGatherer = new devtools_1.default();
        this._puppeteer['_connection']._transport._ws.addEventListener('message', (event) => {
            var _a;
            const data = JSON.parse(event.data);
            (_a = this._devtoolsGatherer) === null || _a === void 0 ? void 0 : _a.onMessage(data);
            const method = data.method || 'event';
            log.debug(`cdp event: ${method} with params ${JSON.stringify(data.params)}`);
            if (this._browser) {
                this._browser.emit(method, data.params);
            }
        });
        this._browser.addCommand('enablePerformanceAudits', this._enablePerformanceAudits.bind(this));
        this._browser.addCommand('disablePerformanceAudits', this._disablePerformanceAudits.bind(this));
        this._browser.addCommand('emulateDevice', this._emulateDevice.bind(this));
        this._pwaGatherer = new pwa_1.default(this._session, this._page, this._driver);
        this._browser.addCommand('checkPWA', this._checkPWA.bind(this));
    }
}
exports.default = DevToolsService;
__exportStar(require("./types"), exports);
