import { FileHelpers } from './helpers/file-helpers';

import * as OJP_Types from 'ojp-shared-types';
import { OJP_Helpers } from './helpers/ojp-test.helpers';

describe('OJP Test TripRequest Response', () => {
  let response: OJP_Types.TripDeliverySchema;

  beforeAll(async () => {
    const ojp = OJP_Helpers.DefaultSDK();
    const mockXML = FileHelpers.loadMockXML('tr-response-situations.xml');
    const mockRequest = ojp.requests.TripRequest.initWithResponseMock(mockXML);
    
    const ojpResponse = await mockRequest.fetchResponse(ojp);
    if (ojpResponse.ok) {
      response = ojpResponse.value;
    }
  });

  test('Test single situationFullRefs array', () => {
    const trips = response.tripResult.map(el => el.trip);

    const trip1Situations = trips[0].leg[0].timedLeg?.service.situationFullRefs?.situationFullRef ?? [];
    expect(trip1Situations.length).toBe(1);

    const trip2Situations = trips[1].leg[0].timedLeg?.service.situationFullRefs?.situationFullRef ?? [];
    expect(trip2Situations.length).toBe(0);

    const trip3Situations = trips[2].leg[3].timedLeg?.service.situationFullRefs?.situationFullRef ?? [];
    expect(trip3Situations.length).toBe(3);
  });

  test('Test situations model', () => {
    const situations = response.tripResponseContext?.situations?.ptSituation ?? [];

    const situation1 = situations[0];

    expect(situation1.validityPeriod.length).toBe(1);

    const actions = situation1.publishingActions?.publishingAction ?? [];
    expect(actions[0].publishAtScope.scopeType).toBe('stopPoint');
    expect(actions[0].passengerInformationAction[0].actionRef).toBe('');

    const textualContentItems = actions[0].passengerInformationAction[0].textualContent;
    expect(textualContentItems[0].summaryContent.summaryText).toBe('The Neuchâtel, St-Honoré stop is closed.');
    expect(textualContentItems[0].reasonContent?.reasonText).toBe('This is due to construction work.');
    expect(textualContentItems[0].durationContent?.durationText).toBe('The restriction lasts from 07.04.2025, 08:00 until 06.06.2025, 17:00.');
    expect(textualContentItems[0].descriptionContent.length).toBe(0);
    expect(textualContentItems[0].remarkContent.length).toBe(0);
    expect(textualContentItems[0].infoLink[0].uri).toBe('https://www.transn.ch/');
  });
});
