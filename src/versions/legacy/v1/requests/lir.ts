import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../../sdk-new';
import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';

import { PlaceRef } from '../../../../models/ojp';
import { Language, XML_Config } from '../../../../types/_all';

import { RequestHelpers } from '../../../../helpers/request-helpers';

import { XML_BuilderConfigOJPv1 } from '../../../../constants';

import { OJPv1_LocationInformationRequestResponse } from '../../../../types/response';
import { SharedLocationInformationRequest } from '../../../current/requests/lir.shared';

export class OJPv1_LocationInformationRequest extends SharedLocationInformationRequest {
  public payload: OJP_Types.OJPv1_LocationInformationRequestSchema;

  private constructor(initialInput: OJP_Types.OJPv1_InitialInputSchema | undefined, placeRef: PlaceRef | undefined, restrictions: OJP_Types.LIR_RequestParamsSchema | undefined) {
    super();
    
    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      initialInput: initialInput,
      placeRef: placeRef,
      restrictions: restrictions,
    };
  }

  private static Default(): OJPv1_LocationInformationRequest {
    const initialInput: OJP_Types.OJPv1_InitialInputSchema = {
      locationName: undefined,
      geoRestriction: undefined,
    };
    const restrictions = SharedLocationInformationRequest.DefaultRestrictionParams();

    const request = new OJPv1_LocationInformationRequest(initialInput, undefined, restrictions);

    return request;
  }

  public static initWithRequestMock(mockText: string): OJPv1_LocationInformationRequest {
    const request = OJPv1_LocationInformationRequest.Default();
    request.mockRequestXML = mockText;
    return request;
  }

  public static initWithResponseMock(mockText: string): OJPv1_LocationInformationRequest {
    const request = OJPv1_LocationInformationRequest.Default();
    request.mockResponseXML = mockText;
    return request;
  }

  public static initWithLocationName(name: string, placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10): OJPv1_LocationInformationRequest {
    const request = OJPv1_LocationInformationRequest.Default();

    request.payload.initialInput = {
      locationName: name,
    };

    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, placeTypes, numberOfResults);
    }

    return request;
  }

  public static initWithPlaceRef(placeRefOrCoords: string, numberOfResults: number = 10): OJPv1_LocationInformationRequest {
    const request = OJPv1_LocationInformationRequest.Default();
    
    request.payload.placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefOrCoords);

    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, ['stop'], numberOfResults);
    }

    return request;
  }

  public static initWithBBOX(bboxData: string | number[], placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10): OJPv1_LocationInformationRequest {
    const request = OJPv1_LocationInformationRequest.Default();

    const geoRestriction = this.computeGeoRestriction(bboxData);
    if (geoRestriction) {
      request.payload.initialInput = {
        locationName: undefined,
        geoRestriction: geoRestriction,
      };
    }
    
    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, ['stop'], numberOfResults);
    }

    return request;
  }

  public async fetchResponse(sdk: SDK<'1.0'>): Promise<OJPv1_LocationInformationRequestResponse> {
    const responseXML = await RequestHelpers.computeResponse(this, sdk, XML_BuilderConfigOJPv1);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.OJPv1_LocationInformationRequestResponseOJP }>(responseXML, 'OJP');
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPLocationInformationDelivery;

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

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    this.payload.requestTimestamp = RequestHelpers.computeRequestTimestamp();

    const requestOJP: OJP_Types.OJPv1_LocationInformationRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: this.payload.requestTimestamp,
          requestorRef: requestorRef,
          OJPLocationInformationRequest: this.payload,
        }
      },
    };

    const xmlS = buildRootXML(requestOJP, xmlConfig);

    return xmlS;
  }
}
