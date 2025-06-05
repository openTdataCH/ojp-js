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
export const SDK_VERSION = '0.18.6';
export const IS_NODE_CLI = typeof process !== 'undefined' && process.versions && process.versions.node;
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
export const XML_ParserConfigOJPv1 = {
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
