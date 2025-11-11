import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../../sdk';

import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';
import { RequestHelpers } from '../../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../../types/_all';

import { StopEventRequestResponse } from '../../../../types/response';
import { DefaultXML_Config } from '../../../../constants';

import { SharedStopEventRequest } from '../../../current/requests/ser.shared';

// TODO - StopEventRequestResponse is wrong, should be OJPv1_StopEventRequestResponse
export class OJPv1_StopEventRequest extends SharedStopEventRequest <{ version: '1.0', fetchResponse: StopEventRequestResponse }> {
  // TODO - adapt schema if needed
  public payload: OJP_Types.StopEventRequestSchema;

  protected constructor(location: OJP_Types.SER_RequestLocationSchema, params: OJP_Types.SER_RequestParamsSchema | undefined = undefined) {
    super();

    throw new Error('No OJP types defined for SER OJP 1.0');
  }

  // Used by Base.initWithRequestMock / initWithResponseMock
  public static Default() {
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

    const requestParams = SharedStopEventRequest.DefaultRequestParams();
    const request = new OJPv1_StopEventRequest(location, requestParams);
    
    return request;
  }

  public static initWithPlaceRefAndDate(placeRefS: string, date: Date = new Date()) {
    const location: OJP_Types.SER_RequestLocationSchema = {
      placeRef: {
        stopPointRef: placeRefS,
        name: {
          text: 'n/a'
        }
      },
      depArrTime: date.toISOString(),
    };

    const params = SharedStopEventRequest.DefaultRequestParams();

    const request = new OJPv1_StopEventRequest(location, params);

    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    this.payload.requestTimestamp = RequestHelpers.computeRequestTimestamp();

    // TODO - use the correct OJP v1.0 type
    const requestOJP: OJP_Types.SER_RequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.payload.requestTimestamp,
          requestorRef: requestorRef,
          OJPStopEventRequest: this.payload,
        }
      },
    };

    const xmlS = buildRootXML(requestOJP, xmlConfig);

    return xmlS;
  }

  // TODO - use the correct OJP1.0 type
  protected override async _fetchResponse(sdk: SDK<'1.0'>): Promise<StopEventRequestResponse> {
    const responseXML = await RequestHelpers.computeResponse(this, sdk, DefaultXML_Config);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.StopEventRequestResponseOJP }>(responseXML, 'OJP');
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPStopEventDelivery;

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
