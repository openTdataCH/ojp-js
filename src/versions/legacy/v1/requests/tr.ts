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

export class OJPv1_TripRequest extends SharedTripRequest<{ fetchResponse: OJPv1_TripRequestResponse }> {
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

  // Used by Base.initWithRequestMock / initWithResponseMock
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
