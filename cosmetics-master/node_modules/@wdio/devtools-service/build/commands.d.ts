import 'core-js/modules/web.url';
import type { Browser, MultiRemoteBrowser } from 'webdriverio';
import type { TraceEvent } from '@tracerbench/trace-event';
import type { CDPSession } from 'puppeteer-core/lib/cjs/puppeteer/common/Connection';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import type { TracingOptions } from 'puppeteer-core/lib/cjs/puppeteer/common/Tracing';
import { RequestPayload } from './handler/network';
export default class CommandHandler {
    private _session;
    private _page;
    private _isTracing;
    private _networkHandler;
    private _traceEvents?;
    constructor(_session: CDPSession, _page: Page, browser: Browser<'async'> | MultiRemoteBrowser<'async'>);
    /**
     * The cdp command is a custom command added to the browser scope that allows you
     * to call directly commands to the protocol.
     */
    cdp(domain: string, command: string, args?: {}): Promise<any>;
    /**
     * Helper method to get the nodeId of an element in the page.
     * NodeIds are similar like WebDriver node ids an identifier for a node.
     * It can be used as a parameter for other Chrome DevTools methods, e.g. DOM.focus.
     */
    getNodeId(selector: string): Promise<number>;
    /**
     * Helper method to get the nodeId of an element in the page.
     * NodeIds are similar like WebDriver node ids an identifier for a node.
     * It can be used as a parameter for other Chrome DevTools methods, e.g. DOM.focus.
     */
    getNodeIds(selector: string): Promise<number[]>;
    /**
     * Start tracing the browser. You can optionally pass in custom tracing categories and the
     * sampling frequency.
     */
    startTracing({ categories, path, screenshots }?: TracingOptions): Promise<void>;
    /**
     * Stop tracing the browser.
     */
    endTracing(): Promise<TraceEvent[] | undefined>;
    /**
     * Returns the tracelogs that was captured within the tracing period.
     * You can use this command to store the trace logs on the file system to analyse the trace
     * via Chrome DevTools interface.
     */
    getTraceLogs(): TraceEvent[] | undefined;
    /**
     * Returns page weight information of the last page load.
     */
    getPageWeight(): {
        pageWeight: number;
        transferred: number;
        requestCount: number;
        details: {
            Document?: RequestPayload | undefined;
            Stylesheet?: RequestPayload | undefined;
            Image?: RequestPayload | undefined;
            Media?: RequestPayload | undefined;
            Font?: RequestPayload | undefined;
            Script?: RequestPayload | undefined;
            TextTrack?: RequestPayload | undefined;
            XHR?: RequestPayload | undefined;
            Fetch?: RequestPayload | undefined;
            Prefetch?: RequestPayload | undefined;
            EventSource?: RequestPayload | undefined;
            WebSocket?: RequestPayload | undefined;
            Manifest?: RequestPayload | undefined;
            SignedExchange?: RequestPayload | undefined;
            Ping?: RequestPayload | undefined;
            CSPViolationReport?: RequestPayload | undefined;
            Preflight?: RequestPayload | undefined;
            Other?: RequestPayload | undefined;
        };
    };
}
//# sourceMappingURL=commands.d.ts.map