import * as OJP_Types from 'ojp-shared-types';

import { Language, RequestInfo, XML_Config } from "../types/_all";
import { Place, PlaceRef, Trip } from './ojp';
import { OJPv1_Helpers } from '../helpers/ojp-v1';
import { buildRootXML } from "../helpers/xml/builder";
import { DefaultXML_Config } from "../constants";
import { DateHelpers } from '../helpers';

type EndpointType = 'origin' | 'destination' | 'both';

class BaseRequest {
  public requestInfo: RequestInfo;

  public mockRequestXML: string | null;
  public mockResponseXML: string | null;

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
      individualTransportOption: [],
    };
    const destination: OJP_Types.PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords('8507000', 'Bern'),
      individualTransportOption: [],
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
      individualTransportOption: [],
    };
    const destination: OJP_Types.PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords(destinationPlaceRefS),
      individualTransportOption: [],
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

  public setPublicTransportRequest(motFilter: OJP_Types.VehicleModesOfTransportEnum[] | null = null) {
    if (!this.params) {
      return;
    }

    this.params.modeAndModeOfOperationFilter = undefined;
    if ((motFilter !== null) && (motFilter.length > 0)) {
      this.params.modeAndModeOfOperationFilter = [
        {
          exclude: false,
          ptMode: motFilter,
          personalMode: [],
        }
      ];
    }
  }

  public disableLinkProkection() {
    if (!this.params) {
      return;
    }

    this.params.includeLegProjection = false;
  }

  public enableLinkProkection() {
    if (!this.params) {
      return;
    }

    this.params.includeLegProjection = true;
  }

  public setCarRequest() {
    if (!this.params) {
      return;
    }

    this.params.numberOfResults = 0;

    this.params.modeAndModeOfOperationFilter = [
      {
        ptMode: [],
        personalMode: [],
        railSubmode: 'vehicleTunnelTransportRailService',
        waterSubmode: 'localCarFerry',
      }
    ];
  }

  public setMaxDurationWalkingTime(maxDurationMinutes: number | undefined = undefined, endpointType: EndpointType = 'both') {
    if (!maxDurationMinutes) {
      maxDurationMinutes = 30;
    }
    const maxDuration = 'PT' + maxDurationMinutes + 'M';

    const individualTransportOption: OJP_Types.IndividualTransportOptionSchema = {
      maxDuration: maxDuration,
      itModeAndModeOfOperation: {
        personalMode: 'foot',
        personalModeOfOperation: ['own'],
      }
    };

    if (endpointType === 'origin' || endpointType === 'both') {
      this.origin.individualTransportOption = [individualTransportOption];
    }

    if (endpointType === 'destination' || endpointType === 'both') {
      this.destination.individualTransportOption = [individualTransportOption];
    }
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

    const xmlS = buildRootXML(requestOJP, xmlConfig);

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
  
  private static Default(): LocationInformationRequest {
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

  public static initWithLocationName(name: string, placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10): LocationInformationRequest {
    const request = LocationInformationRequest.Default();

    request.initialInput = {
      name: name,
    };

    if (request.restrictions) {
      if (placeTypes.length > 0) {
        request.restrictions.type = placeTypes;
      }

      if (numberOfResults !== null) {
        request.restrictions.numberOfResults = numberOfResults;
      }
    }

    return request;
  }

  public static initWithPlaceRef(placeRefOrCoords: string, numberOfResults: number = 10): LocationInformationRequest {
    const request = LocationInformationRequest.Default();
    
    request.placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefOrCoords);

    if (request.restrictions) {
      request.restrictions.type = ['stop'];

      if (numberOfResults !== null) {
        request.restrictions.numberOfResults = numberOfResults;
      }
    }

    return request;
  }

  public static initWithBBOX(bboxData: string | number[], placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10): LocationInformationRequest {
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
      type: placeTypes,
      numberOfResults: numberOfResults,
    };

    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
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

    const xmlS = buildRootXML(requestOJP, xmlConfig);

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

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
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

    const xmlS = buildRootXML(requestOJP, xmlConfig);

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

  private static Default(): TripRefineRequest {
    const fakeTripResult = <OJP_Types.TripResultSchema>{};
    const params = TripRefineRequest.DefaultRequestParams();
    const request = new TripRefineRequest(fakeTripResult, params);

    return request;
  }

  public static initWithRequestMock(mockText: string): TripRefineRequest {
    const request = TripRefineRequest.Default();
    request.mockRequestXML = mockText;
    return request;
  }

  public static initWithResponseMock(mockText: string): TripRefineRequest {
    const request = TripRefineRequest.Default();
    request.mockResponseXML = mockText;
    return request;
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

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
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

    const xmlS = buildRootXML(requestOJP, xmlConfig);

    return xmlS;
  }
}

