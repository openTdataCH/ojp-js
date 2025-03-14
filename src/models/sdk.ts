import { XMLBuilder } from "fast-xml-parser";

import { MapNS_Tags} from '../types/openapi/openapi-dependencies';

import { parseXML, transformKeys } from "../helpers/parser";
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

    public static initWithResponseMock(mockXML: string) {
    // TODO  to be implemented
    // TODO - add also gist URL, url
  }

  public static initWithPlaceRefsAndDate(originPlaceRefS: string, destinationPlaceRefS: string, date: Date = new Date()): TripRequest {
    const now = new Date();

    const origin: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName(originPlaceRefS, 'n/a'),
      depArrTime: date.toISOString(),
    };
    const destination: PlaceContextSchema = {
      placeRef: PlaceRef.initWithStopRefAndName(destinationPlaceRefS, 'n/a'),
    };

    const params = TripRequestParams.Default();

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

  public buildRequestXML(language: Language): string {
    const tripRequestOJP: TripRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language,
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: 'TBA.requestorRef',
          OJPTripRequest: this,
        },
      },
    };

    const tripRequestTransformed = transformKeys(tripRequestOJP, (key: string, path: string[]) => {
      // capitalize first letter
      let newKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      const parentKey = path.at(-1) ?? null;
      if (parentKey !== null) {
        const tagNS_Key = parentKey.replace(/^.*:/, '') + '.' + newKey;
        const tagNS = MapNS_Tags[tagNS_Key] ?? null;
  
        if (tagNS !== null) {
          newKey = tagNS + ':' + newKey;
        }
      }

      return newKey;
    }, ['OJP']);

    const options = {
      format: true, 
      ignoreAttributes: false,
      suppressEmptyNode: true,
    };
    const builder = new XMLBuilder(options);
    const xmlParts = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">',
      builder.build(tripRequestTransformed),
      '</OJP>',
    ];

    const xmlS = xmlParts.join('\n');

    return xmlS;
  }
}

export class TripRequestParams implements TripParamsSchema {
  public modeAndModeOfOperationFilter: ModeAndModeOfOperationFilterSchema[];
  
  public numberOfResults?: number;
  public numberOfResultsBefore?: number;
  public numberOfResultsAfter?: number;
  
  public useRealtimeData?: UseRealtimeDataEnum;
  
  public includeAllRestrictedLines?: boolean;
  public includeTrackSections?: boolean;
  public includeLegProjection?: boolean;
  public includeTurnDescription?: boolean;
  public includeIntermediateStops?: boolean;

  constructor() {
    this.modeAndModeOfOperationFilter = [];
  }

  public static Default(): TripRequestParams {
    const tripParams = new TripRequestParams();
    
    tripParams.numberOfResults = 5;
    delete(tripParams.numberOfResultsBefore);
    delete(tripParams.numberOfResultsAfter);

    tripParams.useRealtimeData = 'explanatory';

    tripParams.includeAllRestrictedLines = true;
    tripParams.includeTrackSections = true;
    tripParams.includeLegProjection = true;
    tripParams.includeTurnDescription = true;
    tripParams.includeIntermediateStops = true;

    return tripParams;
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

  public buildRequestXML(language: Language): string {
    const requestOJP: LocationInformationRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: 'TBA.requestorRef',
          OJPLocationInformationRequest: this,
        }
      },
    };

    const tripRequestTransformed = transformKeys(requestOJP, (key: string, path: string[]) => {
      // capitalize first letter
      let newKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      const parentKey = path.at(-1) ?? null;
      if (parentKey !== null) {
        const tagNS_Key = parentKey.replace(/^.*:/, '') + '.' + newKey;
        const tagNS = MapNS_Tags[tagNS_Key] ?? null;
  
        if (tagNS !== null) {
          newKey = tagNS + ':' + newKey;
        }
      }

      return newKey;
    }, ['OJP']);

    const options = {
      format: true, 
      ignoreAttributes: false,
      suppressEmptyNode: true,
    };
    const builder = new XMLBuilder(options);
    const xmlParts = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">',
      builder.build(tripRequestTransformed),
      '</OJP>',
    ];

    const xmlS = xmlParts.join('\n');

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
