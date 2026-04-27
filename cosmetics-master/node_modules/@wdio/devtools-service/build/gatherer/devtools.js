"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DevtoolsGatherer {
    constructor() {
        this._logs = [];
    }
    onMessage(msgObj) {
        this._logs.push(msgObj);
    }
    /**
     * retrieve logs and clean cache
     */
    getLogs() {
        return this._logs.splice(0, this._logs.length);
    }
}
exports.default = DevtoolsGatherer;
