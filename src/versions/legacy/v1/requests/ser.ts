import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../../sdk';

import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';
import { RequestHelpers } from '../../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../../types/_all';

import { OJPv1_StopEventRequestResponse } from '../../../../types/response';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../../constants';

import { SharedStopEventRequest } from '../../../current/requests/ser.shared';

/**
 * StopEventRequest (SER) class for OJP 1.0
 *
 * Instances are created via static methods below. Direct construction is intentionally disabled.
 * 
 * - `initWithPlaceRefAndDate` - use PlaceRef ids + date
 *
 * @category Request OJP 1.0
 */
export class OJPv1_StopEventRequest extends SharedStopEventRequest <{ fetchResponse: OJPv1_StopEventRequestResponse }> {
  /**
   * The payload object that gets serialized to XML for the request
   * 
   */
  public payload: OJP_Types.OJPv1_StopEventRequestSchema;

  protected constructor(location: OJP_Types.OJPv1_PlaceContextSchema, params: OJP_Types.SER_RequestParamsSchema | undefined = undefined) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      location: location,
      params: params,
    }
  }

  /**
   * Used by BaseRequest methods (i.e. `initWithRequestMock`, `initWithResponseMock`
   * 
   * @hidden
   */
  public static Default() {
    const date = new Date();
    const location: OJP_Types.OJPv1_PlaceContextSchema = {
      placeRef: {
        stopPlaceRef: '8507000',
        locationName: {
          text: 'n/a'
        }
      },
      depArrTime: date.toISOString(),
    };

    const requestParams = SharedStopEventRequest.DefaultRequestParams('1.0');
    
    const request = new OJPv1_StopEventRequest(location, requestParams);
    
    return request;
  }

  /**
   * Creates a new StopEventRequest with the given place reference and date
   *
   * @param placeRefS The stop point reference ID (e.g. "8507000" for Bern)
   * @param date The date and time for the stop event request (defaults to current date/time)
   *
   * @group Initialization
   */
  public static initWithPlaceRefAndDate(placeRefS: string, date: Date = new Date()) {
    const location: OJP_Types.OJPv1_PlaceContextSchema = {
      placeRef: {
        stopPlaceRef: placeRefS,
        locationName: {
          text: 'n/a'
        }
      },
      depArrTime: date.toISOString(),
    };

    const params = SharedStopEventRequest.DefaultRequestParams('1.0');

    const request = new OJPv1_StopEventRequest(location, params);

    return request;
  }

  /**
   * Builds the XML request string for the SER
   *
   * @param language The language to use for the request (e.g. "en", "de")
   * @param requestorRef The requestor reference identifier
   * @param xmlConfig XML configuration options for building the request, default {@link XML_BuilderConfigOJPv1} OJP 1.0
   * @returns A formatted XML string representing the Location Information Request
   */
  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    this.payload.requestTimestamp = RequestHelpers.computeRequestTimestamp();

    const requestOJP: OJP_Types.OJPv1_StopEventRequestOJP = {
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

  protected override async _fetchResponse(sdk: SDK<'1.0'>): Promise<OJPv1_StopEventRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;

    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.OJPv1_StopEventResponseOJP }>(responseXML, sdk.version);
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPStopEventDelivery;

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
