import { XML_Config } from "./types/_all.js";

export const SDK_VERSION = '0.20.3';

export const DefaultXML_Config: XML_Config = {
  version: '2.0',
  defaultNS: 'ojp',
  mapNS: {
    'ojp': 'http://www.vdv.de/ojp',
    'siri': 'http://www.siri.org.uk/siri',
  },
};
