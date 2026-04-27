/// <reference types="node" />
import { EventEmitter } from 'events';
import type Protocol from 'devtools-protocol';
import type { TraceEvent } from '@tracerbench/trace-event';
import type { HTTPRequest } from 'puppeteer-core/lib/cjs/puppeteer/common/HTTPRequest';
import type { CDPSession } from 'puppeteer-core/lib/cjs/puppeteer/common/Connection';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import type { GathererDriver } from '../types';
export interface Trace {
    traceEvents: TraceEvent[];
    frameId?: string;
    loaderId?: string;
    pageUrl?: string;
    traceStart?: number;
    traceEnd?: number;
}
export interface WaitPromise {
    promise: Promise<any>;
    cancel: Function;
}
export default class TraceGatherer extends EventEmitter {
    private _session;
    private _page;
    private _driver;
    private _failingFrameLoadIds;
    private _pageLoadDetected;
    private _networkListeners;
    private _frameId?;
    private _loaderId?;
    private _pageUrl?;
    private _networkStatusMonitor;
    private _networkMonitor;
    private _protocolSession;
    private _trace?;
    private _traceStart?;
    private _clickTraceTimeout?;
    private _waitConditionPromises;
    constructor(_session: CDPSession, _page: Page, _driver: GathererDriver);
    startTracing(url: string): Promise<void>;
    /**
     * store frame id of frames that are being traced
     */
    onFrameNavigated(msgObj: Protocol.Page.FrameNavigatedEvent): Promise<void>;
    /**
     * once the page load event has fired, we can grab some performance
     * metrics and timing
     */
    onLoadEventFired(): Promise<void>;
    onFrameLoadFail(request: HTTPRequest): void;
    get isTracing(): boolean;
    /**
     * once tracing has finished capture trace logs into memory
     */
    completeTracing(): Promise<void>;
    /**
     * clear tracing states and emit tracingFinished
     */
    finishTracing(): void;
    waitForMaxTimeout(maxWaitForLoadedMs?: number): Promise<() => Promise<void>>;
}
//# sourceMappingURL=trace.d.ts.map