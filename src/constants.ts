type DEBUG_LEVEL_Type = 'DEBUG' | 'PROD';
export const DEBUG_LEVEL: DEBUG_LEVEL_Type = 'DEBUG';
export const SDK_VERSION = '0.10.1';
export const IS_NODE_CLI = typeof process !== 'undefined' && process.versions && process.versions.node;
