type DEBUG_LEVEL_Type = 'DEBUG' | 'PROD';
export const DEBUG_LEVEL: DEBUG_LEVEL_Type = (() => {
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    if (!isBrowser) {
        return 'PROD';
    }

    if (window.location.hostname.includes('github.io')) {
        return 'PROD';
    }

    return 'DEBUG';
})();

export const SDK_VERSION = '0.12.5';
export const IS_NODE_CLI = typeof process !== 'undefined' && process.versions && process.versions.node;

if (DEBUG_LEVEL === 'DEBUG') {
    console.log('OJP-SDK: DEBUG features are enabled');
    console.log('OJP-SDK: version: ' + SDK_VERSION);
}
