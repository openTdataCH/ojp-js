import { FileHelpers } from './helpers/file-helpers';

import * as OJP from '../src'
import { OJP_Helpers } from './helpers/ojp-test.helpers';


describe('OJP Test TripRequest', () => {
  let trips: OJP.Trip[];

  beforeAll(async () => {
    const ojp = OJP_Helpers.DefaultSDK();
    const mockXML = FileHelpers.loadMockXML('tr-response-zh-be.xml');
    const mockRequest = OJP.TripRequest.initWithResponseMock(mockXML);
    trips = await ojp.fetchTrips(mockRequest);
  });

  test('Test TR response single <Leg> array', () => {
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
