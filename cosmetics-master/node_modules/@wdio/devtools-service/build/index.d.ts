import type { Browser, MultiRemoteBrowser } from 'webdriverio';
import type { Capabilities, Services, FunctionProperties, ThenArg } from '@wdio/types';
import CommandHandler from './commands';
import Auditor from './auditor';
import { DevtoolsConfig, EnablePerformanceAuditsOptions, DeviceDescription, PWAAudits } from './types';
export default class DevToolsService implements Services.ServiceInstance {
    private _options;
    private _isSupported;
    private _shouldRunPerformanceAudits;
    private _puppeteer?;
    private _target?;
    private _page;
    private _session?;
    private _driver?;
    private _cacheEnabled?;
    private _cpuThrottling?;
    private _networkThrottling?;
    private _formFactor?;
    private _traceGatherer?;
    private _devtoolsGatherer?;
    private _coverageGatherer?;
    private _pwaGatherer?;
    private _browser?;
    constructor(_options: DevtoolsConfig);
    beforeSession(_: unknown, caps: Capabilities.Capabilities): void;
    before(caps: Capabilities.RemoteCapability, specs: string[], browser: Browser<'async'> | MultiRemoteBrowser<'async'>): Promise<void>;
    onReload(): Promise<void>;
    beforeCommand(commandName: string, params: any[]): Promise<void>;
    afterCommand(commandName: string): Promise<void>;
    after(): Promise<void>;
    /**
     * set flag to run performance audits for page transitions
     */
    _enablePerformanceAudits({ networkThrottling, cpuThrottling, cacheEnabled, formFactor }?: EnablePerformanceAuditsOptions): void;
    /**
     * custom command to disable performance audits
     */
    _disablePerformanceAudits(): void;
    /**
     * set device emulation
     */
    _emulateDevice(device: string | DeviceDescription, inLandscape?: boolean): Promise<void>;
    /**
     * helper method to set throttling profile
     */
    _setThrottlingProfile(networkThrottling?: "online" | "offline" | "GPRS" | "Regular 2G" | "Good 2G" | "Regular 3G" | "Good 3G" | "Regular 4G" | "DSL" | "Wifi", cpuThrottling?: number, cacheEnabled?: boolean): Promise<void>;
    _checkPWA(auditsToBeRun?: PWAAudits[]): Promise<import("./types").AuditResult>;
    _getCoverageReport(): Promise<import("./types").Coverage | null>;
    _setupHandler(): Promise<void>;
}
export * from './types';
type ServiceCommands = Omit<FunctionProperties<DevToolsService>, keyof Services.HookFunctions | '_setupHandler'>;
type CommandHandlerCommands = FunctionProperties<CommandHandler>;
type AuditorCommands = Omit<FunctionProperties<Auditor>, '_audit' | '_auditPWA' | 'updateCommands'>;
/**
 * ToDo(Christian): use key remapping with TS 4.1
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types
 */
interface BrowserExtension extends CommandHandlerCommands, AuditorCommands {
    /**
     * Enables auto performance audits for all page loads that are cause by calling the url command or clicking on a link or anything that causes a page load.
     * You can pass in a config object to determine some throttling options. The default throttling profile is Good 3G network with a 4x CPU trottling.
     */
    enablePerformanceAudits: ServiceCommands['_enablePerformanceAudits'];
    /**
     * Disable the performance audits
     */
    disablePerformanceAudits: ServiceCommands['_disablePerformanceAudits'];
    /**
     * The service allows you to emulate a specific device type.
     * If set, the browser viewport will be modified to fit the device capabilities as well as the user agent will set according to the device user agent.
     * Note: This only works if you don't use mobileEmulation within capabilities['goog:chromeOptions']. If mobileEmulation is present the call to browser.emulateDevice() won't do anything.
     */
    emulateDevice: ServiceCommands['_emulateDevice'];
    /**
     * Throttle network speed of the browser.
     */
    setThrottlingProfile: ServiceCommands['_setThrottlingProfile'];
    /**
     * Runs various PWA Lighthouse audits on the current opened page.
     * Read more about Lighthouse PWA audits at https://web.dev/lighthouse-pwa/.
     */
    checkPWA: ServiceCommands['_checkPWA'];
    /**
     * Returns the coverage report for the current opened page.
     */
    getCoverageReport: ServiceCommands['_getCoverageReport'];
}
export type BrowserExtensionSync = {
    [K in keyof BrowserExtension]: (...args: Parameters<BrowserExtension[K]>) => ThenArg<ReturnType<BrowserExtension[K]>>;
};
declare global {
    namespace WebdriverIO {
        interface ServiceOption extends DevtoolsConfig {
        }
    }
    namespace WebdriverIOAsync {
        interface Browser extends BrowserExtension {
        }
        interface MultiRemoteBrowser extends BrowserExtension {
        }
    }
    namespace WebdriverIOSync {
        interface Browser extends BrowserExtensionSync {
        }
        interface MultiRemoteBrowser extends BrowserExtensionSync {
        }
    }
}
//# sourceMappingURL=index.d.ts.map