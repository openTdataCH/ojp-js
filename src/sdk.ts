import { HTTPConfig, Language, OJP_VERSION } from './types/_all';

import { LocationInformationRequest } from './versions/current/requests/lir';
import { TripInfoRequest } from "./versions/current/requests/tir";
import { OJPv1_LocationInformationRequest } from './versions/legacy/v1/requests/lir';
import { OJPv1_TripInfoRequest } from "./versions/legacy/v1/requests/tir";

type RequestKey = 'LocationInformationRequest' | 'TripInfoRequest';

// Registry of classes per version
const builders = {
  '1.0': { 
    LocationInformationRequest: OJPv1_LocationInformationRequest,
    TripInfoRequest: OJPv1_TripInfoRequest,
  },
  '2.0': { 
    LocationInformationRequest: LocationInformationRequest,
    TripInfoRequest: TripInfoRequest,
  },
} as const;

type Builders = typeof builders;
type ClassFor<V extends OJP_VERSION, K extends RequestKey> = Builders[V][K];

export class SDK<V extends OJP_VERSION = '2.0'> {
  public readonly version: OJP_VERSION;
  public requestorRef: string;
  public httpConfig: HTTPConfig;
  public language: Language;

  constructor(requestorRef: string, httpConfig: HTTPConfig, language: Language = 'en', version: OJP_VERSION = '2.0') {
    this.requestorRef = requestorRef;
    this.httpConfig = httpConfig;
    this.language = language;
    this.version = version;
  }

  get requests(): { [K in RequestKey]: ClassFor<V, K> } {
    return builders[this.version] as { [K in RequestKey]: ClassFor<V, K> };
  }
}
