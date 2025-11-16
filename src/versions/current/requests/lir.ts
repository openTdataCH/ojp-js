import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../sdk';
import { buildRootXML } from '../../../helpers/xml/builder';
import { parseXML } from '../../../helpers/xml/parser';

import { PlaceRef } from '../../../models/ojp';
import { Language, XML_Config } from '../../../types/_all';

import { RequestHelpers } from '../../../helpers/request-helpers';

import { LocationInformationRequestResponse } from '../../../types/response';
import { SharedLocationInformationRequest } from './lir.shared';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../constants';

export class LocationInformationRequest extends SharedLocationInformationRequest<{ fetchResponse: LocationInformationRequestResponse }> {
  public payload: OJP_Types.LocationInformationRequestSchema;

  protected constructor(initialInput: OJP_Types.InitialInputSchema | undefined, placeRef: PlaceRef | undefined, restrictions: OJP_Types.LIR_RequestParamsSchema | undefined) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      initialInput: initialInput,
      placeRef: placeRef,
      restrictions: restrictions,
    };
  }

  public static Default() {
    const restrictions = SharedLocationInformationRequest.DefaultRestrictionParams();

    const request = new LocationInformationRequest(undefined, undefined, restrictions);

    return request;
  }

  public static initWithLocationName(name: string, placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10) {
    const request = LocationInformationRequest.Default();
    request.payload.initialInput = {
      name: name,
    };

    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, placeTypes, numberOfResults);
    }

    return request;
  }

  public static initWithPlaceRef(placeRefOrCoords: string, numberOfResults: number = 10) {
    const request = LocationInformationRequest.Default();
    
    request.payload.placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefOrCoords);

    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, ['stop'], numberOfResults);
    }

    return request;
  }

  public static initWithBBOX(bboxData: string | number[], placeTypes: OJP_Types.PlaceTypeEnum[] = [], numberOfResults: number = 10) {
    const request = LocationInformationRequest.Default();

    const geoRestriction = this.computeGeoRestriction(bboxData);
    if (geoRestriction) {
      request.payload.initialInput = {
        name: undefined,
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

    const requestOJP: OJP_Types.LocationInformationRequestOJP = {
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

  protected async _fetchResponse(sdk: SDK<'2.0'>): Promise<LocationInformationRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;

    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.LocationInformationRequestResponseOJP }>(responseXML, 'OJP');
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
