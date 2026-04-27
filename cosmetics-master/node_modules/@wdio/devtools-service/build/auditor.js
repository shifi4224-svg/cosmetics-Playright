"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const diagnostics_1 = __importDefault(require("lighthouse/lighthouse-core/audits/diagnostics"));
const mainthread_work_breakdown_1 = __importDefault(require("lighthouse/lighthouse-core/audits/mainthread-work-breakdown"));
const metrics_1 = __importDefault(require("lighthouse/lighthouse-core/audits/metrics"));
const server_response_time_1 = __importDefault(require("lighthouse/lighthouse-core/audits/server-response-time"));
const cumulative_layout_shift_1 = __importDefault(require("lighthouse/lighthouse-core/audits/metrics/cumulative-layout-shift"));
const first_contentful_paint_1 = __importDefault(require("lighthouse/lighthouse-core/audits/metrics/first-contentful-paint"));
const largest_contentful_paint_1 = __importDefault(require("lighthouse/lighthouse-core/audits/metrics/largest-contentful-paint"));
const speed_index_1 = __importDefault(require("lighthouse/lighthouse-core/audits/metrics/speed-index"));
const interactive_1 = __importDefault(require("lighthouse/lighthouse-core/audits/metrics/interactive"));
const total_blocking_time_1 = __importDefault(require("lighthouse/lighthouse-core/audits/metrics/total-blocking-time"));
const scoring_1 = __importDefault(require("lighthouse/lighthouse-core/scoring"));
const default_config_1 = __importDefault(require("lighthouse/lighthouse-core/config/default-config"));
const logger_1 = __importDefault(require("@wdio/logger"));
const constants_1 = require("./constants");
const log = (0, logger_1.default)('@wdio/devtools-service:Auditor');
class Auditor {
    constructor(_traceLogs, _devtoolsLogs, _formFactor) {
        this._traceLogs = _traceLogs;
        this._devtoolsLogs = _devtoolsLogs;
        this._formFactor = _formFactor;
        if (_traceLogs) {
            this._url = _traceLogs.pageUrl;
        }
    }
    _audit(AUDIT, params = {}) {
        const auditContext = {
            options: {
                ...AUDIT.defaultOptions
            },
            settings: {
                throttlingMethod: 'devtools',
                formFactor: this._formFactor || constants_1.DEFAULT_FORM_FACTOR
            },
            LighthouseRunWarnings: false,
            computedCache: new Map()
        };
        try {
            return AUDIT.audit({
                traces: { defaultPass: this._traceLogs },
                devtoolsLogs: { defaultPass: this._devtoolsLogs },
                TestedAsMobileDevice: true,
                GatherContext: { gatherMode: 'navigation' },
                ...params
            }, auditContext);
        }
        catch (error) {
            log.error(error);
            return {
                score: 0,
                error
            };
        }
    }
    /**
     * an Auditor instance is created for every trace so provide an updateCommands
     * function to receive the latest performance metrics with the browser instance
     */
    updateCommands(browser, customFn) {
        const commands = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(fnName => fnName !== 'constructor' && fnName !== 'updateCommands' && !fnName.startsWith('_'));
        commands.forEach(fnName => browser.addCommand(fnName, customFn || this[fnName].bind(this)));
    }
    /**
     * Returns a list with a breakdown of all main thread task and their total duration
     */
    async getMainThreadWorkBreakdown() {
        const result = await this._audit(mainthread_work_breakdown_1.default);
        return result.details.items.map(({ group, duration }) => ({ group, duration }));
    }
    /**
     * Get some useful diagnostics about the page load
     */
    async getDiagnostics() {
        const result = await this._audit(diagnostics_1.default);
        /**
         * return null if Audit fails
         */
        if (!Object.prototype.hasOwnProperty.call(result, 'details')) {
            return null;
        }
        return result.details.items[0];
    }
    /**
     * Get most common used performance metrics
     */
    async getMetrics() {
        const serverResponseTime = await this._audit(server_response_time_1.default, { URL: this._url });
        const cumulativeLayoutShift = await this._audit(cumulative_layout_shift_1.default);
        const result = await this._audit(metrics_1.default);
        const metrics = result.details.items[0] || {};
        return {
            timeToFirstByte: Math.round(serverResponseTime.numericValue),
            serverResponseTime: Math.round(serverResponseTime.numericValue),
            domContentLoaded: metrics.observedDomContentLoaded,
            firstVisualChange: metrics.observedFirstVisualChange,
            firstPaint: metrics.observedFirstPaint,
            firstContentfulPaint: metrics.firstContentfulPaint,
            firstMeaningfulPaint: metrics.firstMeaningfulPaint,
            largestContentfulPaint: metrics.largestContentfulPaint,
            lastVisualChange: metrics.observedLastVisualChange,
            interactive: metrics.interactive,
            load: metrics.observedLoad,
            speedIndex: metrics.speedIndex,
            totalBlockingTime: metrics.totalBlockingTime,
            maxPotentialFID: metrics.maxPotentialFID,
            cumulativeLayoutShift: cumulativeLayoutShift.numericValue,
        };
    }
    /**
     * Returns the Lighthouse Performance Score which is a weighted mean of the following metrics: firstMeaningfulPaint, interactive, speedIndex
     */
    async getPerformanceScore() {
        const auditResults = {
            'speed-index': await this._audit(speed_index_1.default),
            'first-contentful-paint': await this._audit(first_contentful_paint_1.default),
            'largest-contentful-paint': await this._audit(largest_contentful_paint_1.default),
            'cumulative-layout-shift': await this._audit(cumulative_layout_shift_1.default),
            'total-blocking-time': await this._audit(total_blocking_time_1.default),
            interactive: await this._audit(interactive_1.default)
        };
        if (!auditResults.interactive || !auditResults['cumulative-layout-shift'] || !auditResults['first-contentful-paint'] ||
            !auditResults['largest-contentful-paint'] || !auditResults['speed-index'] || !auditResults['total-blocking-time']) {
            log.info('One or multiple required metrics couldn\'t be found, setting performance score to: null');
            return null;
        }
        const scores = default_config_1.default.categories.performance.auditRefs.filter((auditRef) => auditRef.weight).map((auditRef) => ({
            score: auditResults[auditRef.id].score,
            weight: auditRef.weight,
        }));
        return scoring_1.default.arithmeticMean(scores);
    }
    async _auditPWA(params, auditsToBeRun = Object.keys(constants_1.PWA_AUDITS)) {
        const audits = await Promise.all(Object.entries(constants_1.PWA_AUDITS)
            .filter(([name]) => auditsToBeRun.includes(name))
            .map(async ([name, Audit]) => [name, await this._audit(Audit, params)]));
        return {
            passed: !audits.find(([, result]) => result.score < 1),
            details: audits.reduce((details, [name, result]) => {
                details[name] = result;
                return details;
            }, {})
        };
    }
}
exports.default = Auditor;
