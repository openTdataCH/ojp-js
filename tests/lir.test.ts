import { FileHelpers } from './helpers/file-helpers';

import * as OJP from '../src/index'

describe('OJP Test Namespaces', () => {
  test('Test LIR with ojp: siri: namespaces', async () => {
    const mockXML = FileHelpers.loadMockXML('lir-be.xml')
    const request = OJP.LocationInformationRequest.initWithResponseMock(mockXML);
    
    const response = await request.fetchResponse();
    const location = response.locations[0];
    
    expect(location.stopPlace?.stopPlaceRef).toBe('8507000');
  });

  test('Test LIR with ojp default namespace + siri: namespaces', async () => {
    const mockXML = FileHelpers.loadMockXML('lir-be-ns-ojp.xml');
    const request = OJP.LocationInformationRequest.initWithResponseMock(mockXML);
    
    const response = await request.fetchResponse();
    const location = response.locations[0];
    
    expect(location.stopPlace?.stopPlaceRef).toBe('8507000');
  });
});


describe('LIR POI', () => {
  test('Test Shared Mobility', async () => {
    const mockXML = FileHelpers.loadMockXML('lir-poi-be-mobility.xml');
    const request = OJP.LocationInformationRequest.initWithResponseMock(mockXML);
    
    const response = await request.fetchResponse();
    const location = response.locations[0];

    // Find the location having a POI with num_vehicles_available attribute
    const locationPOIs = response.locations.filter(location => {
      return location.poi?.code === 'coord:828397:6066636:MRCV:Publibike Bundesgasse'
    });

    expect(locationPOIs).toHaveLength(1);

    expect(locationPOIs[0].attributes['num_vehicles_available']).toBe('2');
  });
})