import { FileHelpers } from './helpers/file-helpers';

import * as OJP_Types from 'ojp-shared-types';
import * as OJP from '../src'
import { OJP_Helpers } from './helpers/ojp-test.helpers';
import { XML_BuilderConfigOJPv1 } from '../src/constants';

describe('OJP Test TripRequest Response', () => {
  let response1: OJP_Types.FareDeliverySchema;
  let response2: OJP_Types.FareDeliverySchema;

  beforeAll(async () => {
    const ojp = OJP_Helpers.DefaultSDK('de', XML_BuilderConfigOJPv1);
    
    const mockXML_1 = FileHelpers.loadMockXML('fare-response.xml');
    const mockRequest1 = OJP.FareRequest.initWithResponseMock(mockXML_1);
    const ojpResponse1 = await ojp.fetchFareRequestResponse(mockRequest1);
    if (ojpResponse1.ok) {
      response1 = ojpResponse1.value;
    }

    const mockXML_2 = FileHelpers.loadMockXML('fare-response-single-result.xml');
    const mockRequest2 = OJP.FareRequest.initWithResponseMock(mockXML_2);
    const ojpResponse2 = await ojp.fetchFareRequestResponse(mockRequest2);
    if (ojpResponse2.ok) {
      response2 = ojpResponse2.value;
    }
  });

  test('Test FareRequest - single result', () => {
    expect(response2.fareResult.length).toBe(1);
    // console.log(response1.fareResult.length);
    // console.log(response2.fareResult.length);
  });

  test('Test FareRequest - response model', () => {
    const fareProduct = response1.fareResult[0].tripFareResult[0].fareProduct[0];
    expect(fareProduct.price).toBe(12.2);
    expect(fareProduct.travelClass).toBe('second');
  });
});
