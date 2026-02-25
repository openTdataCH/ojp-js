import { AnySDK, Language, RequestInfo, XML_Config } from "../../../types/_all";

export type ResultSpec = { fetchResponse: unknown };

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

  /**
   * Creates a new instance of the request class with a mock request XML string
   * 
   * This method is used for testing purposes to simulate API requests with predefined XML payloads.
   * When this mock is set, the request will use the provided XML instead of building a new one.
   * 
   * @param mockText - The XML string to use as the mock request
   * @returns A new instance of the request class with the mock set
   * 
   * @example
   * ```typescript
   * const mockRequest = LocationInformationRequest.initWithRequestMock('<OJP>...</OJP>');
   * ```
   * 
   * @group Initialization
   */
  public static initWithRequestMock<T_This extends { Default(): any }>(this: T_This, mockText: string): ReturnType<T_This['Default']> {
    const instance = this.Default();
    (instance as BaseRequest<any>).mockRequestXML = mockText;
    return instance as ReturnType<T_This['Default']>;
  }

  /**
   * Creates a new instance of the request class with a mock response XML string
   * 
   * This method is used for testing purposes to simulate API responses with predefined XML payloads.
   * When this mock is set, the request will use the provided XML response instead of making actual API calls.
   * 
   * @param mockText - The XML string to use as the mock response
   * @returns A new instance of the request class with the mock set
   * 
   * @example
   * ```typescript
   * const mockRequest = LocationInformationRequest.initWithResponseMock('<OJP>...</OJP>');
   * ```
   * 
   * @group Initialization
   */
  public static initWithResponseMock<T_This extends { Default(): any }>(this: T_This, mockText: string): ReturnType<T_This['Default']> {
    const instance = this.Default();
    (instance as BaseRequest<any>).mockResponseXML = mockText;
    return instance as ReturnType<T_This['Default']>;
  }

  protected abstract _fetchResponse(sdk: AnySDK): Promise<S['fetchResponse']>;
  public async fetchResponse(sdk: AnySDK): Promise<S['fetchResponse']> {
    const response = await this._fetchResponse(sdk);
    return response;
  }

  public abstract buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string;
}
