import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../sdk';

import { buildRootXML } from '../../../helpers/xml/builder';
import { parseXML } from '../../../helpers/xml/parser';
import { DateHelpers } from '../../../helpers/date-helpers';
import { RequestHelpers } from '../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../types/_all';

import { TripInfoRequestResponse } from '../../../types/response';
import { SharedTripInfoRequest } from './tir.shared';
import { DefaultXML_Config } from '../../../constants';

export class TripInfoRequest extends SharedTripInfoRequest<{ version: '2.0', fetchResponse: TripInfoRequestResponse }> {
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

  // Used by Base.initWithRequestMock / initWithResponseMock
  private static Default() {
    const request = new TripInfoRequest('n/a', 'n/a', SharedTripInfoRequest.DefaultRequestParams());
    return request;
  }

  public static initWithJourneyRef(journeyRef: string, journeyDate: Date = new Date()) {
    const operatingDayRef = DateHelpers.formatDate(journeyDate).substring(0, 10);

    const params = TripInfoRequest.DefaultRequestParams();
    const request = new TripInfoRequest(journeyRef, operatingDayRef, params);
    
    return request;
  }

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
    const responseXML = await RequestHelpers.computeResponse(this, sdk, DefaultXML_Config);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.TripInfoResponseOJP }>(responseXML, 'OJP');
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPTripInfoDelivery;

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
