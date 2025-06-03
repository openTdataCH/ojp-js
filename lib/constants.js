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
export const OJP_VERSION = '2.0';
export const SDK_VERSION = '0.18.6';
export const IS_NODE_CLI = typeof process !== 'undefined' && process.versions && process.versions.node;
if (DEBUG_LEVEL === 'DEBUG') {
    console.log('OJP version        : ' + OJP_VERSION);
    console.log('OJP-JS SDK version : ' + SDK_VERSION);
    console.log('OJP-SDK            : DEBUG features are enabled');
}
// XML builder in OJPv1 siri: default
export const XML_BuilderConfigOJPv1 = {
    ojpVersion: '1.0',
    defaultNS: 'siri',
    mapNS: {
        'ojp': 'http://www.vdv.de/ojp',
        'siri': 'http://www.siri.org.uk/siri',
    },
};
// XML parser in OJPv1 ojp: default
const XML_ParserConfigOJPv1 = {
    ojpVersion: '1.0',
    defaultNS: 'ojp',
    mapNS: {
        'ojp': 'http://www.vdv.de/ojp',
        'siri': 'http://www.siri.org.uk/siri',
    },
};
// XML builder/parser in OJPv2 ojp: default
export const XML_ConfigOJPv2 = {
    ojpVersion: '2.0',
    defaultNS: 'ojp',
    mapNS: {
        'ojp': 'http://www.vdv.de/ojp',
        'siri': 'http://www.siri.org.uk/siri',
    },
};
const isOJPv2 = OJP_VERSION === '2.0'; // needs casting otherwise TS compiler complains
export const XML_BuilderConfig = isOJPv2 ? XML_ConfigOJPv2 : XML_BuilderConfigOJPv1;
export const XML_ParserConfig = isOJPv2 ? XML_ConfigOJPv2 : XML_ParserConfigOJPv1;
export const REQUESTOR_REF = 'OJPv' + OJP_VERSION + '_JS_SDK_v' + SDK_VERSION;
