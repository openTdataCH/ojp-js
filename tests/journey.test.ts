import { FileHelpers } from './helpers/file-helpers';

import * as OJP from '../src/index'

describe('OJP Test JourneyService', () => {
  test('Test HRDF attributes', async () => {
    // https://opentdatach.github.io/ojp-demo-app/search?from=8503057&to=8507099
    const mockXML = FileHelpers.loadMockXML('tr-uetliberg-gurten.xml')
    const request = OJP.TripRequest.initWithResponseMock(mockXML);
    
    const response = await request.fetchResponse();
    const tripsFilter = response.trips.filter(trip => trip.id === 'ID-0F1A3116-ACFE-4C0C-945C-342EA202BA24');

    expect(tripsFilter).toHaveLength(1);

    const trip = tripsFilter[0];
    const timedLeg = trip.legs[0] as OJP.TripTimedLeg;

    const attributeVN = timedLeg.service.serviceAttributes['VN'];
    expect(attributeVN.code).toBe('VN');
    expect(attributeVN.text).toBe('VELOS: Keine Beförderung möglich');

    const attributeNF = timedLeg.service.serviceAttributes['NF'];
    expect(attributeNF.extra['AccessFacility']).toBe('palletAccess_lowFloor');
  });
});
