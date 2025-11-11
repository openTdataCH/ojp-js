import * as OJP_Types from 'ojp-shared-types';

import { SDK } from "../../../../sdk";

import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';
import { RequestHelpers } from "../../../../helpers/request-helpers";

import { Language, XML_Config } from '../../../../types/_all';

import { TripRequestResponse } from "../../../../types/response";
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../../constants';
import { PlaceRef } from '../../../../models/ojp';

import { SharedTripRequest } from '../../../current/requests/tr.shared';

// TODO - TripRequestResponse is wrong, should be OJPv1_TripRequestResponse
export class OJPv1_TripRequest extends SharedTripRequest<{ version: '1.0', fetchResponse: TripRequestResponse }> {
  // TODO - adapt schema if needed
  public payload: OJP_Types.TripRequestSchema;

  protected constructor(
    origin: OJP_Types.PlaceContextSchema, 
    destination: OJP_Types.PlaceContextSchema, 
    via: OJP_Types.ViaPointSchema[] = [],
    
    params: OJP_Types.TripParamsSchema | null = null, 
  ) {
    super();

    throw new Error('No OJP types defined for TR OJP 1.0');
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
    const params = SharedTripRequest.DefaultRequestParams();

    const request = new OJPv1_TripRequest(origin, destination, [], params);
    return request;
  }

  // TODO - add the rest of the initializers

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    this.payload.requestTimestamp = RequestHelpers.computeRequestTimestamp();

    // TODO - should be OJPv1_TripRequestOJP
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

  // TODO - should be OJPv1_TripRequestResponse,  OJPv1_TripRequestResponseOJP
  protected override async _fetchResponse(sdk: SDK<'1.0'>): Promise<TripRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;

    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.TripRequestResponseOJP }>(responseXML, 'OJP');
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
