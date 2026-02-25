import * as OJP_Types from 'ojp-shared-types';

import { SDK } from "../../../../sdk";

import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';
import { RequestHelpers } from "../../../../helpers/request-helpers";

import { Language, XML_Config } from '../../../../types/_all';

import { OJPv1_TripRequestResponse } from "../../../../types/response";
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../../constants';
import { Place, PlaceRef } from '../../../../models/ojp';

import { EndpointType, SharedTripRequest } from '../../../current/requests/tr.shared';

/**
 * TripRequest (TR) class for OJP 1.0
 *
 * Instances are created via static methods below. Direct construction is intentionally disabled.
 * 
 * - `initWithPlaceRefsOrCoords` - use place refs or literal coordinates (lat, lng) for origin, destinatio
 * - `initWithPlaces` - use Place OJP XSD schema objects
 *
 * @category Request OJP 1.0
 */
export class OJPv1_TripRequest extends SharedTripRequest<{ fetchResponse: OJPv1_TripRequestResponse }> {
  /**
   * The payload object that gets serialized to XML for the request (OJP v1)
   */
  public payload: OJP_Types.OJPv1_TripRequestSchema;

  protected constructor(
    origin: OJP_Types.OJPv1_PlaceContextSchema, 
    destination: OJP_Types.OJPv1_PlaceContextSchema, 
    via: OJP_Types.OJPv1_ViaPointSchema[] = [],
    
    params: OJP_Types.OJPv1_TripParamsSchema | null = null, 
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

  private static DefaultRequestParams(): OJP_Types.OJPv1_TripParamsSchema {
    const requestParams: OJP_Types.OJPv1_TripParamsSchema = {
      ptModeFilter: [],
      
      numberOfResults: 5,
      numberOfResultsBefore: undefined,
      numberOfResultsAfter: undefined,

      includeAllRestrictedLines: true,
      includeTrackSections: true,
      includeLegProjection: false,
      includeIntermediateStops: true,
    };

    return requestParams;
  }

  /**
   * Used by BaseRequest methods (i.e. `initWithRequestMock`, `initWithResponseMock`
   * 
   * @hidden
   */
  public static Default() {
    const date = new Date();
    const origin: OJP_Types.OJPv1_PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords('8503000', 'Zürich').asOJPv1Schema(),
      depArrTime: date.toISOString(),
    };
    const destination: OJP_Types.OJPv1_PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords('8507000', 'Bern').asOJPv1Schema(),
    };
    const params = OJPv1_TripRequest.DefaultRequestParams();