export class FareRequest extends BaseRequest implements OJP_Types.FareRequestsSchema {
  public requestTimestamp: string;
  public itemsWrapper: OJP_Types.FareRequestSchema[];

  private constructor(requestTimestamp: string, items: OJP_Types.FareRequestSchema[]) {
    super();
    this.requestTimestamp = requestTimestamp;
    this.itemsWrapper = items;
  }

  private static DefaultRequestParams(): OJP_Types.FareRequestParamsSchema {
    const params: OJP_Types.FareRequestParamsSchema = {
      fareAuthorityFilter: ['ch:1:NOVA'],
      passengerCategory: ['Adult'],
      travelClass: 'second',
      traveller: [
        {
          age: 25,
          passengerCategory: 'Adult',
          entitlementProducts: {
            entitlementProduct: [
              {
                fareAuthorityRef: 'ch:1:NOVA',
                entitlementProductRef: 'HTA',
                entitlementProductName: 'Halbtax-Abonnement',
              }
            ]
          }
        }
      ],
    };

    return params;
  }

  private static Default(): FareRequest {
    const now = new Date();
    const requestTimestamp = now.toISOString();

    const request = new FareRequest(requestTimestamp, []);
    return request;
  }

  public static initWithRequestMock(mockText: string): FareRequest {
    const request = FareRequest.Default();
    request.mockRequestXML = mockText;
    return request;
  }

  public static initWithResponseMock(mockText: string): FareRequest {
    const request = FareRequest.Default();
    request.mockResponseXML = mockText;
    return request;
  }

  private static initWithOJPv1Trips(trips: OJP_Types.OJPv1_TripSchema[]): FareRequest {
    trips.map(tripV1 => {
      OJPv1_Helpers.cleanTripForFareRequest(tripV1);
    });

    const now = new Date();
    const requestTimestamp = now.toISOString();

    const fareRequests: OJP_Types.FareRequestSchema[] = [];
    trips.forEach(trip => {
      const fareRequest: OJP_Types.FareRequestSchema = {
        requestTimestamp: requestTimestamp,
        tripFareRequest: {
          trip: trip,
        },
        params: FareRequest.DefaultRequestParams(),
      };

      fareRequests.push(fareRequest);
    });

    const request = new FareRequest(requestTimestamp, fareRequests);
    return request;
  }

