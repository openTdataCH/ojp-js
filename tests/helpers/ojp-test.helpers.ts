import * as OJP from '../../src';

export class OJP_Helpers {
  public static DefaultSDK(language: OJP.Language = 'de'): OJP.SDK {
    const config: OJP.HTTPConfig = {
      url: 'https://endpoint.com',
      authToken: null,
    };
    
    const sdk = new OJP.SDK('test.requestorRef', config, language);
    return sdk;
  }
}