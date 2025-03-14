import xmlbuilder from 'xmlbuilder';

import { RequestInfo } from "../request";
import { Trip } from "../trip";
import { NovaFare_Response, NovaFareParser } from "./nova-request-parser";
import { ApiConfig } from '../types/stage-config';
import { OJPBaseRequest } from '../request/base-request';

export class NovaRequest {
  private stageConfig: ApiConfig;
  public requestInfo: RequestInfo;

  constructor(stageConfig: ApiConfig) {
    this.stageConfig = stageConfig;

    this.requestInfo = {
      requestDateTime: null,
      requestXML: null,
      responseDateTime: null,
      responseXML: null,
      parseDateTime: null,
      error: null
    };
  }

  public fetchResponseForTrips(trips: Trip[]) {
    const now = new Date();
    const serviceRequestNode = this.buildServiceRequestNode(now);

    trips.forEach(trip => {
      this.addTripToServiceRequestNode(serviceRequestNode, trip, now);
    });

    return this.fetchResponse(serviceRequestNode);
  }

  private buildServiceRequestNode(requestDate: Date) {
    const rootNode = xmlbuilder.create('OJP', {
      version: '1.0',
      encoding: 'utf-8',
    });

    rootNode.att('xmlns', 'http://www.siri.org.uk/siri');
    rootNode.att('xmlns:ojp', 'http://www.vdv.de/ojp');
    rootNode.att('version', '1.0');

    const serviceRequestNode = rootNode.ele('OJPRequest').ele('ServiceRequest');
    
    const dateF = requestDate.toISOString();
    serviceRequestNode.ele('RequestTimestamp', dateF);

    const requestorRef = OJPBaseRequest.buildRequestorRef();
    serviceRequestNode.ele("RequestorRef", requestorRef);

    return serviceRequestNode;
  }

  private addTripToServiceRequestNode(serviceRequestNode: xmlbuilder.XMLElement, trip: Trip, requestDate: Date) {
    const fareRequestNode = serviceRequestNode.ele('ojp:OJPFareRequest');

    const dateF = requestDate.toISOString();
    fareRequestNode.ele('RequestTimestamp', dateF);

    const tripFareRequest = fareRequestNode.ele('ojp:TripFareRequest');
    trip.addToXMLNode(tripFareRequest);

    const paramsNode = fareRequestNode.ele('ojp:Params');
    paramsNode.ele('ojp:FareAuthorityFilter', 'ch:1:NOVA');
    paramsNode.ele('ojp:PassengerCategory', 'Adult');
    paramsNode.ele('ojp:TravelClass', 'second');

    const travellerNode = paramsNode.ele('ojp:Traveller');
    travellerNode.ele('ojp:Age', '25');
    travellerNode.ele('ojp:PassengerCategory', 'Adult');
    travellerNode.ele('ojp:Age', '25');
    travellerNode.ele('ojp:Age', '25');

    const entitlementProductNode = travellerNode.ele('ojp:EntitlementProducts').ele('ojp:EntitlementProduct');
    entitlementProductNode.ele('ojp:FareAuthorityRef', 'ch:1:NOVA');
    entitlementProductNode.ele('ojp:EntitlementProductRef', 'HTA');
    entitlementProductNode.ele('ojp:EntitlementProductName', 'Halbtax-Abonnement');
  }

  private fetchResponse(serviceRequestNode: xmlbuilder.XMLElement): Promise<NovaFare_Response> {
    this.requestInfo.requestXML = serviceRequestNode.end({ pretty: true });

    const requestHeaders: HeadersInit = {
      "Content-Type": "text/xml"
    };
    if (this.stageConfig.authToken) {
      requestHeaders['Authorization'] = 'Bearer ' + this.stageConfig.authToken;
    }

    const requestOptions: RequestInit = {
      method: 'POST',
      body: this.requestInfo.requestXML,
      headers: requestHeaders,
    };

    const apiEndpoint = this.stageConfig.url;

    const promise = new Promise<NovaFare_Response>((resolve) => {
      const errorNovaFare_Response: NovaFare_Response = {
        fareResults: [],
        message: 'ERROR',
      };

      fetch(apiEndpoint, requestOptions).then(response => {
        if (!response.ok) {
          this.requestInfo.error = {
            error: 'FetchError',
            message: 'HTTP ERROR - Status:' + response.status + ' - URL:' + apiEndpoint,
          };

          resolve(errorNovaFare_Response);
          
          return null;
        }
        
        return response.text();
      }).then(responseText => {
        if (responseText === null) {
          this.requestInfo.error = {
            error: 'FetchError',
            message: 'Invalid NOVA Response',
          };

          resolve(errorNovaFare_Response);

          return;
        }

        this.requestInfo.responseXML = responseText;
        this.requestInfo.responseDateTime = new Date();

        const parser = new NovaFareParser();
        parser.callback = (parserResponse) => {
          this.requestInfo.parseDateTime = new Date();
          this.requestInfo.responseXML = responseText;

          if (parserResponse.message === 'ERROR') {
            this.requestInfo.error = {
              error: 'ParseXMLError',
              message: 'error parsing XML',
            };

            resolve(errorNovaFare_Response);
            return;
          }

          resolve(parserResponse);
        };
        parser.parseXML(responseText);

      }).catch(error => {
        this.requestInfo.error = {
          error: 'FetchError',
          message: error,
        };

        resolve(errorNovaFare_Response);
      });
    });

    return promise;
  }
}
