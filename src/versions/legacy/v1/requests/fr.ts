import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../../sdk';

import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';
import { RequestHelpers } from '../../../../helpers/request-helpers';
import { OJPv1_Helpers } from '../../../../helpers/ojp-v1';

import { Language, XML_Config } from '../../../../types/_all';

import { FareRequestResponse } from '../../../../types/response';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../../constants';

import { BaseRequest } from '../../../current/requests/base';

export class OJPv1_FareRequest extends BaseRequest<{ version: '1.0', fetchResponse: FareRequestResponse }> {
  public payload: OJP_Types.FareRequestSchema[];

  protected constructor(items: OJP_Types.FareRequestSchema[]) {
    super();

    this.payload = items;
  }

  private static DefaultRequestParams(): OJP_Types.FareRequestParamsSchema {
    const params: OJP_Types.FareRequestParamsSchema = {
      fareAuthorityFilter: ['ch:1:NOVA'],
      passengerCategory: ['Adult'],
      travelClass: 'second',
      traveller: [
        {
          age: 25,
          passengerCategory: 'Adult',
          entitlementProducts: {
            entitlementProduct: [
              {
                fareAuthorityRef: 'ch:1:NOVA',
                entitlementProductRef: 'HTA',
                entitlementProductName: 'Halbtax-Abonnement',
              }
            ]
          }
        }
      ],
    };

    return params;
  }

  // Used by Base.initWithRequestMock / initWithResponseMock
  public static Default(): OJPv1_FareRequest {
    const request = new OJPv1_FareRequest([]);
    return request;
  }

  private static initWithOJPv1Trips(trips: OJP_Types.OJPv1_TripSchema[]) {
    trips.map(tripV1 => {
      OJPv1_Helpers.cleanTripForFareRequest(tripV1);
    });

    const now = new Date();
    const requestTimestamp = now.toISOString();

    const fareRequests: OJP_Types.FareRequestSchema[] = [];
    trips.forEach(trip => {
      const fareRequest: OJP_Types.FareRequestSchema = {
        requestTimestamp: requestTimestamp,
        tripFareRequest: {
          trip: trip,
        },
        params: OJPv1_FareRequest.DefaultRequestParams(),
      };

      fareRequests.push(fareRequest);
    });

    const request = new OJPv1_FareRequest(fareRequests);
    return request;
  }

  public static initWithOJPv2Trips(trips: OJP_Types.TripSchema[]) {
    const newTrips: OJP_Types.OJPv1_TripSchema[] = [];
    trips.forEach(trip => {
      const tripV1 = OJPv1_Helpers.convertOJPv2Trip_to_v1Trip(trip);
      newTrips.push(tripV1);
    });

    const request = OJPv1_FareRequest.initWithOJPv1Trips(newTrips);
    return request;
  }

  public buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string {
    if (xmlConfig.ojpVersion !== '1.0') {
      throw new Error('FareRequest can be consructed only with OJPv1 XML_Config');
    }

    const requestTimestamp = RequestHelpers.computeRequestTimestamp();

    this.payload.forEach(fareRequestPayload => {
      fareRequestPayload.requestTimestamp = requestTimestamp;
    });

    const requestOJP: OJP_Types.FareRequestOJP = {
      OJPRequest: {
        serviceRequest: {
          serviceRequestContext: {
            language: language
          },
          requestTimestamp: requestTimestamp,
          requestorRef: requestorRef,
          OJPFareRequest: this.payload,
        }
      },
    };

    const xmlS = buildRootXML(requestOJP, xmlConfig, (objTransformed => {
      const siriPrefix = xmlConfig.defaultNS !== 'siri' ? 'siri:' : '';
      const ojpPrefix = xmlConfig.defaultNS !== 'ojp' ? 'ojp:' : '';

      // Hack to patch the Service.OperatorRef
      //   - in OJP1 is under ojp: namespace
      //   - value needs a prefix ojp: otherwise FareService throws an error
      //    -> ojp:11
      const fareRequests = objTransformed[siriPrefix + 'OJPRequest'][siriPrefix + 'ServiceRequest'][ojpPrefix + 'OJPFareRequest'] as any[];
      fareRequests.forEach(fareRequest => {
        const trip = fareRequest[ojpPrefix + 'TripFareRequest'][ojpPrefix + 'Trip'];
        (trip[ojpPrefix + 'TripLeg'] as any[]).forEach(leg => {
          if (ojpPrefix + 'TimedLeg' in leg) {
            const service = leg[ojpPrefix + 'TimedLeg'][ojpPrefix + 'Service'];
            service[ojpPrefix + 'OperatorRef'] = 'ojp:' +  service[siriPrefix + 'OperatorRef'];
            delete service[siriPrefix + 'OperatorRef'];
          }
        });
      });
    }));

    return xmlS;
  }

  protected override async _fetchResponse(sdk: SDK<'1.0'>): Promise<FareRequestResponse> {
    const xmlConfig: XML_Config = sdk.version === '2.0' ? DefaultXML_Config : XML_BuilderConfigOJPv1;
    
    const responseXML = await RequestHelpers.computeResponse(this, sdk, xmlConfig);

    try {
      const parsedObj = parseXML<{ OJP: OJP_Types.FareResponseOJP }>(responseXML, 'OJP');
      const response = parsedObj.OJP.OJPResponse.serviceDelivery.OJPFareDelivery;

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
