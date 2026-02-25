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

/**
 * LocationInformationRequest (LIR) class for OJP 1.0
 *
 * Instances are created via static methods below. Direct construction is intentionally disabled.
 * 
 * - `initWithLocationName` - use location name, i.e. `Bern`
 * - `initWithPlaceRef` - use place ref or literal coordinates (lat, lng)
 * - `initWithBBOX` - use bounding box to filter locations
 *
 * @category Request OJP 1.0
 */
export class OJPv1_LocationInformationRequest extends SharedLocationInformationRequest<{ fetchResponse: OJPv1_LocationInformationRequestResponse }> {
  /**
   * The payload object that gets serialized to XML for the request (OJP v1)
   */
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

  /**
   * Used by BaseRequest methods (i.e. `initWithRequestMock`, `initWithResponseMock`
   * 
   * @hidden
   */
  public static Default() {
    const restrictions = SharedLocationInformationRequest.DefaultRestrictionParams();
    const request = new OJPv1_LocationInformationRequest(restrictions);

    return request;
  }

  /**
   * Inits LIR with location name
   *
   * @param name string, location name
   * @param placeTypes `OJP_Types.PlaceTypeEnum` "stop" | "address" | "poi" | "location" | "topographicPlace"
   * @param numberOfResults maximum number of results to return (default: 10)
   * 
   * @group Initialization
   */
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

  /**
   * Inits LIR with place ref or literal coords
   *
   * @param placeRefOrCoords place reference or coordinates string (e.g. `ch:1:sloid:7000:4:7` or `46.94857,7.43683` (latitude, longitude in WGS84))
   * @param numberOfResults maximum number of results to return (default: 10)
   * 
   * @group Initialization
   */
  public static initWithPlaceRef(placeRefOrCoords: string, numberOfResults: number = 10) {
    const request = OJPv1_LocationInformationRequest.Default();
    
    const placeRef = PlaceRef.initWithPlaceRefsOrCoords(placeRefOrCoords);
    request.payload.placeRef = placeRef.asOJPv1Schema();

    if (request.payload.restrictions) {
      request.updateRestrictions(request.payload.restrictions, ['stop'], numberOfResults);
    }

    return request;
  }

  /**
   * Inits LIR with bounding box
   *
   * @param bboxData bounding box data as string ("minLon,minLat,maxLon,maxLat") or array [minLon, minLat, maxLon, maxLat]
   * @param placeTypes `OJP_Types.PlaceTypeEnum` "stop" | "address" | "poi" | "location" | "topographicPlace"
   * @param numberOfResults maximum number of results to return (default: 10)
   * 
   * @group Initialization
   */
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

  /**
   * Builds the XML request string for the LIR
   *
   * @param language The language to use for the request (e.g. "en", "de")
   * @param requestorRef The requestor reference identifier
   * @param xmlConfig XML configuration options for building the request, default {@link XML_BuilderConfigOJPv1} OJP 1.0
   * @returns A formatted XML string representing the Location Information Request
   */
  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config = XML_BuilderConfigOJPv1): string {
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
      const parsedObj = parseXML<{ OJP: OJP_Types.OJPv1_LocationInformationRequestResponseOJP }>(responseXML, sdk.version);
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
