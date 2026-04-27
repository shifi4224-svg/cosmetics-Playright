/// <reference types="node" />
import { EventEmitter } from 'events';
import libCoverage from 'istanbul-lib-coverage';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import type { CoverageReporterOptions, Coverage } from '../types';
export default class CoverageGatherer extends EventEmitter {
    private _page;
    private _options;
    private _coverageLogDir;
    private _coverageMap?;
    private _captureInterval?;
    private _client?;
    constructor(_page: Page, _options: CoverageReporterOptions);
    init(): Promise<void>;
    private _handleRequests;
    private _clearCaptureInterval;
    private _captureCoverage;
    _getCoverageMap(retries?: number): Promise<libCoverage.CoverageMap>;
    logCoverage(): Promise<void>;
    getCoverageReport(): Promise<Coverage | null>;
}
//# sourceMappingURL=coverage.d.ts.map