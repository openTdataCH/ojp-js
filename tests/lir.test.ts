import * as OJP from '../src/index'

const fs = require('fs');
const path = require('path');

describe('OJP Test Namespaces', () => {
  test('Test LIR with ojp: siri: namespaces', async () => {
    const mockPath = path.join(__dirname, '/ojp-fixtures/lir-be.xml');
    const mockXML = fs.readFileSync(mockPath, { encoding: 'utf8' });
    const request = OJP.LocationInformationRequest.initWithResponseMock(mockXML);
    
    const response = await request.fetchResponse();
    const location = response.locations[0];
    
    expect(location.stopPlace?.stopPlaceRef).toBe('8507000');
  });

  test('Test LIR with ojp default namespace + siri: namespaces', async () => {
    const mockPath = path.join(__dirname, '/ojp-fixtures/lir-be-ns-ojp.xml');
    const mockXML = fs.readFileSync(mockPath, { encoding: 'utf8' });
    const request = OJP.LocationInformationRequest.initWithResponseMock(mockXML);
    
    const response = await request.fetchResponse();
    const location = response.locations[0];
    
    expect(location.stopPlace?.stopPlaceRef).toBe('8507000');
  });
});


describe('LIR POI', () => {
  test('Test Shared Mobility', async () => {
    const mockPath = path.join(__dirname, '/ojp-fixtures/lir-poi-be-mobility.xml');
    const mockXML = fs.readFileSync(mockPath, { encoding: 'utf8' });
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