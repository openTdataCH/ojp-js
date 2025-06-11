import * as OJP from '../../src';
import { DefaultXML_Config } from '../../src/constants';
import { XML_Config } from '../../src/types/_all';

export class OJP_Helpers {
  public static DefaultSDK(language: OJP.Language = 'de', xmlConfig: XML_Config = DefaultXML_Config): OJP.SDK {
    const config: OJP.HTTPConfig = {
      url: 'https://endpoint.com',
      authToken: null,
    };
    
    const sdk = new OJP.SDK('test.requestorRef', config, language, xmlConfig);
    return sdk;
  }
}