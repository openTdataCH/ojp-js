import * as mapboxgl from "mapbox-gl";
import * as GeoJSON from 'geojson'
import { TreeNode } from "../xml/tree-node";

export class GeoPosition {
  public longitude: number
  public latitude: number
  public properties: GeoJSON.GeoJsonProperties | null

  constructor(longitude: number, latitude: number) {
    this.longitude = parseFloat(longitude.toFixed(6));
    this.latitude = parseFloat(latitude.toFixed(6));
    this.properties = null;
  }

  public static initWithStringCoords(longitudeS: string | null, latitudeS: string | null) {
    if (longitudeS === null || latitudeS === null) {
      return null;
    }

    const longitude = parseFloat(longitudeS);
    const latitude = parseFloat(latitudeS);

    if (longitude === 0 || latitude === 0) {
      return null;
    }

    const geoPosition = new GeoPosition(longitude, latitude);

    return geoPosition;
  }

  public static initWithLocationTreeNode(locationTreeNode: TreeNode): GeoPosition | null {
    const longitudeS = locationTreeNode.findTextFromChildNamed('ojp:GeoPosition/siri:Longitude');
    const latitudeS = locationTreeNode.findTextFromChildNamed('ojp:GeoPosition/siri:Latitude');

    const geoPosition = GeoPosition.initWithStringCoords(longitudeS, latitudeS);
    return geoPosition;
  }

  public static initWithFeature(feature: GeoJSON.Feature): GeoPosition | null {
    if (feature.geometry.type !== 'Point') {
      return null
    }

    const lngLatAr = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
    const longitude = lngLatAr[0]
    const latitude = lngLatAr[1]

    const geoPosition = new GeoPosition(longitude, latitude)
    geoPosition.properties = feature.properties

    return geoPosition
  }

  public asLngLat(): mapboxgl.LngLatLike {
    const lnglat = [
      this.longitude, 
      this.latitude,
    ];

    return lnglat as mapboxgl.LngLatLike;
  }

  public asLatLngString(roundCoords: boolean = true): string {
    let s = ''

    if (roundCoords) {
      s = this.latitude.toFixed(6) + ',' + this.longitude.toFixed(6);
    } else {
      s = this.latitude + ',' + this.longitude;
    }

    return s
  }

  public asPosition(): GeoJSON.Position {
    return [this.longitude, this.latitude]
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
}
