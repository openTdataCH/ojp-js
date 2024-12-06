export const DEBUG_LEVEL = (() => {
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    if (!isBrowser) {
        return 'PROD';
    }
    if (window.location.hostname.includes('github.io')) {
        return 'PROD';
    }
    return 'DEBUG';
})();
export const OJP_VERSION = '1.0';
export const SDK_VERSION = '0.14.1';
export const IS_NODE_CLI = typeof process !== 'undefined' && process.versions && process.versions.node;
if (DEBUG_LEVEL === 'DEBUG') {
    console.log('OJP version        : ' + OJP_VERSION);
    console.log('OJP-JS SDK version : ' + SDK_VERSION);
    console.log('OJP-SDK            : DEBUG features are enabled');
}