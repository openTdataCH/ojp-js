import { XML_Config } from "./types/_all";

/**
 * SDK current version
 * 
 * @category Core
 */
export const SDK_VERSION = '0.22.3';

const mapNS = {
  'ojp': 'http://www.vdv.de/ojp',
  'siri': 'http://www.siri.org.uk/siri',
};

/**
 * Default XML configuration for serialization with 'ojp' as the default namespace
 * 
 * @category XML Utils
 */ 
export const DefaultXML_Config: XML_Config = {
  ojpVersion: '2.0',
  defaultNS: 'ojp',
  mapNS: mapNS,
};

/**
 * XML configuration for OJP version 1.0 with 'siri' as the default namespace
 * 
 * @category XML Utils
 */
export const XML_BuilderConfigOJPv1: XML_Config = {
  ojpVersion: '1.0',
  defaultNS: 'siri',
  mapNS: mapNS,
};

/**
 * XML configuration for OJP version 1.0 with 'ojp' as the default namespace
 * 
 * @category XML Utils
 */
export const XML_ParserConfigOJPv1: XML_Config = {
  ojpVersion: '1.0',
  defaultNS: 'ojp',
  mapNS: mapNS,
};
