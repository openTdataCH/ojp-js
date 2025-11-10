import { SDK } from "../../../sdk";
import { Language, OJP_VERSION, RequestInfo, XML_Config } from "../../../types/_all";

export type ResultSpec = { version: OJP_VERSION, fetchResponse: unknown };

export abstract class BaseRequest<S extends ResultSpec> {
  public requestInfo: RequestInfo;

  public mockRequestXML: string | null;
  public mockResponseXML: string | null;

  protected constructor() {
    const now = new Date();

    this.requestInfo = {
      requestDateTime: null,
      requestXML: null,
      responseDateTime: null,
      responseXML: null,
      parseDateTime: null,
    };

    this.mockRequestXML = null;
    this.mockResponseXML = null;
  }

  public static initWithRequestMock<T, S extends ResultSpec>(this: { Default(): T }, mockText: string): T {
    const instance = this.Default();
    (instance as BaseRequest<S>).mockRequestXML = mockText;
    
    return instance;
  }

  public static initWithResponseMock<T, S extends ResultSpec>(this: { Default(): T }, mockText: string): T {
    const instance = this.Default();
    (instance as BaseRequest<S>).mockResponseXML = mockText;
    
    return instance;
  }

  protected abstract _fetchResponse(sdk: SDK<S['version']>): Promise<S['fetchResponse']>;
  public async fetchResponse(sdk: SDK<S['version']>): Promise<S['fetchResponse']> {
    const response = await this._fetchResponse(sdk);
    return response;
  }

  protected abstract patchPayload(): void;

  public abstract buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string;
}
