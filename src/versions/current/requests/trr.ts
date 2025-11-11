import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../sdk';

import { buildRootXML } from '../../../helpers/xml/builder';
import { parseXML } from '../../../helpers/xml/parser';
import { RequestHelpers } from '../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../types/_all';

import { TripRefineRequestResponse } from '../../../types/response';
import { Trip } from '../../../models/ojp';
import { DefaultXML_Config } from '../../../constants';

import { BaseRequest } from './base';

export class TripRefineRequest extends BaseRequest<{ version: '2.0', fetchResponse: TripRefineRequestResponse }> {
  public payload: OJP_Types.TRR_RequestSchema;

  private constructor(tripResult: OJP_Types.TripResultSchema, refineParams?: OJP_Types.TRR_RequestParamsSchema) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      refineParams: refineParams,
      tripResult: tripResult,
    };
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

  // Used by Base.initWithRequestMock / initWithResponseMock
  private static Default() {
    const fakeTripResult = <OJP_Types.TripResultSchema>{};
    // update fake
    const params = TripRefineRequest.DefaultRequestParams();
    const request = new TripRefineRequest(fakeTripResult, params);

    return request;
  }

  public static initWithTrip(trip: Trip) {
    const tripResult: OJP_Types.TripResultSchema = {
      id: trip.id,
      trip: trip,
    };

    const params = TripRefineRequest.DefaultRequestParams();
    const request = new TripRefineRequest(tripResult, params);
    
    return request;
  }

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
    const responseXML = await RequestHelpers.computeResponse(this, sdk, DefaultXML_Config);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.TRR_ResponseOJP }>(responseXML, 'OJP');
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPTripRefineDelivery;

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
