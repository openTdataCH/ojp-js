import fetch from 'cross-fetch';
import * as xmlbuilder from "xmlbuilder";

import { ApiConfig } from '../types/stage-config';
import { RequestInfo } from './types/request-info.type';
import { Language } from '../types/language-type';
import { XML_Config } from '../types/_all';
import { REQUESTOR_REF, XML_Config_Default } from '../constants';

export class OJPBaseRequest {
  private stageConfig: ApiConfig;
  private language: Language;
  protected xmlConfig: XML_Config;
  private requestorRef: string;
  protected serviceRequestNode: xmlbuilder.XMLElement;

  public requestInfo: RequestInfo;

  public logRequests: boolean;
  protected mockRequestXML: string | null;
  protected mockResponseXML: string | null;

  constructor(stageConfig: ApiConfig, language: Language, xmlConfig: XML_Config = XML_Config_Default, requestorRef = REQUESTOR_REF) {
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

  private buildRequestXML(): string {
    this.buildRequestNode();

    const bodyXML_s = this.serviceRequestNode.end({
        pretty: true,
    });

    return bodyXML_s;
  }

  public updateRequestXML(): void {
    this.requestInfo.requestXML = this.buildRequestXML();
  }

  protected fetchOJPResponse(): Promise<RequestInfo> {
    this.requestInfo.requestDateTime = new Date();

    if (this.mockRequestXML) {
      this.requestInfo.requestXML = this.mockRequestXML;
    } else {
      this.requestInfo.requestXML = this.buildRequestXML();
    }

    const apiEndpoint = this.stageConfig.url;

    if (this.logRequests) {
      console.log('OJP Request: /POST - ' + apiEndpoint);
      console.log(this.requestInfo.requestXML);
    }

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
    
    const responsePromise = new Promise<RequestInfo>((resolve) => {
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

  private computeBaseServiceRequestNode(requestDate: Date = new Date()) {
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

  protected buildRequestNode() {
    this.serviceRequestNode = this.computeBaseServiceRequestNode();
  }
}
