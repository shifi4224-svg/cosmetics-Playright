"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const session_1 = __importDefault(require("lighthouse/lighthouse-core/fraggle-rock/gather/session"));
const page_functions_1 = __importDefault(require("lighthouse/lighthouse-core/lib/page-functions"));
const network_recorder_1 = __importDefault(require("lighthouse/lighthouse-core/lib/network-recorder"));
const session_2 = __importDefault(require("lighthouse/lighthouse-core/fraggle-rock/gather/session"));
const installability_errors_1 = __importDefault(require("lighthouse/lighthouse-core/gather/gatherers/installability-errors"));
const web_app_manifest_1 = __importDefault(require("lighthouse/lighthouse-core/gather/gatherers/web-app-manifest"));
const link_elements_1 = __importDefault(require("lighthouse/lighthouse-core/gather/gatherers/link-elements"));
const viewport_dimensions_1 = __importDefault(require("lighthouse/lighthouse-core/gather/gatherers/viewport-dimensions"));
const service_workers_1 = __importDefault(require("lighthouse/lighthouse-core/gather/driver/service-workers"));
const collectMetaElements_1 = __importDefault(require("../scripts/collectMetaElements"));
const constants_1 = require("../constants");
class PWAGatherer {
    constructor(_session, _page, _driver) {
        this._session = _session;
        this._page = _page;
        this._driver = _driver;
        this._networkRecords = [];
        this._frGatherer = new session_1.default(this._session);
        this._protocolSession = new session_2.default(_session);
        /**
         * setup network recorder
         */
        this._networkRecorder = new network_recorder_1.default();
        constants_1.NETWORK_RECORDER_EVENTS.forEach((method) => {
            this._session.on(method, (params) => this._networkRecorder.dispatch({ method, params }));
        });
        /**
         * clean up network records after every page load
         */
        this._page.on('load', () => {
            this._networkRecords = this._networkRecorder.getRawRecords();
            delete this._networkRecorder;
            this._networkRecorder = new network_recorder_1.default();
        });
    }
    async gatherData() {
        var _a;
        const pageUrl = await ((_a = this._page) === null || _a === void 0 ? void 0 : _a.url());
        const passContext = {
            url: pageUrl,
            driver: this._driver
        };
        const loadData = {
            networkRecords: this._networkRecords
        };
        const linkElements = new link_elements_1.default();
        const viewportDimensions = new viewport_dimensions_1.default();
        const { registrations } = await service_workers_1.default.getServiceWorkerRegistrations(this._protocolSession);
        const { versions } = await service_workers_1.default.getServiceWorkerVersions(this._protocolSession);
        return {
            URL: { requestedUrl: pageUrl, finalUrl: pageUrl },
            WebAppManifest: await web_app_manifest_1.default.getWebAppManifest(this._frGatherer, pageUrl),
            InstallabilityErrors: await installability_errors_1.default.getInstallabilityErrors(this._frGatherer),
            MetaElements: await this._driver.evaluate(collectMetaElements_1.default, {
                args: [],
                useIsolation: true,
                deps: [page_functions_1.default.getElementsInDocument],
            }),
            ViewportDimensions: await viewportDimensions.afterPass(passContext),
            ServiceWorker: { versions, registrations },
            LinkElements: await linkElements.afterPass(passContext, loadData)
        };
    }
}
exports.default = PWAGatherer;
