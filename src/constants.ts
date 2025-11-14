import { XML_Config } from "./types/_all";

export const SDK_VERSION = '0.20.32';

const mapNS = {
  'ojp': 'http://www.vdv.de/ojp',
  'siri': 'http://www.siri.org.uk/siri',
};

export const DefaultXML_Config: XML_Config = {
  ojpVersion: '2.0',
  defaultNS: 'ojp',
  mapNS: mapNS,
};

// XML builder in OJPv1 siri: default
export const XML_BuilderConfigOJPv1: XML_Config = {
  ojpVersion: '1.0',
  defaultNS: 'siri',
  mapNS: mapNS,
};

// XML parser in OJPv1 ojp: default
export const XML_ParserConfigOJPv1: XML_Config = {
  ojpVersion: '1.0',
  defaultNS: 'ojp',
  mapNS: mapNS,
};
