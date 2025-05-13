import * as OJP_Types from 'ojp-shared-types';

import { Language, RequestInfo, XML_Config } from "../types/_all";
import { Place, PlaceRef, Trip } from './ojp';
import { buildXML } from "../helpers/xml/builder";
import { DefaultXML_Config } from "../constants";

class BaseRequest {
  public requestInfo: RequestInfo;

  public mockRequestXML: string | null;
  public mockResponseXML: string | null;

  public enableExtensions: boolean;

  protected constructor() {
    this.requestInfo = {
      requestDateTime: null,
      requestXML: null,
      responseDateTime: null,
      responseXML: null,
      parseDateTime: null,
    };

    this.mockRequestXML = null;
    this.mockResponseXML = null;
    this.enableExtensions = true;
  }
}

export class TripRequest extends BaseRequest implements OJP_Types.TripRequestSchema {
  public requestTimestamp: string;
  
  public origin: OJP_Types.PlaceContextSchema;
  public destination: OJP_Types.PlaceContextSchema;
  public via: OJP_Types.ViaPointSchema[];
  
  public params?: OJP_Types.TripParamsSchema;

  private constructor(
    origin: OJP_Types.PlaceContextSchema, 
    destination: OJP_Types.PlaceContextSchema, 
    via: OJP_Types.ViaPointSchema[] = [],
    
    params: OJP_Types.TripParamsSchema | null = null, 
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

  private static DefaultRequestParams(): OJP_Types.TripParamsSchema {
    const requestParams: OJP_Types.TripParamsSchema = {
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
    const origin: OJP_Types.PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords('8503000', 'Zürich'),
      depArrTime: date.toISOString(),
    };
    const destination: OJP_Types.PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords('8507000', 'Bern'),
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

  public static initWithPlaceRefsOrCoords(originPlaceRefS: string, destinationPlaceRefS: string): TripRequest {
    const origin: OJP_Types.PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords(originPlaceRefS),
    };
    const destination: OJP_Types.PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords(destinationPlaceRefS),
    };

    const params = TripRequest.DefaultRequestParams();

    const request = new TripRequest(origin, destination, [], params);
    request.setDepartureDatetime();

    return request;
  }

  public static initWithPlaces(origin: Place, destination: Place): TripRequest {
    const originPlaceRefS = origin.asStopPlaceRefOrCoords();
    const destinationPlaceRefS = destination.asStopPlaceRefOrCoords();

    const request = TripRequest.initWithPlaceRefsOrCoords(originPlaceRefS, destinationPlaceRefS);
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

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config = DefaultXML_Config): string {
    const requestOJP: OJP_Types.TripRequestOJP = {
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

    const xmlS = buildXML(requestOJP, xmlConfig);

    return xmlS;
  }
}

export class LocationInformationRequest extends BaseRequest implements OJP_Types.LocationInformationRequestSchema {
  public requestTimestamp: string;
  public initialInput?: OJP_Types.InitialInputSchema;
  public placeRef?: PlaceRef;
  public restrictions?: OJP_Types.LIR_RequestParamsSchema;

  private constructor(initialInput: OJP_Types.InitialInputSchema | undefined, placeRef: PlaceRef | undefined, restrictions: OJP_Types.LIR_RequestParamsSchema | undefined) {
    super();

    const now = new Date();
    this.requestTimestamp = now.toISOString();

    this.initialInput = initialInput;
    this.placeRef = placeRef;
    this.restrictions = restrictions;
  }

  private static DefaultRequestParams(): OJP_Types.LIR_RequestParamsSchema {
    const params: OJP_Types.LIR_RequestParamsSchema = {
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

  public static initWithPlaceRef(placeRefOrCoords: string): LocationInformationRequest {
    const request = LocationInformationRequest.Default();
    request.placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefOrCoords);
    return request;
  }

  public static initWithBBOX(bboxData: string | number[], placeType: OJP_Types.PlaceTypeEnum[], numberOfResults: number = 10): LocationInformationRequest {
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
    const requestOJP: OJP_Types.LocationInformationRequestOJP = {
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

export class StopEventRequest extends BaseRequest implements OJP_Types.StopEventRequestSchema {
  public requestTimestamp: string;
  public location: OJP_Types.SER_RequestLocationSchema;
  public params?: OJP_Types.SER_RequestParamsSchema;

  private constructor(location: OJP_Types.SER_RequestLocationSchema, params: OJP_Types.SER_RequestParamsSchema | undefined = undefined) {
    super();

    const now = new Date();
    this.requestTimestamp = now.toISOString();
    
    this.location = location;
    this.params = params;
  }

  private static DefaultRequestParams(): OJP_Types.SER_RequestParamsSchema {
    const params: OJP_Types.SER_RequestParamsSchema = {
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
    const location: OJP_Types.SER_RequestLocationSchema = {
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
    const location: OJP_Types.SER_RequestLocationSchema = {
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
    const requestOJP: OJP_Types.SER_RequestOJP = {
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

export class TripRefineRequest extends BaseRequest implements OJP_Types.TRR_RequestSchema {
  public requestTimestamp: string;
  public refineParams?: OJP_Types.TRR_RequestParamsSchema;
  public tripResult: OJP_Types.TripResultSchema;

  private constructor(tripResult: OJP_Types.TripResultSchema, refineParams?: OJP_Types.TRR_RequestParamsSchema) {
    super();

    const now = new Date();
    this.requestTimestamp = now.toISOString();
    
    this.refineParams = refineParams;
    this.tripResult = tripResult;
  }

  private static DefaultRequestParams(): OJP_Types.TRR_RequestParamsSchema {
    const params: OJP_Types.TRR_RequestParamsSchema = {
      numberOfResults: undefined,
      useRealtimeData: 'explanatory',
      includeAllRestrictedLines: true,
      includeIntermediateStops: true,
    };

    return params;
  }

  public static initWithTrip(trip: Trip): TripRefineRequest {
    const tripResult: OJP_Types.TripResultSchema = {
      id: trip.id,
      trip: trip,
    };

    const params = TripRefineRequest.DefaultRequestParams();
    const request = new TripRefineRequest(tripResult, params);
    
    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string): string {
    const requestOJP: OJP_Types.TRR_RequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: requestorRef,
          OJPTripRefineRequest: this,
        }
      },
    };

    const xmlS = buildXML(requestOJP);

    return xmlS;
  }
}
