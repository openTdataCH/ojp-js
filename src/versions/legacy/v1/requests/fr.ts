import * as OJP_Types from 'ojp-shared-types';

import { SDK } from '../../../../sdk';

import { buildRootXML } from '../../../../helpers/xml/builder';
import { parseXML } from '../../../../helpers/xml/parser';
import { RequestHelpers } from '../../../../helpers/request-helpers';

import { Language, XML_Config } from '../../../../types/_all';

import { FareRequestResponse } from '../../../../types/response';
import { DefaultXML_Config, XML_BuilderConfigOJPv1 } from '../../../../constants';

import { BaseRequest } from '../../../current/requests/base';

export class OJPv1_FareRequest extends BaseRequest<{ fetchResponse: FareRequestResponse }> {
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

  private static cleanTripForFareRequest(trip: OJP_Types.OJPv1_TripSchema) {
    trip.tripLeg.forEach(leg => {
      if (leg.continuousLeg) {
        leg.continuousLeg = {
          legStart: {
            locationName: leg.continuousLeg.legStart.locationName,
          },
          legEnd: {
            locationName: leg.continuousLeg.legEnd.locationName,
          },
          service: {
            personalMode: 'foot',
            personalModeOfOperation: 'own',
          },
          duration: leg.continuousLeg.duration,
        };
      }

      if (leg.transferLeg) {
        leg.transferLeg = {
          transferType: leg.transferLeg.transferType,
          legStart: {
            locationName: leg.transferLeg.legStart.locationName,
          },
          legEnd: {
            locationName: leg.transferLeg.legEnd.locationName,
          },
          duration: leg.transferLeg.duration,
        };
      }

      if (leg.timedLeg) {
        const newLegIntermediates = leg.timedLeg.legIntermediates.map(el => {
          const newLeg = {
            stopPointRef: el.stopPointRef,
            stopPointName: el.stopPointName,
            serviceArrival: el.serviceArrival,
            serviceDeparture: el.serviceDeparture,
          };
          
          return newLeg;
        });

        leg.timedLeg = {
          legBoard: {
            stopPointRef: leg.timedLeg.legBoard.stopPointRef,
            stopPointName: leg.timedLeg.legBoard.stopPointName,
            serviceDeparture: leg.timedLeg.legBoard.serviceDeparture,
          },
          legIntermediates: newLegIntermediates,
          legAlight: {
            stopPointRef: leg.timedLeg.legAlight.stopPointRef,
            stopPointName: leg.timedLeg.legAlight.stopPointName,
            serviceArrival: leg.timedLeg.legAlight.serviceArrival,
          },
          service: {
            operatingDayRef: leg.timedLeg.service.operatingDayRef,
            journeyRef: leg.timedLeg.service.journeyRef,
            lineRef: leg.timedLeg.service.lineRef,
            directionRef: leg.timedLeg.service.directionRef,
            mode: leg.timedLeg.service.mode,
            publishedLineName: leg.timedLeg.service.publishedLineName,
            attribute: leg.timedLeg.service.attribute,
            operatorRef: leg.timedLeg.service.operatorRef,
          },
        };
      }
    });
  }

  public static initWithOJPv1Trips(trips: OJP_Types.OJPv1_TripSchema[]) {
    trips.map(tripV1 => {
      OJPv1_FareRequest.cleanTripForFareRequest(tripV1);
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
      //  in XSD schema OperatorRef is under siri: namespace
      //      https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__DatedJourneyStructure
      //  however ojp-nova needs it under ojp: namespace
      const fareRequests = objTransformed[siriPrefix + 'OJPRequest'][siriPrefix + 'ServiceRequest'][ojpPrefix + 'OJPFareRequest'] as any[];
      fareRequests.forEach(fareRequest => {
        const trip = fareRequest[ojpPrefix + 'TripFareRequest'][ojpPrefix + 'Trip'];
        (trip[ojpPrefix + 'TripLeg'] as any[]).forEach(leg => {
          if (ojpPrefix + 'TimedLeg' in leg) {
            const service = leg[ojpPrefix + 'TimedLeg'][ojpPrefix + 'Service'];
            if (siriPrefix + 'OperatorRef' in service) {
              service[ojpPrefix + 'OperatorRef'] = service[siriPrefix + 'OperatorRef'];
              delete service[siriPrefix + 'OperatorRef'];  
            }
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
      const parsedObj = parseXML<{ OJP: OJP_Types.FareResponseOJP }>(responseXML, sdk.version);
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
