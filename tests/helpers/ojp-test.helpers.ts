import * as OJP from '../../src';
import { OJP_VERSION } from '../../src/types/_all';

const httpConfig: OJP.HTTPConfig = {
  url: 'https://endpoint.com',
  authToken: null,
};

const requestorRef = 'test.requestorRef';
export class OJP_Helpers {
  public static DefaultSDK(language: OJP.Language = 'de') {
    const sdk = OJP.SDK.create(requestorRef, httpConfig, language);
    return sdk;
  }

  public static LegacySDK(language: OJP.Language = 'de') {
    const sdk = OJP.SDK.v1(requestorRef, httpConfig, language);
    return sdk;
  }
}
