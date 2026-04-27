"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/modules/web.url");
const logger_1 = __importDefault(require("@wdio/logger"));
const network_1 = __importDefault(require("./handler/network"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const log = (0, logger_1.default)('@wdio/devtools-service:CommandHandler');
class CommandHandler {
    constructor(_session, _page, browser) {
        this._session = _session;
        this._page = _page;
        this._isTracing = false;
        this._networkHandler = new network_1.default(_session);
        /**
         * register browser commands
         */
        const commands = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(fnName => fnName !== 'constructor' && !fnName.startsWith('_'));
        commands.forEach(fnName => browser.addCommand(fnName, this[fnName].bind(this)));
    }
    /**
     * The cdp command is a custom command added to the browser scope that allows you
     * to call directly commands to the protocol.
     */
    cdp(domain, command, args = {}) {
        log.info(`Send command "${domain}.${command}" with args: ${JSON.stringify(args)}`);
        return this._session.send(`${domain}.${command}`, args);
    }
    /**
     * Helper method to get the nodeId of an element in the page.
     * NodeIds are similar like WebDriver node ids an identifier for a node.
     * It can be used as a parameter for other Chrome DevTools methods, e.g. DOM.focus.
     */
    async getNodeId(selector) {
        const document = await this._session.send('DOM.getDocument');
        const { nodeId } = await this._session.send('DOM.querySelector', { nodeId: document.root.nodeId, selector });
        return nodeId;
    }
    /**
     * Helper method to get the nodeId of an element in the page.
     * NodeIds are similar like WebDriver node ids an identifier for a node.
     * It can be used as a parameter for other Chrome DevTools methods, e.g. DOM.focus.
     */
    async getNodeIds(selector) {
        const document = await this._session.send('DOM.getDocument');
        const { nodeIds } = await this._session.send('DOM.querySelectorAll', { nodeId: document.root.nodeId, selector });
        return nodeIds;
    }
    /**
     * Start tracing the browser. You can optionally pass in custom tracing categories and the
     * sampling frequency.
     */
    startTracing({ categories = constants_1.DEFAULT_TRACING_CATEGORIES, path, screenshots = true } = {}) {
        if (this._isTracing) {
            throw new Error('browser is already being traced');
        }
        this._isTracing = true;
        this._traceEvents = undefined;
        return this._page.tracing.start({ categories, path, screenshots });
    }
    /**
     * Stop tracing the browser.
     */
    async endTracing() {
        if (!this._isTracing) {
            throw new Error('No tracing was initiated, call `browser.startTracing()` first');
        }
        try {
            const traceBuffer = await this._page.tracing.stop();
            this._traceEvents = JSON.parse(traceBuffer.toString('utf8'));
            this._isTracing = false;
        }
        catch (err) {
            throw new Error(`Couldn't parse trace events: ${err.message}`);
        }
        return this._traceEvents;
    }
    /**
     * Returns the tracelogs that was captured within the tracing period.
     * You can use this command to store the trace logs on the file system to analyse the trace
     * via Chrome DevTools interface.
     */
    getTraceLogs() {
        return this._traceEvents;
    }
    /**
     * Returns page weight information of the last page load.
     */
    getPageWeight() {
        const requestTypes = Object.values(this._networkHandler.requestTypes).filter(Boolean);
        const pageWeight = (0, utils_1.sumByKey)(requestTypes, 'size');
        const transferred = (0, utils_1.sumByKey)(requestTypes, 'encoded');
        const requestCount = (0, utils_1.sumByKey)(requestTypes, 'count');
        return { pageWeight, transferred, requestCount, details: this._networkHandler.requestTypes };
    }
}
exports.default = CommandHandler;
