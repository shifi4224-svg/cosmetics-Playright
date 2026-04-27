import type { Browser, MultiRemoteBrowser } from 'webdriverio';
import type { Capabilities } from '@wdio/types';
import type { CDPSession } from 'puppeteer-core/lib/cjs/puppeteer/common/Connection';
import type { Target } from 'puppeteer-core/lib/cjs/puppeteer/common/Target';
import { RequestPayload } from './handler/network';
import type { GathererDriver } from './types';
export declare function setUnsupportedCommand(browser: Browser<'async'> | MultiRemoteBrowser<'async'>): void;
/**
 * Create a sum of a specific key from a list of objects
 * @param list list of key/value objects
 * @param key  key of value to be summed up
 */
export declare function sumByKey(list: RequestPayload[], key: keyof RequestPayload): number;
/**
 * check if url is supported for tracing
 * @param  {String}  url to check for
 * @return {Boolean}     true if url was opened by user
 */
export declare function isSupportedUrl(url: string): boolean;
/**
 * check if browser version is lower than `minVersion`
 * @param {object} caps capabilities
 * @param {number} minVersion minimal chrome browser version
 */
export declare function isBrowserVersionLower(caps: Capabilities.Capabilities, minVersion: number): boolean;
/**
 * get chromedriver major version
 * @param   {string|*}      version chromedriver version like `78.0.3904.11` or just `78`
 * @return  {number|*}              either major version, ex `78`, or whatever value is passed
 */
export declare function getBrowserMajorVersion(version?: string | number): number | undefined;
/**
 * check if browser is supported based on caps.browserName and caps.version
 * @param {object} caps capabilities
 */
export declare function isBrowserSupported(caps: Capabilities.Capabilities): boolean;
/**
 * Either request the page list directly from the browser or if Selenium
 * or Selenoid is used connect to a target manually
 */
export declare function getLighthouseDriver(session: CDPSession, target: Target): Promise<GathererDriver>;
//# sourceMappingURL=utils.d.ts.map