    const request = new OJPv1_TripRequest(origin, destination, [], params);
    return request;
  }

  /**
   * Initializes a TripRequest object with either place references or coordinates.
   * 
   * @param originPlaceRefS - The origin place reference string - place reference or coordinate literals (lat, lon WGS84)
   * @param destinationPlaceRefS - The destination place reference string - place reference or coordinate literals (lat, lon WGS84)
   * 
   * @group Initialization
  */
  public static initWithPlaceRefsOrCoords(originPlaceRefS: string, destinationPlaceRefS: string) {
    const origin: OJP_Types.OJPv1_PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords(originPlaceRefS).asOJPv1Schema(),
    };
    const destination: OJP_Types.OJPv1_PlaceContextSchema = {
      placeRef: PlaceRef.initWithPlaceRefsOrCoords(destinationPlaceRefS).asOJPv1Schema(),
    };

    const params = OJPv1_TripRequest.DefaultRequestParams();

    const request = new OJPv1_TripRequest(origin, destination, [], params);
    request.setDepartureDatetime();

    return request;
  }

  /**
   * Initializes a TripRequest object with Place OJP schema objects
   * 
   * @param origin - The origin place
   * @param destination - The destination place
   * 
   * @group Initialization
  */
  public static initWithPlaces(origin: Place, destination: Place) {
    const originPlaceRefS = origin.asStopPlaceRefOrCoords();
    const destinationPlaceRefS = destination.asStopPlaceRefOrCoords();

    const request = OJPv1_TripRequest.initWithPlaceRefsOrCoords(originPlaceRefS, destinationPlaceRefS);
    return request;
  }

  /**
   * Updates arrival at destination datetime in the request payload
   * 
   * @group Request Payload Modification
   */
  public setArrivalDatetime(newDatetime: Date = new Date()) {
    delete(this.payload.origin.depArrTime);
    this.payload.destination.depArrTime = newDatetime.toISOString();
  }

  /**
   * Updates departure from origin datetime in the request payload
   * 
   * @group Request Payload Modification
   */
  public setDepartureDatetime(newDatetime: Date = new Date()) {
    delete(this.payload.destination.depArrTime);
    this.payload.origin.depArrTime = newDatetime.toISOString();
  }

  /**
   * @group Request Payload Modification
   */
  public disableLinkProkection() {
    if (!this.payload.params) {
      return;
    }

    this.payload.params.includeLegProjection = false;
  }

  /**
   * @group Request Payload Modification
   */
  public enableLinkProkection() {
    if (!this.payload.params) {
      return;
    }

    this.payload.params.includeLegProjection = true;
  }

  /**
   * @group Request Payload Modification
   */
  public setPublicTransportRequest(motFilter: OJP_Types.VehicleModesOfTransportEnum[] | null): void {
    if (!this.payload.params) { return; }

    this.payload.params.ptModeFilter = undefined;
    if ((motFilter !== null) && (motFilter.length > 0)) {
      this.payload.params.ptModeFilter = [
        {
          exclude: false,
          ptMode: motFilter,
          personalMode: [],
        }
      ];
    }
  }

  /**
   * @group Request Payload Modification
   */
  public setCarRequest(): void {
    if (!this.payload.params) { return; }

    this.payload.params.itModesToCover = ['self-drive-car'];
  }

  /**
   * This modifier works only in OJP 2.0
   * 
   * @group Request Payload Modification
   */
  public setRailSubmodes(railSubmodes: OJP_Types.RailSubmodeEnum | OJP_Types.RailSubmodeEnum[]): void {

  }

  /**
   * This modifier works only in OJP 2.0
   * 
   * @group Request Payload Modification
   */
  public setMaxDurationWalkingTime(maxDurationMinutes: number | undefined, endpointType: EndpointType): void {

  }

  /**
   * @group Request Payload Modification
   */
  public setNumberOfResults(resultsNo: number | null): void {
    if (!this.payload.params) { return; }
    this.payload.params.numberOfResults = resultsNo ?? undefined;
  }
  /**
   * @group Request Payload Modification
   */
  public setNumberOfResultsAfter(resultsNo: number): void {
    if (!this.payload.params) { return; }
    this.payload.params.numberOfResultsAfter = resultsNo;
  }
  /**
   * @group Request Payload Modification
   */
  public setNumberOfResultsBefore(resultsNo: number): void {
    if (!this.payload.params) { return; }
    this.payload.params.numberOfResultsBefore = resultsNo;
  }

  /**
   * This modifier works only in OJP 2.0
   * 
   * @group Request Payload Modification
   */
  public setOriginDurationDistanceRestrictions(minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void {

  }

  /**
   * This modifier works only in OJP 2.0
   * 
   * @group Request Payload Modification
   */
  public setDestinationDurationDistanceRestrictions(minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void {

  }

  /**
   * This modifier works only in OJP 2.0
   * 
   * @group Request Payload Modification
   */
  public setWalkSpeedDeviation(walkSpeedPercent: number): void {

  }

  /**
   * @group Request Payload Modification
   */
  public setViaPlace(place: Place, dwellTime: number | null): void {
    const placeRefS = place.asStopPlaceRefOrCoords();
    const placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefS).asOJPv1Schema();

    const viaPointSchema: OJP_Types.OJPv1_ViaPointSchema = {
      viaPoint: placeRef,
    };

    if (dwellTime !== null) {
      const dwellTimeS = 'PT' + dwellTime.toString() + 'M';
      viaPointSchema.dwellTime = dwellTimeS;
    }

    this.payload.via = [viaPointSchema];
  }

  /**
   * Builds the XML request string for the TR
   *
   * @param language The language to use for the request (e.g. "en", "de")
   * @param requestorRef The requestor reference identifier
   * @param xmlConfig XML configuration options for building the request, default {@link XML_BuilderConfigOJPv1} OJP 1.0
   * @returns A formatted XML string representing the Location Information Request
   */
  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    this.payload.requestTimestamp = RequestHelpers.computeRequestTimestamp();

    const requestOJP: OJP_Types.OJPv1_TripRequestOJP = {
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

  protected override async _fetchResponse(sdk: SDK<'1.0'>): Promise<OJPv1_TripRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;

    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.OJPv1_TripRequestResponseOJP }>(responseXML, sdk.version);
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
