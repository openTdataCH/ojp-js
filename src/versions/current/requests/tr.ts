import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../sdk';

import { buildRootXML } from '../../../helpers/xml/builder';
import { parseXML } from '../../../helpers/xml/parser';
import { RequestHelpers } from '../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../types/_all';

import { TripRequestResponse } from '../../../types/response';
import { Place, PlaceRef } from '../../../models/ojp';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../constants';

import { EndpointType, SharedTripRequest } from './tr.shared';

export class TripRequest extends SharedTripRequest<{ fetchResponse: TripRequestResponse }> {
  public payload: OJP_Types.TripRequestSchema;

  protected constructor(
    origin: OJP_Types.PlaceContextSchema, 
    destination: OJP_Types.PlaceContextSchema, 
    via: OJP_Types.ViaPointSchema[] = [],
    
    params: OJP_Types.TripParamsSchema | null = null, 
  ) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      origin: origin,
      destination: destination,
      via: via,
      params: params ??= {},
    };
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

  // Used by Base.initWithRequestMock / initWithResponseMock
  public static Default() {
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

  public static initWithPlaceRefsOrCoords(originPlaceRefS: string, destinationPlaceRefS: string) {
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

  public static initWithPlaces(origin: Place, destination: Place) {
    const originPlaceRefS = origin.asStopPlaceRefOrCoords();
    const destinationPlaceRefS = destination.asStopPlaceRefOrCoords();

    const request = TripRequest.initWithPlaceRefsOrCoords(originPlaceRefS, destinationPlaceRefS);
    return request;
  }

  public setArrivalDatetime(newDatetime: Date = new Date()) {
    delete(this.payload.origin.depArrTime);
    this.payload.destination.depArrTime = newDatetime.toISOString();
  }

  public setDepartureDatetime(newDatetime: Date = new Date()) {
    delete(this.payload.destination.depArrTime);
    this.payload.origin.depArrTime = newDatetime.toISOString();
  }

  public setPublicTransportRequest(motFilter: OJP_Types.VehicleModesOfTransportEnum[] | null = null) {
    if (!this.payload.params) { return; }

    this.payload.params.modeAndModeOfOperationFilter = undefined;
    if ((motFilter !== null) && (motFilter.length > 0)) {
      this.payload.params.modeAndModeOfOperationFilter = [
        {
          exclude: false,
          ptMode: motFilter,
          personalMode: [],
        }
      ];
    }
  }

  public disableLinkProkection() {
    if (!this.payload.params) {
      return;
    }

    this.payload.params.includeLegProjection = false;
  }

  public enableLinkProkection() {
    if (!this.payload.params) {
      return;
    }

    this.payload.params.includeLegProjection = true;
  }

  public setCarRequest() {
    if (!this.payload.params) { return; }

    this.payload.params.numberOfResults = 0;

    this.payload.params.modeAndModeOfOperationFilter = [
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
      this.payload.origin.individualTransportOption = [individualTransportOption];
    }

    if (endpointType === 'destination' || endpointType === 'both') {
      this.payload.destination.individualTransportOption = [individualTransportOption];
    }
  }

  // https://vdvde.github.io/OJP/develop/documentation-tables/siri.html#type_siri__RailSubmodesOfTransportEnumeration
  public setRailSubmodes(railSubmodes: OJP_Types.RailSubmodeEnum | OJP_Types.RailSubmodeEnum[]) {
    if (!Array.isArray(railSubmodes)) {
      railSubmodes = [railSubmodes];
    }

    if (!this.payload.params) {
      return;
    }

    this.payload.params.modeAndModeOfOperationFilter = [];
    const modeFilters: OJP_Types.ModeFilterSchema[] = [];
    railSubmodes.forEach(railSubmode => {
      const modeFilter: OJP_Types.ModeFilterSchema = {
        exclude: false,
        ptMode: [],
        personalMode: [],
        railSubmode: railSubmode,
      };
      modeFilters.push(modeFilter);
    });

    this.payload.params.modeAndModeOfOperationFilter = modeFilters;
  }
  
  public setNumberOfResults(resultsNo: number | null): void {
    if (!this.payload.params) { return; }
    this.payload.params.numberOfResults = resultsNo ?? undefined;
  }
  public setNumberOfResultsAfter(resultsNo: number): void {
    if (!this.payload.params) { return; }
    this.payload.params.numberOfResultsAfter = resultsNo;
  }
  public setNumberOfResultsBefore(resultsNo: number): void {
    if (!this.payload.params) { return; }
    this.payload.params.numberOfResultsBefore = resultsNo;
  }

  private setEndpointDurationDistanceRestrictions(placeContext: OJP_Types.PlaceContextSchema, minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void {
    if ((minDuration === null) && (maxDuration === null) && (minDistance === null) && (maxDistance === null)) {
      return;
    }

    const transportOption: OJP_Types.IndividualTransportOptionSchema = {
      itModeAndModeOfOperation: {
        personalMode: 'foot',
        personalModeOfOperation: ['own'],
      },
    };

    if (minDuration !== null) {
      transportOption.minDuration = 'PT' + minDuration + 'M';
    }
    if (maxDuration !== null) {
      transportOption.maxDuration = 'PT' + maxDuration + 'M';
    }
    if (minDistance !== null) {
      transportOption.minDistance = minDistance;
    }
    if (maxDistance !== null) {
      transportOption.maxDistance = maxDistance;
    }

    placeContext.individualTransportOption = [transportOption];
  }

  public setOriginDurationDistanceRestrictions(minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void {
    const placeContext = this.payload.origin;
    this.setEndpointDurationDistanceRestrictions(placeContext, minDuration, maxDuration, minDistance, maxDistance);
  }

  public setDestinationDurationDistanceRestrictions(minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void {
    const placeContext = this.payload.destination;
    this.setEndpointDurationDistanceRestrictions(placeContext, minDuration, maxDuration, minDistance, maxDistance);
  }

  public setWalkSpeedDeviation(walkSpeedPercent: number): void {
    if (!this.payload.params) { return; }
    this.payload.params.walkSpeed = walkSpeedPercent;
  }

  public setViaPlace(place: Place, dwellTime: number | null): void {
    const placeRefS = place.asStopPlaceRefOrCoords();
    const placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefS);

    const viaPointSchema: OJP_Types.ViaPointSchema = {
      viaPoint: placeRef,
    };

    if (dwellTime !== null) {
      const dwellTimeS = 'PT' + dwellTime.toString() + 'M';
      viaPointSchema.dwellTime = dwellTimeS;
    }

    this.payload.via = [viaPointSchema];
  }

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    this.payload.requestTimestamp = RequestHelpers.computeRequestTimestamp();

    const requestOJP: OJP_Types.TripRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.payload.requestTimestamp,
          requestorRef: requestorRef,
          OJPTripRequest: this.payload,
        }
      },
    };

    const xmlS = buildRootXML(requestOJP, xmlConfig);

    return xmlS;
  }

  protected override async _fetchResponse(sdk: SDK<'2.0'>): Promise<TripRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;

    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.TripRequestResponseOJP }>(responseXML, sdk.version);
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPTripDelivery;

      if (response === undefined) {
        console.log(responseXML);
        throw new Error('Parse error');
      }

      return {
        ok: true,
        value: response,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}
