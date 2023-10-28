import * as GeoJSON from 'geojson'

import { XPathOJP } from "../helpers/xpath-ojp";
import { GeoPosition } from "./geoposition";
import { StopPlace } from "./stopplace";
import { Address } from "./address";
import { PointOfInterest } from "./poi";
import { TopographicPlace } from "./topographic-place";

interface NearbyLocation {
  distance: number
  location: Location
}

// TODO - long term: subclass from Location?
export type LocationType = 'stop' | 'address' | 'poi' | 'topographicPlace'

const literalCoordsRegexp = /^([0-9\.]+?),([0-9\.]+?)$/;

export class Location {
  public address: Address | null
  public stopPointRef: string | null
  public locationName: string | null
  public stopPlace: StopPlace | null
  public geoPosition: GeoPosition | null
  public poi: PointOfInterest | null
  public topographicPlace: TopographicPlace | null
  public attributes: Record<string, any>
  public probability: number | null
  public originSystem: string | null

  constructor() {
    this.address = null
    this.stopPointRef = null;
    this.locationName = null;
    this.stopPlace = null;
    this.geoPosition = null;
    this.poi = null;
    this.topographicPlace = null;
    this.attributes = {};
    this.probability = null;
    this.originSystem = null;
  }

  public static initWithOJPContextNode(contextNode: Node): Location {
    const location = new Location();

    location.address = Address.initFromContextNode(contextNode)
    location.stopPointRef = XPathOJP.queryText('siri:StopPointRef', contextNode)
    location.stopPlace = StopPlace.initFromContextNode(contextNode)
    location.geoPosition = GeoPosition.initFromContextNode(contextNode)
    location.poi = PointOfInterest.initFromContextNode(contextNode)
    location.topographicPlace = TopographicPlace.initFromContextNode(contextNode);

    let locationName = XPathOJP.queryText('ojp:LocationName/ojp:Text', contextNode)
    if (locationName === null) {
      locationName = XPathOJP.queryText('ojp:StopPointName/ojp:Text', contextNode)
    }
    location.locationName = locationName

    location.attributes = {}
    const attributesNodes = XPathOJP.queryNodes('ojp:Attribute/*', contextNode)
    attributesNodes.forEach(attributeNode => {
      const nodeNameParts = attributeNode.nodeName.split(':')
      const attrKey = nodeNameParts.length === 1 ? nodeNameParts[0] : nodeNameParts[1]
      const attrValue = XPathOJP.queryText('ojp:Attribute/' + attributeNode.nodeName, contextNode)
      if (attrValue) {
        location.attributes[attrKey] = attrValue.trim()
      }
    })

    const extensionAttributesNodes = XPathOJP.queryNodes('ojp:Extension/ojp:LocationExtensionStructure/*', contextNode)
    extensionAttributesNodes.forEach(attributeNode => {
      const nodeNameParts = attributeNode.nodeName.split(':')
      if (nodeNameParts.length !== 2) {
        return;
      }
      const attrKey = nodeNameParts[1]
      const attrValue = attributeNode.textContent;
      location.attributes[attrKey] = attrValue;
    })

    if (location.stopPointRef === null && location.stopPlace?.stopPlaceRef) {
      location.stopPointRef = location.stopPlace.stopPlaceRef;
    }

    const probabilityS = XPathOJP.queryText('../ojp:Probability', contextNode);
    if (probabilityS) {
      location.probability = parseFloat(probabilityS);
    }

    location.originSystem = XPathOJP.queryText('../ojp:OriginSystem', contextNode);

    return location
  }

  public static initWithStopPlaceRef(stopPlaceRef: string, stopPlaceName: string = ''): Location {
    const location = new Location()
    location.stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, null)

