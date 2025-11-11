import * as OJP from '../src'
import { OJP_Helpers } from './helpers/ojp-test.helpers';

describe('OJP Test GeoPosition', () => {
  let ojp: OJP.SDK;

  beforeAll(async () => {
    ojp = OJP_Helpers.DefaultSDK();
  });

  test('Constructor with literal coords a-la GoogleMaps lat/lng', () => {
    // literal coords, a-la GoogleMaps
    const g1 = new OJP.GeoPosition('47.528438383,8.3393993902');
    expect(g1.isValid()).toBe(true);
    expect(g1.longitude).toBe(8.339399);
    expect(g1.latitude).toBe(47.528438);
    expect(g1.asLatLngString()).toBe('47.528438,8.339399');
  });

  test('Constructor with longitude, Latitude', () => {
    const g1 = new OJP.GeoPosition(8.373338383, 47.73);
    expect(g1.isValid()).toBe(true);
    expect(g1.longitude).toBe(8.373338);
    expect(g1.latitude).toBe(47.73);
  });

  test('Constructor with invalid coordinates', () => {
    const g1 = new OJP.GeoPosition(Infinity, Infinity);
    expect(g1.isValid()).toBe(false);
  });
});
