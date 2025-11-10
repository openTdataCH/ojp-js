import { RequestInfo } from "../../../types/_all";

export class BaseRequest {
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

  public static initWithRequestMock<T>(this: { Default(): T }, mockText: string): T {
    const instance = this.Default();
    (instance as BaseRequest).mockRequestXML = mockText;
    
    return instance;
  }

  public static initWithResponseMock<T>(this: { Default(): T }, mockText: string): T {
    const instance = this.Default();
    (instance as BaseRequest).mockResponseXML = mockText;
    
    return instance;
  }
}
