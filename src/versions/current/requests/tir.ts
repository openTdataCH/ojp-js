import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../sdk';

import { buildRootXML } from '../../../helpers/xml/builder';
import { parseXML } from '../../../helpers/xml/parser';
import { DateHelpers } from '../../../helpers/date-helpers';
import { RequestHelpers } from '../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../types/_all';

import { TripInfoRequestResponse } from '../../../types/response';
import { SharedTripInfoRequest } from './tir.shared';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../constants';

/**
 * TripInfoRequest (TIR) class
 *
 * Instances are created via static methods below. Direct construction is intentionally disabled.
 * 
 * - `initWithJourneyRef` - use journey reference and date
 *
 * @category Request
 */
export class TripInfoRequest extends SharedTripInfoRequest<{ fetchResponse: TripInfoRequestResponse }> {
  /**
   * The payload object that gets serialized to XML for the request
   * 
   * @see {@link https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__OJPTripInfoRequestStructure OJP TripInfoRequest XSD Schema}
   */
  public payload: OJP_Types.TIR_RequestSchema;

  protected constructor(journeyRef: string, operatingDayRef: string, params?: OJP_Types.TIR_RequestParamsSchema) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      journeyRef: journeyRef,
      operatingDayRef: operatingDayRef,
      params: params,
    };
  }

  /**
   * Used by BaseRequest methods (i.e. `initWithRequestMock`, `initWithResponseMock`
   * @hidden
   */
  public static Default() {
    const request = new TripInfoRequest('n/a', 'n/a', SharedTripInfoRequest.DefaultRequestParams());
    return request;
  }

  /**
   * Creates a new TripInfoRequest with the given journey reference and date
   *
   * @param journeyRef The journey reference ID (e.g. "ch:1:sjyid:100001:2179-001")
   * @param journeyDate The date of the journey (defaults to current date)
   * @returns A new TripInfoRequest instance
   *
   * @example
   * ```typescript
   * const request = TripInfoRequest.initWithJourneyRef('ch:1:sjyid:100001:2179-001');
   * const response = await request.fetch(sdk);
   * ```
   *
   * @group Initialization
   */
  public static initWithJourneyRef(journeyRef: string, journeyDate: Date = new Date()) {
    const operatingDayRef = DateHelpers.formatDate(journeyDate).substring(0, 10);

    const params = TripInfoRequest.DefaultRequestParams();
    const request = new TripInfoRequest(journeyRef, operatingDayRef, params);
    
    return request;
  }

  /**
   * Enables track projection in the request payload
   * 
   * This method modifies the request to include track projection data in the response.
   * When enabled, the response will contain additional information about the vehicle's
   * track and movement patterns.
   *
   * @example
   * ```typescript
   * const request = TripInfoRequest.initWithJourneyRef('ch:1:sjyid:100001:2179-001');
   * request.enableTrackProjection();
   
  * const response = await request.fetch(sdk);
   * ```
   *
   * @group Request Payload Modification
   */
  public enableTrackProjection() {
    if (this.payload.params) {
      this.payload.params.includeTrackProjection = true;
    }
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

    const requestOJP: OJP_Types.TIR_RequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.payload.requestTimestamp,
          requestorRef: requestorRef,
          OJPTripInfoRequest: this.payload,
        }
      },
    };

    const xmlS = buildRootXML(requestOJP, xmlConfig);

    return xmlS;
  }

  protected override async _fetchResponse(sdk: SDK<'2.0'>): Promise<TripInfoRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;

    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.TripInfoResponseOJP }>(responseXML, sdk.version);
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPTripInfoDelivery;

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
