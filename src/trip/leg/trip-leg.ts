import * as GeoJSON from 'geojson'

import { XMLElement } from 'xmlbuilder'

import { DataHelpers } from '../../helpers/data-helpers'

import { Location } from '../../location/location'
import { LegTrack } from './leg-track'

import { StopPointType } from '../../types/stop-point-type'
import { Duration } from '../../shared/duration'
import { PtSituationElement } from '../../situation/situation-element'
import { DEBUG_LEVEL } from '../../constants'
import { XML_Config } from '../../types/_all'

export type LegType = 'ContinuousLeg' | 'TimedLeg' | 'TransferLeg'

export interface LinePointData {
  type: StopPointType,
  feature: GeoJSON.Feature<GeoJSON.Point>
}

export class TripLeg {
  public legType: LegType
  public legID: number
  public fromLocation: Location
  public toLocation: Location
  public legTrack: LegTrack | null
  public legDuration: Duration | null

  constructor(legType: LegType, legIDx: number, fromLocation: Location, toLocation: Location) {
    this.legType = legType
    this.legID = legIDx
    this.fromLocation = fromLocation
    this.toLocation = toLocation
    this.legTrack = null
    this.legDuration = null
  }

  public patchLocations(mapContextLocations: Record<string, Location>) {
    [this.fromLocation, this.toLocation].forEach(location => {
      this.patchLocation(location, mapContextLocations);

      if (location.geoPosition) {
        return;
      }

      if (this.legTrack?.hasGeoData) {
        const isFrom = location === this.fromLocation;
        if (isFrom) {
          this.fromLocation.geoPosition = this.legTrack.fromGeoPosition();
        } else {
          this.toLocation.geoPosition = this.legTrack.toGeoPosition();
        }
      }
    })
  }

  public patchSituations(mapContextSituations: Record<string, PtSituationElement>) {
    // override
  }

  protected patchLocation(location: Location, mapContextLocations: Record<string, Location>) {
    if (location.geoPosition) {
      return;
    }

    let stopRef = location.stopPlace?.stopPlaceRef ?? null;
    if (stopRef === null) {
      if (DEBUG_LEVEL === 'DEBUG') {
        console.error('TripLeg.patchLocation - no stopPlaceRef found in location');
        console.log(location);
      }

      return;
    }

    if (!(stopRef in mapContextLocations)) {
      // For StopPoint try to get the StopPlace
      // see https://github.com/openTdataCH/ojp-sdk/issues/97
      stopRef = DataHelpers.convertStopPointToStopPlace(stopRef);
    }
    
    if (!(stopRef in mapContextLocations)) {
      if (DEBUG_LEVEL === 'DEBUG') {
        console.error('TripLeg.patchLocation - no stopPlaceRef found in mapContextLocations');
        console.log(location);
        console.log('location.stopPlace?.stopPlaceRef :' + stopRef);
        console.log(mapContextLocations);
      }
      
      return;
    }

    const contextLocation = mapContextLocations[stopRef];

    location.patchWithAnotherLocation(contextLocation);
  }

  public addToXMLNode(parentNode: XMLElement, xmlConfig: XML_Config) {
    // override
    debugger;
  }
}

