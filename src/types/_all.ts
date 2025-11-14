export interface HTTPConfig {
  url: string;
  authToken: string | null;
}

export type Language = 'de' | 'fr' | 'it' | 'en';

export type OJP_VERSION = '1.0' | '2.0';

export interface XML_Config {
  ojpVersion: OJP_VERSION,
  defaultNS: 'ojp' | 'siri' | null,
  mapNS: Record<string, string>
}

export interface RequestInfo {
  requestDateTime: Date | null;
  requestXML: string | null;
  responseDateTime: Date | null;
  responseXML: string | null;
  parseDateTime: Date | null;
}

// https://vdvde.github.io/OJP/develop/documentation-tables/siri.html#type_siri__RailSubmodesOfTransportEnumeration
//    international     - ICE, TGV, EC, RJX, NJ, EN
//    highSpeedRail     - IC
//    interregionalRail - IR, IRN, IRE
//    railShuttle       - ATZ
//    local             - S, SN, RB, RE, PE
export type RailSubmodeType = 'international' | 'highSpeedRail' | 'interregionalRail' | 'railShuttle' | 'local';
