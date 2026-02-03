import { FileHelpers } from './helpers/file-helpers';

import * as OJP_Types from 'ojp-shared-types';
import * as OJP from '../src';
import { OJP_Helpers } from './helpers/ojp-test.helpers';

describe('OJP Test TripRequest Response', () => {
  let trips: OJP.Trip[];

  beforeAll(async () => {
    const ojp = OJP_Helpers.DefaultSDK();
    const mockXML = FileHelpers.loadMockXML('tr-response-zh-be.xml');
    const mockRequest = ojp.requests.TripRequest.initWithResponseMock(mockXML);
    const response = await mockRequest.fetchResponse(ojp);
    if (response.ok) {
      trips = response.value.tripResult.map(el => el.trip);
    } else {
      // TODO: handle errors
    }
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

  test('Test TR XML number parsing', () => {
    const trip = trips[1];
    expect(trip.transfers).toBe(1);
  });

  test('Test TR response empty <LegIntermediate> array', () => {
    const trip = trips[0];

    const timedLeg1 = trip.leg[0].timedLeg as OJP_Types.TimedLegSchema;
    if (timedLeg1) {
      expect(timedLeg1.legIntermediate.length).toBe(0);
    }
  })

  test('Test TR response single <LegIntermediate> array', () => {
    const trip = trips[2];
    
    const timedLeg1 = trip.leg[0].timedLeg as OJP_Types.TimedLegSchema;
    if (timedLeg1) {
      expect(timedLeg1.legIntermediate.length).toBe(1);
    }

    const timedLeg2 = trip.leg[2].timedLeg as OJP_Types.TimedLegSchema;
    if (timedLeg2) {
      expect(timedLeg2.legIntermediate.length).toBe(6);
    }
  });

  test('Test TR response <Service>/<Attribute> array',() => {
    const trip = trips[2];

    const timedLeg1 = trip.leg[0].timedLeg as OJP_Types.TimedLegSchema;
    if (timedLeg1) {
      const service = timedLeg1.service;
      expect(service.attribute.length).toBe(2);
    }
  });

  test('Test TR Response Status', () => {
    const trip = trips[2];

    expect(trip.cancelled).toBeFalsy();
    expect(trip.unplanned).toBeFalsy();
    expect(trip.deviation).toBeFalsy();
    expect(trip.delayed).toBeFalsy();
    expect(trip.infeasible).toBe(true);
  })

  test('Test TR response <ExpectedDepartureOccupancy> array', () => {
    const legBoard = trips[0].leg[0].timedLeg?.legBoard ?? null;
    const legAlight = trips[0].leg[0].timedLeg?.legAlight ?? null;

    if (legBoard === null || legAlight === null) {
      throw new Error('Expected leg board / alight');
    }

    // LegBoard has 2 ExpectedDepartureOccupancy nodes
    expect(legBoard.expectedDepartureOccupancy?.length).toBe(2);

    // LegAlight has only one ExpectedDepartureOccupancy node
    expect(legAlight.expectedDepartureOccupancy?.length).toBe(1);
  });
});
