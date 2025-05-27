import * as OJP_Types from 'ojp-shared-types';

import { parseXML } from '../helpers/xml/parser';

import { GeoPosition, GeoPositionLike } from "./geoposition";

export class PlaceRef implements OJP_Types.PlaceRefSchema {
  public stopPointRef?: string;
  public stopPlaceRef?: string;
  public geoPosition?: OJP_Types.GeoPositionSchema;
  public name: OJP_Types.InternationalTextSchema;
  
  private constructor(name: OJP_Types.InternationalTextSchema) {
    this.stopPointRef = undefined;
    this.stopPlaceRef = undefined;
    this.geoPosition = undefined;
    this.name = name;
  }

  // TODO - introduce a PlaceRefOrCoordsLike type that handles
  //    - string (currently implemented)
  //    - PlaceRef (and /or Place)
  //    - GeoPosition (and /or GeoPositionLike)
  public static initWithPlaceRefsOrCoords(placeRefOrCoords: string, nameS: string | null = null): PlaceRef {
    const geoPosition = new GeoPosition(placeRefOrCoords);
    if (geoPosition.isValid()) {
      const nameText = nameS ?? geoPosition.asLatLngString();
      const placeRef = new PlaceRef({
        text: nameText,
      });

      placeRef.geoPosition = geoPosition;

      return placeRef;
    } else {
      const name: OJP_Types.InternationalTextSchema = {
        text: nameS ?? 'n/a',
      };
      const placeRef = new PlaceRef(name);
      placeRef.stopPlaceRef = placeRefOrCoords;
  
      return placeRef;
    }
  }
}

export class Trip implements OJP_Types.TripSchema {
  public rawXML: string;
  public id: string;
  public duration: string;
  public startTime: string;
  public endTime: string;
  public transfers: number;
  public leg: OJP_Types.LegSchema[];
  public cancelled?: boolean;
  public delayed?: boolean;
  public deviation?: boolean;
  public infeasible?: boolean;
  public unplanned?: boolean;

  private constructor(
    rawTrip: string,
    id: string, 
    duration: string,
    startTime: string,
    endTime: string,
    transfers: number,
    leg: OJP_Types.LegSchema[],
    cancelled?: boolean,
    delayed?: boolean,
    deviation?: boolean,
    infeasible?: boolean,
    unplanned?: boolean
  ) {
    this.rawXML = rawTrip;
    this.id = id;
    this.duration = duration;
    this.startTime = startTime;
    this.endTime = endTime;
    this.transfers = transfers;
    this.leg = leg;
    this.cancelled = cancelled;
    this.delayed = delayed;
    this.deviation = deviation;
    this.infeasible = infeasible;
    this.unplanned = unplanned;
  }

  public static initWithTripXML(rawXML: string): Trip {
    const parentTagName = 'TripResult';
    const parsedTrip = parseXML<{ trip: OJP_Types.TripSchema }>(rawXML, parentTagName);
    const trip = new Trip(
      rawXML,
      parsedTrip.trip.id,
      parsedTrip.trip.duration,
      parsedTrip.trip.startTime,
      parsedTrip.trip.endTime,
      parsedTrip.trip.transfers,
      parsedTrip.trip.leg,
      parsedTrip.trip.cancelled,
      parsedTrip.trip.delayed,
      parsedTrip.trip.deviation, 
      parsedTrip.trip.infeasible, 
      parsedTrip.trip.unplanned,
    );
    return trip;
  }
}

// TODO - make it genetic NearbyObject
interface NearbyPlace {
  distance: number
  object: Place 
}

export class Place implements OJP_Types.PlaceSchema {
  public stopPoint?: OJP_Types.StopPointSchema;
  public stopPlace?: OJP_Types.StopPlaceSchema;
  public topographicPlace?: OJP_Types.TopographicPlaceSchema;
  public pointOfInterest?: OJP_Types.PointOfInterestSchema;
  public address?: OJP_Types.AddressSchema;
  public name: OJP_Types.InternationalTextSchema;
  public geoPosition: GeoPosition;
  public mode: OJP_Types.PlaceModeStructureSchema[];

  public placeType: OJP_Types.PlaceTypeEnum | null;

  private constructor(stopPoint: OJP_Types.StopPointSchema | undefined, stopPlace: OJP_Types.StopPlaceSchema | undefined, topographicPlace: OJP_Types.TopographicPlaceSchema | undefined, pointOfInterest: OJP_Types.PointOfInterestSchema | undefined, address: OJP_Types.AddressSchema | undefined, name: OJP_Types.InternationalTextSchema, geoPosition: GeoPosition, mode: OJP_Types.PlaceModeStructureSchema[]) {
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

  public static initWithXMLSchema(placeSchema: OJP_Types.PlaceSchema): Place {
    const geoPosition = new GeoPosition(placeSchema.geoPosition);
    const place = new Place(placeSchema.stopPoint, placeSchema.stopPlace, placeSchema.topographicPlace, placeSchema.pointOfInterest, placeSchema.address, placeSchema.name, geoPosition, placeSchema.mode);
    return place;
  } 

  public static initWithCoords(geoPositionArg: GeoPositionLike | number, optionalLatitude: number | null = null): Place {
    const geoPosition = new GeoPosition(geoPositionArg, optionalLatitude);

    const name: OJP_Types.InternationalTextSchema = {
      text: geoPosition.latitude + ',' + geoPosition.longitude
    };
    
    const place = new Place(undefined, undefined, undefined, undefined, undefined, name, geoPosition, []);

    return place;
  }

  public static Empty() {
    const name: OJP_Types.InternationalTextSchema = {
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

  // used by TR
  //    TODO - logic should be added to Place.initWithPlaceRefsOrCoords
  public asStopPlaceRefOrCoords(): string {
    const stopPlaceRef = this.stopPlace?.stopPlaceRef ?? null;
    if (stopPlaceRef !== null) {
      return stopPlaceRef;
    }

    const coordsS = this.geoPosition.asLatLngString();

    return coordsS;
  }
}

export class PlaceResult implements OJP_Types.PlaceResultSchema {
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
    const parsedObj = parseXML<{ placeResult: OJP_Types.PlaceResultSchema }>(nodeXML, parentTagName);
    
    const placeSchema = parsedObj.placeResult.place;
    const place = Place.initWithXMLSchema(placeSchema);

    const placeResult = new PlaceResult(place, parsedObj.placeResult.complete, parsedObj.placeResult.probability);

    return placeResult;
  }
}

export class StopEventResult implements OJP_Types.StopEventResultSchema {
  public id: string;
  public stopEvent: OJP_Types.StopEventSchema;

  private constructor(id: string, stopEvent: OJP_Types.StopEventSchema) {
    this.id = id;
    this.stopEvent = stopEvent;
  }

  public static initWithXML(nodeXML: string): StopEventResult {
    const parentTagName = 'StopEventResult';
    const parsedObj = parseXML<{ stopEventResult: OJP_Types.StopEventResultSchema }>(nodeXML, parentTagName);
    const result = new StopEventResult(parsedObj.stopEventResult.id, parsedObj.stopEventResult.stopEvent);

    return result;
  }
}
