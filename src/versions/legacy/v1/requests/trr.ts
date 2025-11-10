import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../../sdk';

import { parseXML } from '../../../../helpers/xml/parser';
import { RequestHelpers } from '../../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../../types/_all';

import { TripRefineRequestResponse } from '../../../../types/response';
import { XML_ParserConfigOJPv1 } from '../../../../constants';

import { SharedTripRefineRequest } from '../../../current/requests/trr.shared';

// There is no TRR in OJP 1.0 - create a fake one 
export class FakeOJPv1_TripRefineRequest extends SharedTripRefineRequest<{ version: '1.0', fetchResponse: TripRefineRequestResponse }> {
  public payload: OJP_Types.TRR_RequestSchema;

  private constructor(tripResult: OJP_Types.TripResultSchema, refineParams?: OJP_Types.TRR_RequestParamsSchema) {
    super();

    throw new Error('No OJP types defined for TRR OJP 1.0');
  }

  // Used by Base.initWithRequestMock / initWithResponseMock
  private static Default() {
    const fakeTripResult = <OJP_Types.TripResultSchema>{};
    const request = new FakeOJPv1_TripRefineRequest(fakeTripResult);

    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    return '<Foo/>';
  }

  protected override async _fetchResponse(sdk: SDK<'1.0'>): Promise<TripRefineRequestResponse> {
    const responseXML = await RequestHelpers.computeResponse(this, sdk, XML_ParserConfigOJPv1);

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
