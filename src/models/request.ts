import { InitialInputSchema, LIR_RequestParamsSchema, LocationInformationRequestOJP, LocationInformationRequestSchema, PlaceContextSchema, PlaceTypeEnum, SER_RequestLocationSchema, SER_RequestOJP, SER_RequestParamsSchema, StopEventRequestSchema, TripParamsSchema, TripRequestOJP, TripRequestSchema, ViaPointSchema } from "../types/openapi";

import { Language } from "../types/_all";
import { PlaceRef } from './ojp';
import { buildXML } from "../helpers/xml/builder";

class BaseRequest {
  public mockRequestXML: string | null;
  public mockResponseXML: string | null;

  public enableExtension: boolean;

  protected constructor() {
    this.mockRequestXML = null;
    this.mockResponseXML = null;
    this.enableExtension = true;
  }
}

export class TripRequest extends BaseRequest implements TripRequestSchema {
  public requestTimestamp: string
  
  public origin: PlaceContextSchema;
  public destination: PlaceContextSchema;
  public via: ViaPointSchema[];
  
  public params?: TripParamsSchema;

  private constructor(
    origin: PlaceContextSchema, 
    destination: PlaceContextSchema, 
    via: ViaPointSchema[] = [],
    
    params: TripParamsSchema | null = null, 
  ) {
    super();

    const now = new Date();
    this.requestTimestamp = now.toISOString();

    this.origin = origin;
    this.destination = destination;
    this.via = via;

    this.params = params ??= {};

    this.mockRequestXML = null;
    this.mockResponseXML = null;
  }

  public static DefaultRequestParams(): TripParamsSchema {
    const requestParams: TripParamsSchema = {
      modeAndModeOfOperationFilter: [],
      
      numberOfResults: 5,
      numberOfResultsBefore: undefined,
      numberOfResultsAfter: undefined,

      useRealtimeData: 'explanatory',

      includeAllRestrictedLines: true,
      includeTrackSections: true,
      includeLegProjection: false,
      includeIntermediateStops: true,
    };

    return requestParams;
  }

  private static Default(): TripRequest {
    const date = new Date();
    const origin: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName('8503000', 'Zürich'),
      depArrTime: date.toISOString(),
    };
    const destination: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName('8507000', 'Bern'),
    };
    const params = TripRequest.DefaultRequestParams();

    const request = new TripRequest(origin, destination, [], params);
    return request;
  }

  public static initWithRequestMock(mockText: string): TripRequest {
    const request = TripRequest.Default();
    request.mockRequestXML = mockText;
    return request;
  }

  public static initWithResponseMock(mockText: string): TripRequest {
    const request = TripRequest.Default();
    request.mockResponseXML = mockText;
    return request;
  }

  public static initWithPlaceRefsAndDate(originPlaceRefS: string, destinationPlaceRefS: string, date: Date = new Date()): TripRequest {
    const origin: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName(originPlaceRefS, 'n/a'),
      depArrTime: date.toISOString(),
    };
    const destination: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName(destinationPlaceRefS, 'n/a'),
    };

    const params = TripRequest.DefaultRequestParams();

    const request = new TripRequest(origin, destination, [], params);
    return request;
  }

  public setArrivalDatetime(newDatetime: Date = new Date()) {
    delete(this.origin.depArrTime);
    this.destination.depArrTime = newDatetime.toISOString();
  }

  public setDepartureDatetime(newDatetime: Date = new Date()) {
    delete(this.destination.depArrTime);
    this.origin.depArrTime = newDatetime.toISOString();
  }

  public buildRequestXML(language: Language, requestorRef: string): string {
    const requestOJP: TripRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language,
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: requestorRef,
          OJPTripRequest: this,
        },
      },
    };

    const xmlS = buildXML(requestOJP);

    return xmlS;
  }
}

export class LocationInformationRequest extends BaseRequest implements LocationInformationRequestSchema {
  public requestTimestamp: string;
  public initialInput?: InitialInputSchema;
  public placeRef?: PlaceRef;
  public restrictions?: LIR_RequestParamsSchema;

  private constructor(initialInput: InitialInputSchema | undefined, placeRef: PlaceRef | undefined, restrictions: LIR_RequestParamsSchema | undefined) {
    super();

    const now = new Date();
    this.requestTimestamp = now.toISOString();

    this.initialInput = initialInput;
    this.placeRef = placeRef;
    this.restrictions = restrictions;
  }

  public static DefaultRequestParams(): LIR_RequestParamsSchema {
    const params: LIR_RequestParamsSchema = {
      type: [],
      numberOfResults: 10,
    };

    return params;
  }
  
