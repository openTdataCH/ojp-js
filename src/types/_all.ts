export interface HTTPConfig {
  url: string;
  authToken: string | null;
}

export type Language = 'de' | 'fr' | 'it' | 'en';

export interface XML_Config {
  ojpVersion: '1.0' | '2.0',
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
