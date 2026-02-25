import { SDK } from "../sdk";

/**
 * Configuration interface for HTTP requests
 * 
 * This interface defines the structure for configuring HTTP request settings,
 * including the target URL and authentication token.
 * 
 * @example
 * ```typescript
 * const config: HTTPConfig = {
 *   url: 'https://api.example.com/data',
 *   authToken: 'Bearer abc123xyz'
 * };
 * ```
 * 
 * @category Core
 */
export interface HTTPConfig {
  url: string;
  authToken: string | null;
}

/**
 * SDK language
 * 
 * @category Core
 */
export type Language = 'de' | 'fr' | 'it' | 'en';

export type OJP_VERSION = '1.0' | '2.0';

export type AnySDK = SDK<'1.0'> | SDK<'2.0'>;

/**
 * Configuration interface for XML serialization settings
 * 
 * This interface defines the structure for configuring XML serialization behavior,
 * including OJP version, default namespace handling, and custom namespace mappings.
 * 
 * @example
 * ```typescript
 * const config: XML_Config = {
 *   ojpVersion: '2.0',
 *   defaultNS: 'ojp',
 *   mapNS: {
 *     'http://www.vdv.de/ojp': 'ojp',
 *     'http://www.siri.org.uk/siri': 'siri'
 *   }
 * };
 * ```
 * 
 * @category XML Utils
 */
export interface XML_Config {
  /** The OJP version to use for serialization */
  ojpVersion: OJP_VERSION,
  
  /** The default namespace prefix ('ojp', 'siri', or null) */
  defaultNS: 'ojp' | 'siri' | null,
  
  /** Mapping of XML namespace URIs to their prefixes */
  mapNS: Record<string, string>
}

export interface RequestInfo {
  requestDateTime: Date | null;
  requestXML: string | null;
  responseDateTime: Date | null;
  responseXML: string | null;
  parseDateTime: Date | null;
}
