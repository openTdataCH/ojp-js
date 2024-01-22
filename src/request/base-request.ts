import fetch from 'cross-fetch';

import { StageConfig } from '../types/stage-config';
import { RequestInfo } from './types/request-info.type';

export class OJPBaseRequest {
  private stageConfig: StageConfig;

  public requestInfo: RequestInfo;

  protected logRequests: boolean
  protected mockRequestXML: string | null;
  protected mockResponseXML: string | null;

  constructor(stageConfig: StageConfig) {
    this.stageConfig = stageConfig;
    
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
    // override
    return '<override/>';
  }

  protected fetchOJPResponse(): Promise<RequestInfo> {
    this.requestInfo.requestDateTime = new Date();

    if (this.mockRequestXML) {
      this.requestInfo.requestXML = this.mockRequestXML;
    } else {
      this.requestInfo.requestXML = this.buildRequestXML();
    }

    const apiEndpoint = this.stageConfig.apiEndpoint;

    if (this.logRequests) {
      console.log('OJP Request: /POST - ' + apiEndpoint);
      console.log(this.requestInfo.requestXML);
    }

    const requestOptions: RequestInit = {
      method: 'POST',
      body: this.requestInfo.requestXML,
      headers: {
        "Content-Type": "text/xml",
        "Authorization": "Bearer " + this.stageConfig.authBearerKey,
      },
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
}
