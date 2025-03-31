import { GeoPositionSchema } from "../types/openapi";

export type GeoPositionLike = GeoPositionSchema | number[] | string;

export class GeoPosition implements GeoPositionSchema {
  public longitude: number;
  public latitude: number;
  public properties: Record<string, any>;

  constructor(geoPositionArg: GeoPositionLike | number, optionalLatitude: number | null = null) {
    const invalidCoords: number[] = [Infinity, Infinity];
    const coords = (() => {
      if ((typeof geoPositionArg === 'number') && isNaN(geoPositionArg)) {
        return invalidCoords;
      }

      if ((typeof geoPositionArg === 'number') && (optionalLatitude !== null)) {
        const longitude = geoPositionArg;
        const latitude = optionalLatitude;
        return [longitude, latitude];
      }

      if (typeof geoPositionArg === 'string') {
        const stringParts = geoPositionArg.split(',');

        if (stringParts.length < 2) {
          return invalidCoords;
        }

        // string is of format longitude, latitude - GoogleMaps like
        const longitude = parseFloat(stringParts[1]);
        const latitude = parseFloat(stringParts[0]);
        return [longitude, latitude];
      }

      if (Array.isArray(geoPositionArg) && (geoPositionArg.length > 1)) {
        return geoPositionArg;
      }

      if (typeof geoPositionArg === 'object') {
        const longitude = (geoPositionArg as GeoPositionSchema).longitude;
        const latitude = (geoPositionArg as GeoPositionSchema).latitude;
        return [longitude, latitude];
      }

      return invalidCoords;
    })();

    this.longitude = parseFloat(coords[0].toFixed(6));
    this.latitude = parseFloat(coords[1].toFixed(6));
    this.properties = {};
  }

  public isValid() {
    return (this.longitude !== Infinity) && (this.latitude !== Infinity);
  }

  // From https://stackoverflow.com/a/27943
  public distanceFrom(pointB: GeoPosition): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (pointB.latitude - this.latitude) * Math.PI / 180;
    const dLon = (pointB.longitude - this.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.latitude * Math.PI / 180) * Math.cos(pointB.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; 
    const dMeters = Math.round(d * 1000);

    return dMeters;
  }

  public asLatLngString(roundCoords: boolean = true): string {
    let s = '';

    if (roundCoords) {
      s = this.latitude.toFixed(6) + ',' + this.longitude.toFixed(6);
    } else {
      s = this.latitude + ',' + this.longitude;
    }

    return s;
  }

  // For Mapbox LngLat constructs
  public asLngLat(): [number, number] {
    const coords: [number, number] = [this.longitude, this.latitude];
    return coords;
  }
}
