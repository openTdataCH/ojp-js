import { buildXML, parseXML } from "../helpers/xml-helpers";
import { Language } from "../types/_all";

import { 
  PlaceContextSchema, UseRealtimeDataEnum, VehicleModesOfTransportEnum,
  GeoPositionSchema, PlaceRefSchema, InternationalTextSchema, 
  
  ModeAndModeOfOperationFilterSchema,
  TripRequestOJP,
  TripRequestSchema, TripParamsSchema, ViaPointSchema,
  TripSchema,
  LegSchema,
  LocationInformationRequestSchema,
  InitialInputSchema,
  LIR_RequestParamsSchema,
  LocationInformationRequestOJP,
  PlaceResultSchema,
  PlaceSchema,
  PlaceTypeEnum,
  StopEventRequestSchema,
  SER_RequestLocationSchema,
  SER_RequestParamsSchema,
  SER_RequestOJP,
  StopEventResultSchema,
  StopEventSchema,
} from '../types/openapi';


export class PlaceRef implements PlaceRefSchema {
  public stopPointRef?: string;
  public stopPlaceRef?: string;
  public geoPosition?: GeoPositionSchema;
  public name: InternationalTextSchema;
  
  constructor(name: InternationalTextSchema) {
    this.name = name;
  }

  public static initWithStopRefAndName(placeRefS: string, nameS: string): PlaceRef {
    const name: InternationalTextSchema = {
      text: nameS,
    };
    const placeRef = new PlaceRef(name);
    placeRef.stopPlaceRef = placeRefS;

    return placeRef;
  }
}

export class TripRequest implements TripRequestSchema {
  public requestTimestamp: string
  
  public origin: PlaceContextSchema;
  public destination: PlaceContextSchema;
  public via: ViaPointSchema[];
  
  public params?: TripParamsSchema;

  constructor(
    origin: PlaceContextSchema, 
    destination: PlaceContextSchema, 
    via: ViaPointSchema[] = [],
    
    params: TripParamsSchema | null = null, 
  ) {
    const now = new Date();
    this.requestTimestamp = now.toISOString();

    this.origin = origin;
    this.destination = destination;
    this.via = via;

    this.params = params ??= {};
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
      includeLegProjection: true,
      includeIntermediateStops: true,
    };

    return requestParams;
  }

  public static initWithResponseMock(mockXML: string) {
    // TODO  to be implemented
    // TODO - add also gist URL, url
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

export class Trip implements TripSchema {
  public id: string;
  public duration: string;
  public startTime: string;
  public endTime: string;
  public transfers: number;
  public leg: LegSchema[];

  constructor(
    id: string, 
    duration: string,
    startTime: string,
    endTime: string,
    transfers: number,
    leg: LegSchema[],
  ) {
    this.id = id;
    this.duration = duration;
    this.startTime = startTime;
    this.endTime = endTime;
    this.transfers = transfers;
    this.leg = leg;
  }

  public static initWithTripXML(tripXML: string): Trip {
    const parentTagName = 'TripResult';
    const parsedTrip = parseXML<{ trip: TripSchema }>(tripXML, parentTagName);
    const trip = new Trip(parsedTrip.trip.id, parsedTrip.trip.duration, parsedTrip.trip.startTime, parsedTrip.trip.endTime, parsedTrip.trip.transfers, parsedTrip.trip.leg);

    return trip;
  }
}

export class LocationInformationRequest implements LocationInformationRequestSchema {
  public requestTimestamp: string;
  public initialInput?: InitialInputSchema;
  public placeRef?: PlaceRef;
  public restrictions?: LIR_RequestParamsSchema;

  constructor() {
    const now = new Date();
    this.requestTimestamp = now.toISOString();
    this.initialInput = undefined; // order matters in the request XML, thats why it needs explicit declaration
    this.placeRef = undefined;
    this.restrictions = {
      type: [],
      numberOfResults: 10,
    };
  }

  public static initWithLocationName(name: string): LocationInformationRequest {
    const request = new LocationInformationRequest();

    request.initialInput = {
      name: name,
    };

    return request;
  }

  public static initWithPlaceRef(placeRefS: string): LocationInformationRequest {
    const request = new LocationInformationRequest();
    request.placeRef = PlaceRef.initWithStopRefAndName(placeRefS, 'n/a');

    return request;
  }

  public static initWithBBOX(bboxData: string | number[], placeType: PlaceTypeEnum[]): LocationInformationRequest {
    const bboxDataParts: number[] = (() => {
      if (Array.isArray(bboxData)) {
        return bboxData;
      }

      return (bboxData as string).split(',').map(el => Number(el));
    })();

    const request = new LocationInformationRequest();

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
      type: placeType
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

export class PlaceResult implements PlaceResultSchema {
  public place: PlaceSchema;
  public complete: boolean;
  public probability?: number;

  constructor(place: PlaceSchema, complete: boolean, probability?: number) {
    this.place = place;
    this.complete = complete;
    this.probability = probability;
  }

  public static initWithXML(nodeXML: string): PlaceResult {
    const parentTagName = 'PlaceResult';
    const parsedObj = parseXML<{ placeResult: PlaceResultSchema }>(nodeXML, parentTagName);
    const placeResult = new PlaceResult(parsedObj.placeResult.place, parsedObj.placeResult.complete, parsedObj.placeResult.probability);

    return placeResult;
  }
}

export class StopEventRequest implements StopEventRequestSchema {
  public requestTimestamp: string;
  public location: SER_RequestLocationSchema;
  public params?: SER_RequestParamsSchema;

  constructor(location: SER_RequestLocationSchema, params: SER_RequestParamsSchema | undefined = undefined) {
    const now = new Date();
    this.requestTimestamp = now.toISOString();
    
    this.location = location;
    this.params = params;
  }

  private static DefaultRequestParams(): SER_RequestParamsSchema {
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

export class StopEventResult implements StopEventResultSchema {
  public id: string;
  public stopEvent: StopEventSchema;

  constructor(id: string, stopEvent: StopEventSchema) {
    this.id = id;
    this.stopEvent = stopEvent;
  }

  public static initWithXML(nodeXML: string): StopEventResult {
    const parentTagName = 'StopEventResult';
    const parsedObj = parseXML<{ stopEventResult: StopEventResultSchema }>(nodeXML, parentTagName);
    const result = new StopEventResult(parsedObj.stopEventResult.id, parsedObj.stopEventResult.stopEvent);

    return result;
  }
}
