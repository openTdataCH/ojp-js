import { FileHelpers } from './helpers/file-helpers';

import * as OJP_Types from 'ojp-shared-types';
import { OJP_Helpers } from './helpers/ojp-test.helpers';

describe('OJP Test TripRequest Response', () => {
  let response: OJP_Types.StopEventDeliverySchema;

  beforeAll(async () => {
    const ojp = OJP_Helpers.DefaultSDK();
    const mockXML = FileHelpers.loadMockXML('ser-response-situations.xml');
    const mockRequest = ojp.requests.StopEventRequest.initWithResponseMock(mockXML);
    
    const ojpResponse = await mockRequest.fetchResponse(ojp);
    if (ojpResponse.ok) {
      response = ojpResponse.value;
    }
  });

  test('Test single situationFullRefs array', () => {
    const stopEvents = response.stopEventResult.map(el => el.stopEvent);

    const stopEvent1Situations = stopEvents[0].service.situationFullRefs?.situationFullRef ?? [];
    expect(stopEvent1Situations.length).toBe(1);

    const stopEvent2Situations = stopEvents[1].service.situationFullRefs?.situationFullRef ?? [];
    expect(stopEvent2Situations.length).toBe(2);
  });

  test('Test situations model', () => {
    const situations = response.stopEventResponseContext?.situations?.ptSituation ?? [];

    const situation1 = situations[0];

    expect(situation1.validityPeriod.length).toBe(1);

    const actions = situation1.publishingActions?.publishingAction ?? [];
    expect(actions[0].publishAtScope.scopeType).toBe('line');
    expect(actions[0].passengerInformationAction[0].actionRef).toBe('');

    const textualContentItems = actions[0].passengerInformationAction[0].textualContent;
    expect(textualContentItems[0].summaryContent.summaryText).toBe('Bus services of line 560 are running at irregular intervals.');
    expect(textualContentItems[0].reasonContent?.reasonText).toBe('This is due to an accident.');
    expect(textualContentItems[0].durationContent?.durationText).toBe('The duration of the restriction is not known.');
    expect(textualContentItems[0].descriptionContent.length).toBe(0);
    expect(textualContentItems[0].remarkContent.length).toBe(0);
    expect(textualContentItems[0].infoLink[0].uri).toBe('https://www.PostAuto.ch');
  });
});
