import { HTTPConfig, Language, OJP_VERSION } from './types/_all';

import { LocationInformationRequest } from './versions/current/requests/lir';
import { StopEventRequest } from "./versions/current/requests/ser";
import { TripInfoRequest } from "./versions/current/requests/tir";
import { TripRefineRequest } from "./versions/current/requests/trr";
import { TripRequest } from "./versions/current/requests/tr";

import { OJPv1_LocationInformationRequest } from './versions/legacy/v1/requests/lir';
import { OJPv1_StopEventRequest } from "./versions/legacy/v1/requests/ser";
import { OJPv1_TripInfoRequest } from "./versions/legacy/v1/requests/tir";
import { FakeOJPv1_TripRefineRequest } from "./versions/legacy/v1/requests/trr";
import { OJPv1_TripRequest } from "./versions/legacy/v1/requests/tr";

type RequestKey = 'LocationInformationRequest' | 'StopEventRequest' | 'TripInfoRequest' | 'TripRefineRequest' | 'TripRequest';

// Registry of classes per version
const builders = {
  '1.0': { 
    LocationInformationRequest: OJPv1_LocationInformationRequest,
    StopEventRequest: OJPv1_StopEventRequest,
    TripInfoRequest: OJPv1_TripInfoRequest,
    TripRefineRequest: TripRefineRequest,
    TripRequest: OJPv1_TripRequest,
  },
  '2.0': { 
    LocationInformationRequest: LocationInformationRequest,
    StopEventRequest: StopEventRequest,
    TripInfoRequest: TripInfoRequest,
    TripRefineRequest: TripRefineRequest,
    TripRequest: TripRequest,
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
