import xmlbuilder from 'xmlbuilder';
import { NovaFareParser } from "./nova-request-parser";
import { REQUESTOR_REF, XML_BuilderConfigOJPv1 } from '../constants';
export class NovaRequest {
    constructor(stageConfig, language = 'de', xmlConfig = XML_BuilderConfigOJPv1, requestorRef = REQUESTOR_REF) {
        this.stageConfig = stageConfig;
        this.language = language;
        this.xmlConfig = xmlConfig;
        this.requestorRef = requestorRef;
        this.requestInfo = {
            requestDateTime: null,
            requestXML: null,
            responseDateTime: null,
            responseXML: null,
            parseDateTime: null,
            error: null
        };
    }
    fetchResponseForTrips(trips) {
        const now = new Date();
        const serviceRequestNode = this.buildServiceRequestNode(now);
        trips.forEach(trip => {
            this.addTripToServiceRequestNode(serviceRequestNode, trip, now);
        });
        return this.fetchResponse(serviceRequestNode);
    }
    buildServiceRequestNode(requestDate) {
        const rootNode = xmlbuilder.create('OJP', {
            version: '1.0',
            encoding: 'utf-8',
        });
        for (const ns in this.xmlConfig.mapNS) {
            const key = ns === this.xmlConfig.defaultNS ? 'xmlns' : 'xmlns:' + ns;
            rootNode.att(key, this.xmlConfig.mapNS[ns]);
        }
        rootNode.att('version', this.xmlConfig.ojpVersion);
        const siriPrefix = this.xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const serviceRequestNode = rootNode.ele(siriPrefix + 'OJPRequest').ele(siriPrefix + 'ServiceRequest');
        const dateF = requestDate.toISOString();
        serviceRequestNode.ele(siriPrefix + 'RequestTimestamp', dateF);
        serviceRequestNode.ele(siriPrefix + "RequestorRef", this.requestorRef);
        return serviceRequestNode;
    }
    addTripToServiceRequestNode(serviceRequestNode, trip, requestDate) {
        const siriPrefix = this.xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const ojpPrefix = this.xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const fareRequestNode = serviceRequestNode.ele(ojpPrefix + 'OJPFareRequest');
        const dateF = requestDate.toISOString();
        fareRequestNode.ele(siriPrefix + 'RequestTimestamp', dateF);
        const tripFareRequest = fareRequestNode.ele(ojpPrefix + 'TripFareRequest');
        const tripNode = trip.asXMLNode(this.xmlConfig);
        tripFareRequest.importDocument(tripNode);
        const paramsNode = fareRequestNode.ele(ojpPrefix + 'Params');
        paramsNode.ele(ojpPrefix + 'FareAuthorityFilter', 'ch:1:NOVA');
        paramsNode.ele(ojpPrefix + 'PassengerCategory', 'Adult');
        paramsNode.ele(ojpPrefix + 'TravelClass', 'second');
        const travellerNode = paramsNode.ele(ojpPrefix + 'Traveller');
        travellerNode.ele(ojpPrefix + 'Age', '25');
        travellerNode.ele(ojpPrefix + 'PassengerCategory', 'Adult');
        const entitlementProductNode = travellerNode.ele(ojpPrefix + 'EntitlementProducts').ele(ojpPrefix + 'EntitlementProduct');
        entitlementProductNode.ele(ojpPrefix + 'FareAuthorityRef', 'ch:1:NOVA');
        entitlementProductNode.ele(ojpPrefix + 'EntitlementProductRef', 'HTA');
        entitlementProductNode.ele(ojpPrefix + 'EntitlementProductName', 'Halbtax-Abonnement');
    }
    fetchResponse(serviceRequestNode) {
        this.requestInfo.requestXML = serviceRequestNode.end({ pretty: true });
        const requestHeaders = {
            "Content-Type": "text/xml"
        };
        if (this.stageConfig.authToken) {
            requestHeaders['Authorization'] = 'Bearer ' + this.stageConfig.authToken;
        }
        const requestOptions = {
            method: 'POST',
            body: this.requestInfo.requestXML,
            headers: requestHeaders,
        };
        const apiEndpoint = this.stageConfig.url;
        const promise = new Promise((resolve) => {
            const errorNovaFare_Response = {
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
