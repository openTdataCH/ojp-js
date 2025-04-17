import fetch from 'cross-fetch';
import * as xmlbuilder from "xmlbuilder";
import { REQUESTOR_REF, XML_Config_OJPv2 } from '../constants';
export class OJPBaseRequest {
    constructor(stageConfig, language, xmlConfig = XML_Config_OJPv2, requestorRef = REQUESTOR_REF) {
        this.stageConfig = stageConfig;
        this.language = language;
        this.xmlConfig = xmlConfig;
        this.requestorRef = requestorRef;
        this.serviceRequestNode = this.computeBaseServiceRequestNode();
        this.requestInfo = {
            requestDateTime: null,
            requestXML: null,
            responseDateTime: null,
            responseXML: null,
            parseDateTime: null,
            error: null
        };
        this.logRequests = false;
        this.mockRequestXML = null;
        this.mockResponseXML = null;
    }
    buildRequestXML() {
        this.buildRequestNode();
        const bodyXML_s = this.serviceRequestNode.end({
            pretty: true,
        });
        return bodyXML_s;
    }
    updateRequestXML() {
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    fetchOJPResponse() {
        this.requestInfo.requestDateTime = new Date();
        if (this.mockRequestXML) {
            this.requestInfo.requestXML = this.mockRequestXML;
        }
        else {
            this.requestInfo.requestXML = this.buildRequestXML();
        }
        const apiEndpoint = this.stageConfig.url;
        if (this.logRequests) {
            console.log('OJP Request: /POST - ' + apiEndpoint);
            console.log(this.requestInfo.requestXML);
        }
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
        const responsePromise = new Promise((resolve) => {
            if (this.mockResponseXML) {
                this.requestInfo.responseXML = this.mockResponseXML;
                this.requestInfo.responseDateTime = new Date();
                resolve(this.requestInfo);
                return;
            }
            fetch(apiEndpoint, requestOptions).then(response => {
                if (!response.ok) {
                    this.requestInfo.error = {
                        error: 'FetchError',
                        message: 'HTTP ERROR - Status:' + response.status + ' - URL:' + apiEndpoint,
                    };
                    return null;
                }
                return response.text();
            }).then(responseText => {
                if (responseText !== null) {
                    this.requestInfo.responseXML = responseText;
                    this.requestInfo.responseDateTime = new Date();
                }
                resolve(this.requestInfo);
            }).catch(error => {
                this.requestInfo.error = {
                    error: 'FetchError',
                    message: error,
                };
                resolve(this.requestInfo);
            });
        });
        return responsePromise;
    }
    computeBaseServiceRequestNode(requestDate = new Date()) {
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
        const serviceRequestNode = rootNode.ele('OJPRequest').ele(siriPrefix + 'ServiceRequest');
        serviceRequestNode.ele('siri:ServiceRequestContext').ele('siri:Language', this.language);
        const dateF = requestDate.toISOString();
        serviceRequestNode.ele(siriPrefix + 'RequestTimestamp', dateF);
        serviceRequestNode.ele(siriPrefix + 'RequestorRef', this.requestorRef);
        return serviceRequestNode;
    }
    buildRequestNode() {
        this.serviceRequestNode = this.computeBaseServiceRequestNode();
    }
}
