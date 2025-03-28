import { buildXML, parseXML } from "../helpers/xml-helpers";
import { Language } from "../types/_all";

import { 
  PlaceContextSchema,
  GeoPositionSchema, PlaceRefSchema, InternationalTextSchema, 
  
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
  StopPointSchema,
  StopPlaceSchema,
  TopographicPlaceSchema,
  PointOfInterestSchema,
  AddressSchema,
  VehicleModesOfTransportEnum,
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

class BaseRequest {
  public mockRequestXML: string | null;
  public mockResponseXML: string | null;

  constructor() {
    this.mockRequestXML = null;
    this.mockResponseXML = null;
  }

  public static initWithRequestMock<T extends BaseRequest>(
    this: new (...args: any[]) => T,
    mockXML: string,
    ...args: ConstructorParameters<new (...args: any[]) => T>
  ): T {
    const instance = new this(...args);
    instance.mockRequestXML = mockXML;
    return instance;
  }

  public static initWithResponseMock<T extends BaseRequest>(
    this: new (...args: any[]) => T,
    mockXML: string,
    ...args: ConstructorParameters<new (...args: any[]) => T>
  ): T {
    const instance = new this(...args);
    instance.mockResponseXML = mockXML;
    return instance;
  }
}

export class TripRequest extends BaseRequest implements TripRequestSchema {
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

  public static Empty(): TripRequest {
    const date = new Date();
    const origin: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName('n/a stopRef', 'n/a stopName'),
      depArrTime: date.toISOString(),
    };
    const destination: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName('n/a stopRef', 'n/a stopName'),
    };
    const params = TripRequest.DefaultRequestParams();

    const request = new TripRequest(origin, destination, [], params);
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

export class LocationInformationRequest extends BaseRequest implements LocationInformationRequestSchema {
  public requestTimestamp: string;
  public initialInput?: InitialInputSchema;
  public placeRef?: PlaceRef;
  public restrictions?: LIR_RequestParamsSchema;

  constructor() {
    super();

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

  public static initWithBBOX(bboxData: string | number[], placeType: PlaceTypeEnum[], numberOfResults: number = 10): LocationInformationRequest {
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

type GeoPositionLike = GeoPositionSchema | number[] | string;
export class GeoPosition implements GeoPositionSchema {
  public longitude: number;
  public latitude: number;
  public properties: Record<string, any>;

  constructor(geoPositionArg: GeoPositionLike | number, optionalLatitude: number | null = null) {
    const invalidCoords: number[] = [Infinity, Infinity];
    const coords = (() => {
      if ((typeof geoPositionArg === 'number') && isNaN(geoPositionArg)) {
        return invalidCoords;
      }

      if ((typeof geoPositionArg === 'number') && (optionalLatitude !== null)) {
        const longitude = geoPositionArg;
        const latitude = optionalLatitude;
        return [longitude, latitude];
      }

      if (typeof geoPositionArg === 'string') {
        const stringParts = geoPositionArg.split(',');

        if (stringParts.length < 2) {
          return invalidCoords;
        }

        // string is of format longitude, latitude - GoogleMaps like
        const longitude = parseFloat(stringParts[1]);
        const latitude = parseFloat(stringParts[0]);
        return [longitude, latitude];
      }

      if (Array.isArray(geoPositionArg) && (geoPositionArg.length > 1)) {
        return geoPositionArg;
      }

      if (typeof geoPositionArg === 'object') {
        const longitude = (geoPositionArg as GeoPositionSchema).longitude;
        const latitude = (geoPositionArg as GeoPositionSchema).latitude;
        return [longitude, latitude];
      }

      return invalidCoords;
    })();

    this.longitude = parseFloat(coords[0].toFixed(6));
    this.latitude = parseFloat(coords[1].toFixed(6));
    this.properties = {};
  }

  public isValid() {
    return (this.longitude !== Infinity) && (this.latitude !== Infinity);
  }

  // From https://stackoverflow.com/a/27943
  public distanceFrom(pointB: GeoPosition): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (pointB.latitude - this.latitude) * Math.PI / 180;
    const dLon = (pointB.longitude - this.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.latitude * Math.PI / 180) * Math.cos(pointB.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; 
    const dMeters = Math.round(d * 1000);

    return dMeters;
  }

  public asLatLngString(roundCoords: boolean = true): string {
    let s = '';

    if (roundCoords) {
      s = this.latitude.toFixed(6) + ',' + this.longitude.toFixed(6);
    } else {
      s = this.latitude + ',' + this.longitude;
    }

    return s;
  }

  public asPosition(): number[] {
    const coords = [this.longitude, this.latitude];
    return coords;
  }
}

// TODO - make it genetic NearbyObject
interface NearbyPlace {
  distance: number
  object: Place 
}

export class Place implements PlaceSchema {
  public stopPoint?: StopPointSchema;
  public stopPlace?: StopPlaceSchema;
  public topographicPlace?: TopographicPlaceSchema;
  public pointOfInterest?: PointOfInterestSchema;
  public address?: AddressSchema;
  public name: InternationalTextSchema;
  public geoPosition: GeoPosition;
  public mode: VehicleModesOfTransportEnum[];

  public placeType: PlaceTypeEnum | null;

  constructor(stopPoint: StopPointSchema | undefined, stopPlace: StopPlaceSchema | undefined, topographicPlace: TopographicPlaceSchema | undefined, pointOfInterest: PointOfInterestSchema | undefined, address: AddressSchema | undefined, name: InternationalTextSchema, geoPosition: GeoPosition, mode: VehicleModesOfTransportEnum[]) {
    this.stopPoint = stopPoint;
    this.stopPlace = stopPlace;
    this.topographicPlace = topographicPlace;
    this.pointOfInterest = pointOfInterest;
    this.address = address;
    this.name = name;
    this.geoPosition = geoPosition;
    this.mode = mode;

    this.placeType = geoPosition.isValid() ? 'location' : null;
    if (stopPoint || stopPlace) {
      this.placeType = 'stop';
    }
    if (topographicPlace) {
      this.placeType = 'topographicPlace';
    }
    if (pointOfInterest) {
      this.placeType = 'poi';
    }
    if (address) {
      this.placeType = 'address';
    }
  }

  public static initWithCoords(geoPositionArg: GeoPositionLike | number, optionalLatitude: number | null = null): Place {
    const geoPosition = new GeoPosition(geoPositionArg, optionalLatitude);

    const name: InternationalTextSchema = {
      text: geoPosition.latitude + ',' + geoPosition.longitude
    };
    
    const place = new Place(undefined, undefined, undefined, undefined, undefined, name, geoPosition, []);

    return place;
  }

  public static Empty() {
    const name: InternationalTextSchema = {
      text: 'n/a Empty'
    };
    const geoPosition = new GeoPosition('0,0');
    const place = new Place(undefined, undefined, undefined, undefined, undefined, name, geoPosition, []);

    return place;
  }

  public findClosestPlace(otherPlaces: Place[]): NearbyPlace | null {
    const geoPositionA = this.geoPosition;

    let closestPlace: NearbyPlace | null = null;

    otherPlaces.forEach(locationB => {
      const geoPositionB = locationB.geoPosition;
      if (geoPositionB === null) {
        return;
      }

      const dAB = geoPositionA.distanceFrom(geoPositionB);
      if ((closestPlace === null) || (dAB < closestPlace.distance)) {
        closestPlace = {
          object: locationB,
          distance: dAB
        }
      }
    });

    return closestPlace;
  }
}

export class PlaceResult implements PlaceResultSchema {
  public place: Place;
  public complete: boolean;
  public probability?: number;

  constructor(place: Place, complete: boolean, probability?: number) {
    this.place = place;
    this.complete = complete;
    this.probability = probability;
  }

  public static initWithXML(nodeXML: string): PlaceResult {
    const parentTagName = 'PlaceResult';
    const parsedObj = parseXML<{ placeResult: PlaceResultSchema }>(nodeXML, parentTagName);
    
    const placeSchema = parsedObj.placeResult.place;
    const geoPosition = new GeoPosition(placeSchema.geoPosition);
    const place = new Place(placeSchema.stopPoint, placeSchema.stopPlace, placeSchema.topographicPlace, placeSchema.pointOfInterest, placeSchema.address, placeSchema.name, geoPosition, placeSchema.mode);

    const placeResult = new PlaceResult(place, parsedObj.placeResult.complete, parsedObj.placeResult.probability);

    return placeResult;
  }
}

export class StopEventRequest extends BaseRequest implements StopEventRequestSchema {
  public requestTimestamp: string;
  public location: SER_RequestLocationSchema;
  public params?: SER_RequestParamsSchema;

  constructor(location: SER_RequestLocationSchema, params: SER_RequestParamsSchema | undefined = undefined) {
    super();

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
