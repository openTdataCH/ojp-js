import xmlbuilder from 'xmlbuilder';
import { NovaFareParser } from "./nova-request-parser";
import { OJP_Helpers } from '../helpers/ojp-helpers';
export class NovaRequest {
    constructor(stageConfig) {
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
    fetchResponseForTrips(trips) {
        const ojpV1_XML_Config = {
            ojpVersion: '1.0',
            defaultNS: null,
            mapNS: {
                'ojp': 'http://www.vdv.de/ojp',
                'siri': 'http://www.siri.org.uk/siri',
            },
        };
        const now = new Date();
        const serviceRequestNode = this.buildServiceRequestNode(ojpV1_XML_Config, now);
        trips.forEach(trip => {
            this.addTripToServiceRequestNode(serviceRequestNode, ojpV1_XML_Config, trip, now);
        });
        return this.fetchResponse(serviceRequestNode);
    }
    buildServiceRequestNode(xmlConfig, requestDate) {
        const rootNode = xmlbuilder.create('OJP', {
            version: '1.0',
            encoding: 'utf-8',
        });
        for (const ns in xmlConfig.mapNS) {
            const key = ns === xmlConfig.defaultNS ? 'xmlns' : 'xmlns:' + ns;
            rootNode.att(key, xmlConfig.mapNS[ns]);
        }
        rootNode.att('version', xmlConfig.ojpVersion);
        const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const serviceRequestNode = rootNode.ele(siriPrefix + 'OJPRequest').ele(siriPrefix + 'ServiceRequest');
        const dateF = requestDate.toISOString();
        serviceRequestNode.ele(siriPrefix + 'RequestTimestamp', dateF);
        const requestorRef = OJP_Helpers.buildRequestorRef();
        serviceRequestNode.ele(siriPrefix + "RequestorRef", requestorRef);
        return serviceRequestNode;
    }
    addTripToServiceRequestNode(serviceRequestNode, xmlConfig, trip, requestDate) {
        const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const ojpPrefix = xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const fareRequestNode = serviceRequestNode.ele(ojpPrefix + 'OJPFareRequest');
        const dateF = requestDate.toISOString();
        fareRequestNode.ele(siriPrefix + 'RequestTimestamp', dateF);
        const tripFareRequest = fareRequestNode.ele(ojpPrefix + 'TripFareRequest');
        const tripNode = trip.asXMLNode(xmlConfig);
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
