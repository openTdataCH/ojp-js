import { FileHelpers } from './helpers/file-helpers';

import * as OJP_Types from 'ojp-shared-types';
import { OJP_Helpers } from './helpers/ojp-test.helpers';

describe('OJP Test TripRefineRequest Response', () => {
  let response: OJP_Types.TRR_DeliverySchema;

  beforeAll(async () => {
    const ojp = OJP_Helpers.DefaultSDK();
    const mockXML = FileHelpers.loadMockXML('trr-response-zh-be.xml');
    const mockRequest = ojp.requests.TripRefineRequest.initWithResponseMock(mockXML);
    
    const ojpResponse = await mockRequest.fetchResponse(ojp);
    if (ojpResponse.ok) {
      response = ojpResponse.value;
    }
  });

  test('Test OJPTripRefineDelivery.TripResult array', () => {
    const trips = response.tripResult.map(el => el.trip);
    expect(trips.length).toBe(1);
  });
});
