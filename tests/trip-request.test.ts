import { FileHelpers } from './helpers/file-helpers';

import * as OJP from '../src'
import { OJP_Helpers } from './helpers/ojp-test.helpers';


describe('OJP Test TripRequest', () => {
  test('Test TR response single <Leg> array', async () => {
    const mockXML = FileHelpers.loadMockXML('tr-response-zh-be.xml');
    const mockRequest = OJP.TripRequest.initWithResponseMock(mockXML);
    
    const ojp = OJP_Helpers.DefaultSDK();
    
    const trips = await ojp.fetchTrips(mockRequest);

    // check for MapArrayTags mapping in src/types/openapi/openapi-dependencies.ts
    // single <Leg> child nodes would generate 
    //      trip.leg property 
    // instead of 
    //      trip.leg[] (expected)
    expect(Array.isArray(trips[0].leg)).toBe(true);
    expect(trips[0].leg.length).toBe(1);
    
    expect(trips[1].leg.length).toBe(3);
  });
});
