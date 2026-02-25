import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../sdk';

import { buildRootXML } from '../../../helpers/xml/builder';
import { parseXML } from '../../../helpers/xml/parser';
import { RequestHelpers } from '../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../types/_all';

import { TripRefineRequestResponse } from '../../../types/response';
import { Trip } from '../../../models/ojp';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../constants';

import { BaseRequest } from './base';

/**
 * TripRefineRequest (TRR) class
 *
 * Instances are created via static methods below. Direct construction is intentionally disabled.
 * 
 * - `initWithTrip` - use a Trip OJP XSD schema to refine
 *
 * @category Request
 */
export class TripRefineRequest extends BaseRequest<{ fetchResponse: TripRefineRequestResponse }> {
  /**
   * The payload object that gets serialized to XML for the request
   * 
   * @see {@link https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__OJPTripRefineRequestStructure OJP TripRefineRequest XSD Schema}
   */
  public payload: OJP_Types.TRR_RequestSchema;

  protected constructor(tripResult: OJP_Types.TripResultSchema, refineParams?: OJP_Types.TRR_RequestParamsSchema) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      refineParams: refineParams,
      tripResult: tripResult,
    };
  }

  private static DefaultRequestParams(): OJP_Types.TRR_RequestParamsSchema {
    const params: OJP_Types.TRR_RequestParamsSchema = {
      includeLegProjection: true,
      includeTurnDescription: true,
      includeIntermediateStops: true,
    };

    return params;
  }

  /**
   * Used by BaseRequest methods (i.e. `initWithRequestMock`, `initWithResponseMock`
   * @hidden
   */
  public static Default() {
    const fakeTripResult = <OJP_Types.TripResultSchema>{};
    // update fake
    const params = TripRefineRequest.DefaultRequestParams();
    const request = new TripRefineRequest(fakeTripResult, params);

    return request;
  }

  /**
   * Creates a new TripRefineRequest with the given Trip OJP XSD Schema
   *
   * @param trip the trip to be refined as Trip OJP XSD Schema
   *
   * @group Initialization
   */
  public static initWithTrip(trip: Trip) {
    const tripResult: OJP_Types.TripResultSchema = {
      id: trip.id,
      trip: trip,
    };

    const params = TripRefineRequest.DefaultRequestParams();
    const request = new TripRefineRequest(tripResult, params);
    
    return request;
  }

  /**
   * Builds the XML request string for the TIR
   *
   * @param language The language to use for the request (e.g. "en", "de")
   * @param requestorRef The requestor reference identifier
   * @param xmlConfig XML configuration options for building the request, default {@link DefaultXML_Config} OJP 2.0
   * @returns A formatted XML string representing the Location Information Request
   */
  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    this.payload.requestTimestamp = RequestHelpers.computeRequestTimestamp();

    const requestOJP: OJP_Types.TRR_RequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.payload.requestTimestamp,
          requestorRef: requestorRef,
          OJPTripRefineRequest: this.payload,
        }
      },
    };

    const xmlS = buildRootXML(requestOJP, xmlConfig);

    return xmlS;
  }

  protected override async _fetchResponse(sdk: SDK<'2.0'>): Promise<TripRefineRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;

    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.TRR_ResponseOJP }>(responseXML, sdk.version);
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPTripRefineDelivery;

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
