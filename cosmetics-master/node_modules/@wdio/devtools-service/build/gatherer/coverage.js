"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
const core_1 = require("@babel/core");
const babel_plugin_istanbul_1 = __importDefault(require("babel-plugin-istanbul"));
const istanbul_lib_coverage_1 = __importDefault(require("istanbul-lib-coverage"));
const istanbul_lib_report_1 = __importDefault(require("istanbul-lib-report"));
const istanbul_reports_1 = __importDefault(require("istanbul-reports"));
const logger_1 = __importDefault(require("@wdio/logger"));
const log = (0, logger_1.default)('@wdio/devtools-service:CoverageGatherer');
const MAX_WAIT_RETRIES = 10;
const CAPTURE_INTERVAL = 1000;
const DEFAULT_REPORT_TYPE = 'json';
const DEFAULT_REPORT_DIR = path_1.default.join(process.cwd(), 'coverage');
class CoverageGatherer extends events_1.EventEmitter {
    constructor(_page, _options) {
        super();
        this._page = _page;
        this._options = _options;
        this._coverageLogDir = path_1.default.resolve(process.cwd(), this._options.logDir || DEFAULT_REPORT_DIR);
        this._page.on('load', this._captureCoverage.bind(this));
    }
    async init() {
        this._client = await this._page.target().createCDPSession();
        await this._client.send('Fetch.enable', {
            patterns: [{ requestStage: 'Response' }]
        });
        this._client.on('Fetch.requestPaused', this._handleRequests.bind(this));
    }
    async _handleRequests(event) {
        const { requestId, request, responseStatusCode = 200 } = event;
        if (!this._client) {
            return;
        }
        /**
         * continue with requests that aren't JS files
         */
        let skipCoverageFlag = false;
        if (!request.url.endsWith('.js')) {
            skipCoverageFlag = true;
        }
        /**
         * continue with requests that are part of exclude patterns
         */
        if (this._options.exclude) {
            for (const excludeFile of this._options.exclude) {
                if (request.url.match(excludeFile)) {
                    skipCoverageFlag = true;
                    break;
                }
            }
        }
        if (skipCoverageFlag) {
            return this._client.send('Fetch.continueRequest', { requestId }).catch(/* istanbul ignore next */ (err) => log.debug(err.message));
        }
        /**
         * fetch original response
         */
        const { body, base64Encoded } = await this._client.send('Fetch.getResponseBody', { requestId });
        const inputCode = base64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
        const url = new URL(request.url);
        const fullPath = path_1.default.join(this._coverageLogDir, 'files', url.hostname, url.pathname);
        const dirPath = path_1.default.dirname(fullPath);
        /**
         * create dir if not existing
         */
        if (!fs_1.default.existsSync(dirPath)) {
            await fs_1.default.promises.mkdir(dirPath, { recursive: true });
        }
        await fs_1.default.promises.writeFile(fullPath, inputCode, 'utf-8');
        try {
            const result = await (0, core_1.transformAsync)(inputCode, {
                auxiliaryCommentBefore: ' istanbul ignore next ',
                babelrc: false,
                caller: {
                    name: '@wdio/devtools-service'
                },
                configFile: false,
                filename: path_1.default.join(url.hostname, url.pathname),
                plugins: [
                    [
                        babel_plugin_istanbul_1.default,
                        {
                            compact: false,
                            exclude: [],
                            extension: false,
                            useInlineSourceMaps: false,
                        },
                    ],
                ],
                sourceMaps: false
            });
            return this._client.send('Fetch.fulfillRequest', {
                requestId,
                responseCode: responseStatusCode,
                /** do not mock body if it's undefined */
                body: !result ? undefined : Buffer.from(result.code, 'utf8').toString('base64')
            });
        }
        catch (err) {
            log.warn(`Couldn't instrument file due to: ${err.stack}`);
            return this._client.send('Fetch.fulfillRequest', {
                requestId,
                responseCode: responseStatusCode,
                body: inputCode
            });
        }
    }
    _clearCaptureInterval() {
        if (!this._captureInterval) {
            return;
        }
        clearInterval(this._captureInterval);
        delete this._captureInterval;
    }
    _captureCoverage() {
        if (this._captureInterval) {
            this._clearCaptureInterval();
        }
        this._captureInterval = setInterval(async () => {
            log.info('capturing coverage data');
            try {
                const globalCoverageVar = await this._page.evaluate(
                /* istanbul ignore next */
                () => window['__coverage__']);
                this._coverageMap = istanbul_lib_coverage_1.default.createCoverageMap(globalCoverageVar);
                log.info(`Captured coverage data of ${this._coverageMap.files().length} files`);
            }
            catch (err) {
                log.warn(`Couldn't capture data: ${err.message}`);
                this._clearCaptureInterval();
            }
        }, CAPTURE_INTERVAL);
    }
    async _getCoverageMap(retries = 0) {
        /* istanbul ignore if */
        if (retries > MAX_WAIT_RETRIES) {
            return Promise.reject(new Error('Couldn\'t capture coverage data for page'));
        }
        if (!this._coverageMap) {
            log.info('No coverage data collected, waiting...');
            await new Promise((resolve) => setTimeout(resolve, CAPTURE_INTERVAL));
            return this._getCoverageMap(++retries);
        }
        return this._coverageMap;
    }
    async logCoverage() {
        this._clearCaptureInterval();
        // create a context for report generation
        const coverageMap = await this._getCoverageMap();
        const context = istanbul_lib_report_1.default.createContext({
            dir: this._coverageLogDir,
            // The summarizer to default to (may be overridden by some reports)
            // values can be nested/flat/pkg. Defaults to 'pkg'
            defaultSummarizer: 'nested',
            coverageMap,
            sourceFinder: (source) => {
                const f = fs_1.default.readFileSync(path_1.default.join(this._coverageLogDir, 'files', source.replace(process.cwd(), '')));
                return f.toString('utf8');
            }
        });
        // create an instance of the relevant report class, passing the
        // report name e.g. json/html/html-spa/text
        const report = istanbul_reports_1.default.create(this._options.type || DEFAULT_REPORT_TYPE, this._options.options);
        // call execute to synchronously create and write the report to disk
        // @ts-ignore
        report.execute(context);
    }
    async getCoverageReport() {
        const files = {};
        const coverageMap = await this._getCoverageMap();
        const summary = istanbul_lib_coverage_1.default.createCoverageSummary();
        for (const f of coverageMap.files()) {
            const fc = coverageMap.fileCoverageFor(f);
            const s = fc.toSummary();
            files[f] = s;
            summary.merge(s);
        }
        return {
            ...summary.data,
            files: Object.entries(files).reduce((obj, [filename, { data }]) => {
                obj[filename.replace(process.cwd(), '')] = data;
                return obj;
            }, {})
        };
    }
}
exports.default = CoverageGatherer;