    return location
  }

  public static initWithLngLat(longitude: number, latitude: number): Location {
    const location = new Location()
    location.geoPosition = new GeoPosition(longitude, latitude);

    return location
  }

  public static initWithFeature(feature: GeoJSON.Feature): Location | null {
    const geoPosition = GeoPosition.initWithFeature(feature)
    if (geoPosition === null) {
      return null
    }

    const attrs = feature.properties
    if (attrs === null) {
      return null
    }

    const location = new Location()
    location.geoPosition = geoPosition;
    location.locationName = attrs['locationName'] ?? null;

    const stopPlaceRef = attrs['stopPlace.stopPlaceRef'];
    if (stopPlaceRef) {
      const stopPlaceName = attrs['stopPlace.stopPlaceName'] ?? null;
      location.stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, null)
    }

    const addressCode = attrs['addressCode'];
    if (addressCode) {
      const addressName = attrs['addressName'] ?? null;
      const topographicPlaceRef = attrs['topographicPlaceRef'] ?? null;
      location.address = new Address(addressCode, addressName, topographicPlaceRef)
    }

    return location
  }

  public static initFromLiteralCoords(inputS: string): Location | null {
    let inputLiteralCoords = inputS.trim();
    // strip: parantheses (groups)
    inputLiteralCoords = inputLiteralCoords.replace(/\(.+?\)/g, '');
    // strip: characters NOT IN [0..9 , .]
    inputLiteralCoords = inputLiteralCoords.replace(/[^0-9\.,]/g, '');

    const inputMatches = inputLiteralCoords.match(literalCoordsRegexp);
    if (inputMatches === null) {
      return null
    }

    let longitude = parseFloat(inputMatches[1])
    let latitude = parseFloat(inputMatches[2])
    // In CH always long < lat
    if (longitude > latitude) {
      longitude = parseFloat(inputMatches[2])
      latitude = parseFloat(inputMatches[1])
    }
    
    const location = Location.initWithLngLat(longitude, latitude)

    // Match the content inside the ()
    const locationNameMatches = inputS.trim().match(/\(([^\)]*)\)?/);
    if (locationNameMatches !== null) {
      const locationName = locationNameMatches[1];
      location.locationName = locationName;
    }
    
    return location
  }

  asGeoJSONFeature(): GeoJSON.Feature<GeoJSON.Point> | null {
    if (this.geoPosition === null) {
      return null
    }

    const featureProperties: GeoJSON.GeoJsonProperties = {
    };

    const stopPlaceRef = this.stopPlace?.stopPlaceRef ?? null;
    if (stopPlaceRef) {
      featureProperties['stopPlace.stopPlaceRef'] = this.stopPlace?.stopPlaceRef ?? ''
      featureProperties['stopPlace.stopPlaceName'] = this.stopPlace?.stopPlaceName ?? ''
      featureProperties['stopPlace.topographicPlaceRef'] = this.stopPlace?.topographicPlaceRef ?? ''
    }

    if (this.address) {
      featureProperties['addressCode'] = this.address?.addressCode ?? ''
      featureProperties['addressName'] = this.address?.addressName ?? ''
      featureProperties['topographicPlaceRef'] = this.address?.topographicPlaceRef ?? ''
    }

    if (this.poi) {
      featureProperties['poi.name'] = this.poi.name;
      featureProperties['poi.code'] = this.poi.code;
      featureProperties['poi.category'] = this.poi.category;
      featureProperties['poi.subcategory'] = this.poi.subCategory;
      featureProperties['poi.osm.tags'] = this.poi.categoryTags.join(',');
    }

    featureProperties['locationName'] = this.locationName ?? '';

    for (let attrKey in this.attributes) {
      featureProperties['OJP.Attr.' + attrKey] = this.attributes[attrKey]
    }

    const feature: GeoJSON.Feature<GeoJSON.Point> = {
      type: 'Feature',
      properties: featureProperties,
      geometry: {
        type: 'Point',
        coordinates: [
          this.geoPosition.longitude,
          this.geoPosition.latitude
        ]
      }
    }

    return feature
  }

  public computeLocationName(includeLiteralCoords: boolean = true): string | null {
    if (this.stopPlace) {
      return this.stopPlace.stopPlaceName;
    }

    if (this.topographicPlace?.name) {
      return this.topographicPlace.name;
    }

    if (this.poi && this.poi.name) {
      return this.poi.name;
    }
    
    if (this.locationName) {
      return this.locationName;
    }

    if (includeLiteralCoords && this.geoPosition) {
      return this.geoPosition.asLatLngString();
    }

    return null;
  }

  public findClosestLocation(otherLocations: Location[]): NearbyLocation | null {
    const geoPositionA = this.geoPosition;
    if (geoPositionA === null) {
      return null;
    }

    let closestLocation: NearbyLocation | null = null;

    otherLocations.forEach(locationB => {
      const geoPositionB = locationB.geoPosition;
      if (geoPositionB === null) {
        return;
      }

      const dAB = geoPositionA.distanceFrom(geoPositionB);
      if ((closestLocation === null) || (dAB < closestLocation.distance)) {
        closestLocation = {
          location: locationB,
          distance: dAB
        }
      }
    });

    return closestLocation;
  }

  public getLocationType(): LocationType | null {
    if (this.stopPlace) {
      return 'stop';
    }

    if (this.poi) {
      return 'poi';
    }

    if (this.address) {
      return 'address';
    }

    if (this.topographicPlace) {
      return 'topographicPlace';
    }

    return null
  }
}
