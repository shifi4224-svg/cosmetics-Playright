"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cri_1 = __importDefault(require("lighthouse/lighthouse-core/gather/connections/cri"));
const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = '9222';
/**
 * this class got patched to enable connecting to a remote path like
 * ws://192.168.0.39:4444/session/349a44a32846c2659c703e71403bd472/se/cdp
 * as it requires to attach to a session before.
 */
class ChromeProtocolPatched extends cri_1.default {
    /**
     * Add constructor for typing safety
     * @param {number=} port Optional port number. Defaults to 9222;
     * @param {string=} hostname Optional hostname. Defaults to localhost.
     * @constructor
     */
    constructor(port = DEFAULT_PORT, hostname = DEFAULT_HOSTNAME) {
        super(port, hostname);
    }
    setSessionId(sessionId) {
        this._sessionId = sessionId;
    }
    /**
     * force every command to be send with the given session id
     */
    sendCommand(method, sessionId, ...paramArgs) {
        return super.sendCommand(method, sessionId || this._sessionId, ...paramArgs);
    }
}
exports.default = ChromeProtocolPatched;
