import { parseXML } from "../helpers/xml/parser";

import { 
  GeoPositionSchema, PlaceRefSchema, InternationalTextSchema, 
  
  TripSchema,
  LegSchema,
  PlaceResultSchema,
  PlaceSchema,
  PlaceTypeEnum,
  StopEventResultSchema,
  StopEventSchema,
  StopPointSchema,
  StopPlaceSchema,
  TopographicPlaceSchema,
  PointOfInterestSchema,
  AddressSchema,
  VehicleModesOfTransportEnum,
} from '../types/openapi';

import { GeoPosition, GeoPositionLike } from "./geoposition";

export class PlaceRef implements PlaceRefSchema {
  public stopPointRef?: string;
  public stopPlaceRef?: string;
  public geoPosition?: GeoPositionSchema;
  public name: InternationalTextSchema;
  
  private constructor(name: InternationalTextSchema) {
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

export class Trip implements TripSchema {
  public id: string;
  public duration: string;
  public startTime: string;
  public endTime: string;
  public transfers: number;
  public leg: LegSchema[];

  private constructor(
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

  public static initWithXMLSchema(placeSchema: PlaceSchema): Place {
    const geoPosition = new GeoPosition(placeSchema.geoPosition);
    const place = new Place(placeSchema.stopPoint, placeSchema.stopPlace, placeSchema.topographicPlace, placeSchema.pointOfInterest, placeSchema.address, placeSchema.name, geoPosition, placeSchema.mode);
    return place;
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

  private constructor(place: Place, complete: boolean, probability?: number) {
    this.place = place;
    this.complete = complete;
    this.probability = probability;
  }

  public static initWithXML(nodeXML: string): PlaceResult {
    const parentTagName = 'PlaceResult';
    const parsedObj = parseXML<{ placeResult: PlaceResultSchema }>(nodeXML, parentTagName);
    
    const placeSchema = parsedObj.placeResult.place;
    const place = Place.initWithXMLSchema(placeSchema);

    const placeResult = new PlaceResult(place, parsedObj.placeResult.complete, parsedObj.placeResult.probability);

    return placeResult;
  }
}

export class StopEventResult implements StopEventResultSchema {
  public id: string;
  public stopEvent: StopEventSchema;

  private constructor(id: string, stopEvent: StopEventSchema) {
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