  public static initWithOJPv2Trips(trips: OJP_Types.TripSchema[]): FareRequest {
    const newTrips: OJP_Types.OJPv1_TripSchema[] = [];
    trips.forEach(trip => {
      const tripV1 = OJPv1_Helpers.convertOJPv2Trip_to_v1Trip(trip);
      newTrips.push(tripV1);
    });

    const request = FareRequest.initWithOJPv1Trips(newTrips);
    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config = DefaultXML_Config): string {
    const requestOJP: OJP_Types.FareRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: requestorRef,
          OJPFareRequest: this.itemsWrapper,
        }
      },
    };

    if (xmlConfig.ojpVersion !== '1.0') {
      console.error('FareRequest.buildRequestXML() error - v1 XML_Config is missing');
    }

    const xmlS = buildRootXML(requestOJP, xmlConfig, (objTransformed => {
      const siriPrefix = xmlConfig.defaultNS !== 'siri' ? 'siri:' : '';
      const ojpPrefix = xmlConfig.defaultNS !== 'ojp' ? 'ojp:' : '';

      // Hack to patch the Service.OperatorRef
      //   - in OJP1 is under ojp: namespace
      //   - value needs a prefix ojp: otherwise FareService throws an error
      //    -> ojp:11
      const fareRequests = objTransformed[siriPrefix + 'OJPRequest'][siriPrefix + 'ServiceRequest'][ojpPrefix + 'OJPFareRequest'] as any[];
      fareRequests.forEach(fareRequest => {
        const trip = fareRequest[ojpPrefix + 'TripFareRequest'][ojpPrefix + 'Trip'];
        (trip[ojpPrefix + 'TripLeg'] as any[]).forEach(leg => {
          if (ojpPrefix + 'TimedLeg' in leg) {
            const service = leg[ojpPrefix + 'TimedLeg'][ojpPrefix + 'Service'];
            service[ojpPrefix + 'OperatorRef'] = 'ojp:' +  service[siriPrefix + 'OperatorRef'];
            delete service[siriPrefix + 'OperatorRef'];
          }
        });
      });
    }));

    return xmlS;
  }
}

export class TripInfoRequest extends BaseRequest implements OJP_Types.TIR_RequestSchema {
  public requestTimestamp: string;
  public journeyRef: string;
  public operatingDayRef: string;
  public params?: OJP_Types.TIR_RequestParamsSchema;

  private constructor(journeyRef: string, operatingDayRef: string, params?: OJP_Types.TIR_RequestParamsSchema) {
    super();

    const now = new Date();
    this.requestTimestamp = now.toISOString();
    
    this.journeyRef = journeyRef;
    this.operatingDayRef = operatingDayRef;
    this.params = params;
  }

  private static DefaultRequestParams(): OJP_Types.TIR_RequestParamsSchema {
    const params: OJP_Types.TIR_RequestParamsSchema = {
      includeCalls: true,
      includeService: true,
      includeTrackProjection: false,
      includePlacesContext: true,
      includeSituationsContext: true,
    };

    return params;
  }

  private static Default(): TripInfoRequest {
    const request = new TripInfoRequest('n/a', 'n/a', TripInfoRequest.DefaultRequestParams());
    return request;
  }

  public static initWithRequestMock(mockText: string): TripInfoRequest {
    const request = TripInfoRequest.Default();
    request.mockRequestXML = mockText;
    return request;
  }

  public static initWithResponseMock(mockText: string): TripInfoRequest {
    const request = TripInfoRequest.Default();
    request.mockResponseXML = mockText;
    return request;
  }

  public static initWithJourneyRef(journeyRef: string, journeyDate: Date = new Date()): TripInfoRequest {
    const operatingDayRef = DateHelpers.formatDate(journeyDate).substring(0, 10);

    const params = TripInfoRequest.DefaultRequestParams();
    const request = new TripInfoRequest(journeyRef, operatingDayRef, params);
    
    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config) {
    if (xmlConfig.ojpVersion === '1.0') {
      this.patchV1();
    }

    const requestOJP: OJP_Types.TIR_RequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language,
          },
          requestTimestamp: this.requestTimestamp,
          requestorRef: requestorRef,
          OJPTripInfoRequest: this,
        },
      },
    };

    const xmlS = buildRootXML(requestOJP, xmlConfig);

    return xmlS;
  }

  public enableTrackProjection() {
    if (this.params) {
      this.params.includeTrackProjection = true;
    }
  }

  // disable params that are not available on v1
  private patchV1() {
    if (this.params) {
      this.params.includeSituationsContext = undefined;
    }
  }
}
