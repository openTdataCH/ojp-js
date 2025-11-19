import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../../sdk';
import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';

import { PlaceRef } from '../../../../models/ojp';
import { Language, XML_Config } from '../../../../types/_all';

import { RequestHelpers } from '../../../../helpers/request-helpers';

import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../../constants';

import { OJPv1_LocationInformationRequestResponse } from '../../../../types/response';
import { SharedLocationInformationRequest } from '../../../current/requests/lir.shared';

export class OJPv1_LocationInformationRequest extends SharedLocationInformationRequest<{ fetchResponse: OJPv1_LocationInformationRequestResponse }> {
  public payload: OJP_Types.OJPv1_LocationInformationRequestSchema;

  protected constructor(restrictions: OJP_Types.LIR_RequestParamsSchema) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      initialInput: undefined,
      placeRef: undefined,
      restrictions: restrictions,
    };
  }

  public static Default() {
    const restrictions = SharedLocationInformationRequest.DefaultRestrictionParams();
    const request = new OJPv1_LocationInformationRequest(restrictions);

    return request;
  }

  public static initWithLocationName(name: string, placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10) {
    const request = OJPv1_LocationInformationRequest.Default();

    request.payload.initialInput = {
      locationName: name,
    };

    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, placeTypes, numberOfResults);
    }

    return request;
  }

  public static initWithPlaceRef(placeRefOrCoords: string, numberOfResults: number = 10) {
    const request = OJPv1_LocationInformationRequest.Default();
    
    const placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefOrCoords);
    // following doesnt work, or at least TS compiler doesnt complain that locationName != name (as present in PlaceRef obj)
    // request.payload.placeRef = placeRef;
    // -> therefore set each property separately
    request.payload.placeRef = {
      stopPointRef: placeRef.stopPointRef,
      stopPlaceRef: placeRef.stopPlaceRef,
      geoPosition: placeRef.geoPosition,
      locationName: placeRef.name,
    };

    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, ['stop'], numberOfResults);
    }

    return request;
  }

  public static initWithBBOX(bboxData: string | number[], placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10) {
    const request = OJPv1_LocationInformationRequest.Default();

    const geoRestriction = this.computeGeoRestriction(bboxData);
    if (geoRestriction) {
      request.payload.initialInput = {
        locationName: undefined,
        geoRestriction: geoRestriction,
      };
    }
    
    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, placeTypes, numberOfResults);
    }

    return request;
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

  protected async _fetchResponse(sdk: SDK<'1.0'>): Promise<OJPv1_LocationInformationRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;
    
    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.OJPv1_LocationInformationRequestResponseOJP }>(responseXML, 'OJP');
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPLocationInformationDelivery;

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
