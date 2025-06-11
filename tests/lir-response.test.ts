import { FileHelpers } from './helpers/file-helpers';

import * as OJP from '../src'
import { OJP_Helpers } from './helpers/ojp-test.helpers';

describe('OJP Test TripRequest Response', () => {
  let placeResults: OJP.PlaceResult[];

  beforeAll(async () => {
    const ojp = OJP_Helpers.DefaultSDK();
    const mockXML = FileHelpers.loadMockXML('lir-response-be.xml');
    const mockRequest = OJP.LocationInformationRequest.initWithResponseMock(mockXML);

    const response = await ojp.fetchLocationInformationRequestResponse(mockRequest);
    if (response.ok) {
      placeResults = response.value.placeResult.map(el => OJP.PlaceResult.initWithXMLSchema(el));
    } else {
      // TODO: handle errors
    }
  });

  test('Test LIR response parse strings', () => {
    const place1 = placeResults[0].place;
    expect(place1.stopPlace?.stopPlaceRef).toBe('8507000');
  });

  test('Test LIR response array type', () => {
    const place1 = placeResults[0].place;
    expect(place1.mode.length).toBe(1);
    expect(place1.mode[0].ptMode).toBe('rail');

    const place3 = placeResults[2].place;
    expect(place3.mode.length).toBe(2);
    expect(place3.mode[0].ptMode).toBe('tram');
    expect(place3.mode[1].ptMode).toBe('bus');
  });
});
