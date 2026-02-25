import * as OJP_Types from 'ojp-shared-types';

import { SDK } from "../../../../sdk";

import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';
import { DateHelpers } from '../../../../helpers/date-helpers';
import { RequestHelpers } from "../../../../helpers/request-helpers";

import { Language, XML_Config } from '../../../../types/_all';

import { OJPv1_TripInfoRequestResponse } from "../../../../types/response";
import { SharedTripInfoRequest } from '../../../current/requests/tir.shared';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../../constants';

/**
 * TripInfoRequest (TIR) class for OJP 1.0
 *
 * Instances are created via static methods below. Direct construction is intentionally disabled.
 * 
 * - `initWithJourneyRef` - use journey reference and date
 *
 * @category Request OJP 1.0
 */
export class OJPv1_TripInfoRequest extends SharedTripInfoRequest<{ fetchResponse: OJPv1_TripInfoRequestResponse }> {
  /**
   * The payload object that gets serialized to XML for the request
   * 
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

    // OJP 2.0 TIR request XML can be used also for OJP 1.0
    //    except for following params which need to be removed / unset
    if (this.payload.params) {
      // IncludeSituationsContext is only in 2.0, in 1.0 will return in 400 error on server
      this.payload.params.includeSituationsContext = undefined;
    }
  }

  /**
   * Used by BaseRequest methods (i.e. `initWithRequestMock`, `initWithResponseMock`
   * 
   * @hidden
   */
  public static Default() {
    const request = new OJPv1_TripInfoRequest('n/a', 'n/a', SharedTripInfoRequest.DefaultRequestParams());
    return request;
  }

  /**
   * Creates a new TripInfoRequest with the given journey reference and date
   *
   * @param journeyRef The journey reference ID (e.g. "ch:1:sjyid:100001:2179-001")
   * @param journeyDate The date of the journey (defaults to current date)
   *
   * @group Initialization
   */
  public static initWithJourneyRef(journeyRef: string, journeyDate: Date = new Date()) {
    const operatingDayRef = DateHelpers.formatDate(journeyDate).substring(0, 10);

    const params = OJPv1_TripInfoRequest.DefaultRequestParams();
    const request = new OJPv1_TripInfoRequest(journeyRef, operatingDayRef, params);
    
    return request;
  }

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
   * @param xmlConfig XML configuration options for building the request, default {@link XML_BuilderConfigOJPv1} OJP 1.0
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

  protected override async _fetchResponse(sdk: SDK<'1.0'>): Promise<OJPv1_TripInfoRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;
    
    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.OJPv1_TripInfoResponseOJP }>(responseXML, sdk.version);
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