  public static Default(): LocationInformationRequest {
    const request = new LocationInformationRequest(undefined, undefined, undefined);

    request.restrictions = LocationInformationRequest.DefaultRequestParams();

    return request;
  }

  public static initWithRequestMock(mockText: string): LocationInformationRequest {
    const request = LocationInformationRequest.Default();
    request.mockRequestXML = mockText;
    return request;
  }

  public static initWithResponseMock(mockText: string): LocationInformationRequest {
    const request = LocationInformationRequest.Default();
    request.mockResponseXML = mockText;
    return request;
  }

  public static initWithLocationName(name: string): LocationInformationRequest {
    const request = LocationInformationRequest.Default();

    request.initialInput = {
      name: name,
    };

    return request;
  }

  public static initWithPlaceRef(placeRefS: string): LocationInformationRequest {
    const request = LocationInformationRequest.Default();
    request.placeRef = PlaceRef.initWithStopRefAndName(placeRefS, 'n/a');

    return request;
  }

  public static initWithBBOX(bboxData: string | number[], placeType: PlaceTypeEnum[], numberOfResults: number = 10): LocationInformationRequest {
    const bboxDataParts: number[] = (() => {
      if (Array.isArray(bboxData)) {
        return bboxData;
      }

      return (bboxData as string).split(',').map(el => Number(el));
    })();

    const request = LocationInformationRequest.Default();

    // TODO - handle data issues, also long min / max smaller / greater
    if (bboxDataParts.length !== 4) {
      debugger;
      return request;
    }

    const longMin = bboxDataParts[0];
    const latMin = bboxDataParts[1];
    const longMax = bboxDataParts[2];
    const latMax = bboxDataParts[3];

    request.initialInput = {
      geoRestriction: {
        rectangle: {
          upperLeft: {
            longitude: longMin,
            latitude: latMax,
          },
          lowerRight: {
            longitude: longMax,
            latitude: latMin,
          },
        }
      }
    };

    request.restrictions = {
      type: placeType,
      numberOfResults: numberOfResults,
    };

    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string): string {
    const requestOJP: LocationInformationRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: requestorRef,
          OJPLocationInformationRequest: this,
        }
      },
    };

    const xmlS = buildXML(requestOJP);

    return xmlS;
  }
}

export class StopEventRequest extends BaseRequest implements StopEventRequestSchema {
  public requestTimestamp: string;
  public location: SER_RequestLocationSchema;
  public params?: SER_RequestParamsSchema;

  private constructor(location: SER_RequestLocationSchema, params: SER_RequestParamsSchema | undefined = undefined) {
    super();

    const now = new Date();
    this.requestTimestamp = now.toISOString();
    
    this.location = location;
    this.params = params;
  }

  public static DefaultRequestParams(): SER_RequestParamsSchema {
    const params: SER_RequestParamsSchema = {
      includeAllRestrictedLines: true,
      numberOfResults: 10,
      stopEventType: 'departure',
      includePreviousCalls: true,
      includeOnwardCalls: true,
      useRealtimeData: 'explanatory',
    };

    return params;
  }

  private static Default(): StopEventRequest {
    const date = new Date();
    const location: SER_RequestLocationSchema = {
      placeRef: {
        stopPointRef: '8507000',
        name: {
          text: 'n/a'
        }
      },
      depArrTime: date.toISOString(),
    };

    const requestParams = StopEventRequest.DefaultRequestParams();
    const request = new StopEventRequest(location, requestParams);
    
    return request;
  }

  public static initWithRequestMock(mockText: string): StopEventRequest {
    const request = StopEventRequest.Default();
    request.mockRequestXML = mockText;
    return request;
  }

  public static initWithResponseMock(mockText: string): StopEventRequest {
    const request = StopEventRequest.Default();
    request.mockResponseXML = mockText;
    return request;
  }

  public static initWithPlaceRefAndDate(placeRefS: string, date: Date = new Date()): StopEventRequest {
    const location: SER_RequestLocationSchema = {
      placeRef: {
        stopPointRef: placeRefS,
        name: {
          text: 'n/a'
        }
      },
      depArrTime: date.toISOString(),
    };

    const params = StopEventRequest.DefaultRequestParams();

    const request = new StopEventRequest(location, params);

    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string): string {
    const requestOJP: SER_RequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: requestorRef,
          OJPStopEventRequest: this,
        }
      },
    };

    const xmlS = buildXML(requestOJP);

    return xmlS;
  }
}
