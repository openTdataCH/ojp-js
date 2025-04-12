export interface HTTPConfig {
  url: string;
  authToken: string | null;
}

export type Language = 'de' | 'fr' | 'it' | 'en';

export interface XML_Config {
  version: '1.0' | '2.0',
  defaultNS: 'ojp' | 'siri' | null,
  mapNS: Record<string, string>
}
