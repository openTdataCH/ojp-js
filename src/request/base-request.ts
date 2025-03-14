import fetch from 'cross-fetch';
import * as xmlbuilder from "xmlbuilder";

import { ApiConfig } from '../types/stage-config';
import { RequestInfo } from './types/request-info.type';
import { Language } from '../types/language-type';
import { SDK_VERSION } from '../constants';

export class OJPBaseRequest {
  private stageConfig: ApiConfig;
  private language: Language;
  protected serviceRequestNode: xmlbuilder.XMLElement;

  public requestInfo: RequestInfo;

  public logRequests: boolean
  protected mockRequestXML: string | null;
  protected mockResponseXML: string | null;

  constructor(stageConfig: ApiConfig, language: Language) {
    this.stageConfig = stageConfig;
    this.language = language;
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

  protected buildRequestXML(): string {
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

  public static buildRequestorRef() {
    return "OJP_JS_SDK_v" + SDK_VERSION;
  }

  private computeBaseServiceRequestNode(): xmlbuilder.XMLElement {
    const ojpNode = xmlbuilder.create("OJP", {
      version: "1.0",
      encoding: "utf-8",
    });

    ojpNode.att("xmlns:ojp", "http://www.vdv.de/ojp");
    ojpNode.att("xmlns", "http://www.siri.org.uk/siri");
    ojpNode.att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    ojpNode.att("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
    ojpNode.att("xsi:schemaLocation", "http://www.vdv.de/ojp");
    ojpNode.att("version", "1.0");

    const serviceRequestNode = ojpNode
      .ele("OJPRequest")
      .ele("ServiceRequest");

    serviceRequestNode.ele('ServiceRequestContext').ele('Language', this.language);

    return serviceRequestNode;
  }

  protected buildRequestNode() {
    this.serviceRequestNode = this.computeBaseServiceRequestNode();
  }
}
