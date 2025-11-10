import axios, { AxiosHeaders, AxiosRequestConfig } from "axios";

import { SDK } from "../sdk";

import { DefaultXML_Config } from "../constants";
import { HTTPConfig, XML_Config } from "../types/_all";
import { OJP_RequestType } from "../types/request";

export class RequestHelpers {
  public static computeRequestTimestamp() {
    const now = new Date();
    const requestTimestamp = now.toISOString();
    
    return requestTimestamp;
  }

  public static async computeResponse(request: OJP_RequestType, sdk: SDK<'1.0'> | SDK<'2.0'>, xmlConfig: XML_Config): Promise<string> {
    const requestXML = (() => {
      if (request.mockRequestXML) {
        // console.log('TR: using mock request XML');
        return request.mockRequestXML;
      }

      const xml = request.buildRequestXML(sdk.language, sdk.requestorRef, xmlConfig);
      return xml;
    })();

    request.requestInfo.requestDateTime = new Date();
    request.requestInfo.requestXML = requestXML;

    const responseXML: string = await (async () => {
      if (request.mockResponseXML) {
        // console.log('TR: using mock response XML');
        return request.mockResponseXML;
      }

      const xml = await RequestHelpers.fetchResponseXML(requestXML, sdk.httpConfig);
      return xml;
    })();

    request.requestInfo.responseDateTime = new Date();
    request.requestInfo.responseXML = responseXML;

    return responseXML;
  }

  private static async fetchResponseXML(requestXML: string, httpConfig: HTTPConfig): Promise<string> {
    const headers = new AxiosHeaders();
    headers.set('Accept', 'application/xml');
    headers.set('Content-Type', 'application/xml');

    if (httpConfig.authToken !== null) {
      headers.set('Authorization', 'Bearer ' + httpConfig.authToken);
    }

    const requestConfig: AxiosRequestConfig = {
      method: 'POST',
      url: httpConfig.url,
      headers: headers,
    };

    if (httpConfig.url.startsWith('http://localhost')) {
      requestConfig.method = 'GET';
    }

    if (requestConfig.method === 'POST') {
      requestConfig.data = requestXML;
    }

    const response = await axios.request(requestConfig);
    const responseXML = response.data as string;

    return responseXML;
  }
}
