import { HTTPConfig, Language, OJP_VERSION } from './types/_all';

import { LocationInformationRequest } from './versions/current/requests/lir';
import { StopEventRequest } from "./versions/current/requests/ser";
import { TripInfoRequest } from "./versions/current/requests/tir";
import { TripRefineRequest } from "./versions/current/requests/trr";
import { TripRequest } from "./versions/current/requests/tr";

import { OJPv1_FareRequest } from "./versions/legacy/v1/requests/fr";
import { OJPv1_LocationInformationRequest } from './versions/legacy/v1/requests/lir';
import { OJPv1_StopEventRequest } from "./versions/legacy/v1/requests/ser";
import { OJPv1_TripInfoRequest } from "./versions/legacy/v1/requests/tir";
import { OJPv1_TripRequest } from "./versions/legacy/v1/requests/tr";

class EmptyRequest {
  public static init() {
    throw new Error('this request is not available for the selected OJP version');
  }
}

// Registry of classes per version
const builders = {
  '1.0': {
    FareRequest: OJPv1_FareRequest,
    LocationInformationRequest: OJPv1_LocationInformationRequest,
    StopEventRequest: OJPv1_StopEventRequest,
    TripInfoRequest: OJPv1_TripInfoRequest,
    TripRefineRequest: EmptyRequest,
    TripRequest: OJPv1_TripRequest,
  },
  '2.0': { 
    FareRequest: EmptyRequest,
    LocationInformationRequest: LocationInformationRequest,
    StopEventRequest: StopEventRequest,
    TripInfoRequest: TripInfoRequest,
    TripRefineRequest: TripRefineRequest,
    TripRequest: TripRequest,
  },
} as const;

type Builders = typeof builders;
type RequestKey = keyof Builders['2.0'];
type ClassFor<V extends OJP_VERSION, K extends RequestKey> = Builders[V][K];

export class SDK<V extends OJP_VERSION = '2.0'> {
  public readonly version: OJP_VERSION;
  public requestorRef: string;
  public httpConfig: HTTPConfig;
  public language: Language;

  private constructor(requestorRef: string, httpConfig: HTTPConfig, language: Language = 'en', version: OJP_VERSION) {
    this.requestorRef = requestorRef;
    this.httpConfig = httpConfig;
    this.language = language;
    this.version = version;
  }

  public static create(requestorRef: string, httpConfig: HTTPConfig, language: Language = 'en'): SDK<'2.0'> {
    const sdk = new SDK<'2.0'>(requestorRef, httpConfig, language, '2.0');
    return sdk;
  }
  public static v1(requestorRef: string, httpConfig: HTTPConfig, language: Language = 'en'): SDK<'1.0'> {
    const sdk = new SDK<'1.0'>(requestorRef, httpConfig, language, '1.0');
    return sdk;
  }

  get requests(): { [K in RequestKey]: ClassFor<V, K> } {
    return builders[this.version] as { [K in RequestKey]: ClassFor<V, K> };
  }
}
