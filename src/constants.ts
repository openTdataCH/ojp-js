import { XML_Config } from "./types/_all";

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

type OJP_VERSION_Type = '1.0' | '2.0';
export const OJP_VERSION: OJP_VERSION_Type = '1.0';
export const SDK_VERSION = '0.17.4';
export const IS_NODE_CLI = typeof process !== 'undefined' && process.versions && process.versions.node;

if (DEBUG_LEVEL === 'DEBUG') {
    console.log('OJP version        : ' + OJP_VERSION);
    console.log('OJP-JS SDK version : ' + SDK_VERSION);
    console.log('OJP-SDK            : DEBUG features are enabled');
}

export const XML_Config_OJPv1: XML_Config = {
    ojpVersion: '1.0',
    defaultNS: null,
    mapNS: {
        'ojp': 'http://www.vdv.de/ojp',
        'siri': 'http://www.siri.org.uk/siri',
    },
};

export const XML_Config_OJPv2: XML_Config = {
    ojpVersion: '2.0',
    defaultNS: 'ojp',
    mapNS: {
        'ojp': 'http://www.vdv.de/ojp',
        'siri': 'http://www.siri.org.uk/siri',
    },
};

