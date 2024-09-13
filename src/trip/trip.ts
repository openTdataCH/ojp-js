import * as GeoJSON from 'geojson'

import { XPathOJP } from '../helpers/xpath-ojp'

import { TripStats } from '../types/trip-stats'

import { TripLeg } from './leg/trip-leg'
import { TripLegFactory } from './leg/trip-leg-factory'
import { TripTimedLeg } from './leg/trip-timed-leg'
import { Duration } from '../shared/duration'
import { Location } from '../location/location';
import { GeoPositionBBOX } from '../location/geoposition-bbox'
import { GeoPosition } from '../location/geoposition'

export class Trip {
  public id: string
  public legs: TripLeg[]
  public stats: TripStats

  constructor(tripID: string, legs: TripLeg[], tripStats: TripStats) {
    this.id = tripID;
    this.legs = legs;
    this.stats = tripStats
  }

  public static initFromTripResultNode(tripResultNode: Node) {
    const tripId = XPathOJP.queryText('ojp:Trip/ojp:TripId', tripResultNode)
    if (tripId === null) {
      return null;
    }

    const tripNode = XPathOJP.queryNode('ojp:Trip', tripResultNode)
    const duration = Duration.initFromContextNode(tripNode)
    if (duration === null) {
      return null;
    }

    const distanceS = XPathOJP.queryText('ojp:Trip/ojp:Distance', tripResultNode)
    // if (distanceS === null) {
    //   return null;
    // }

    const transfersNoS = XPathOJP.queryText('ojp:Trip/ojp:Transfers', tripResultNode)
    if (transfersNoS === null) {
      return null;
    }

    const tripStartTimeS = XPathOJP.queryText('ojp:Trip/ojp:StartTime', tripResultNode);
    const tripEndTimeS = XPathOJP.queryText('ojp:Trip/ojp:EndTime', tripResultNode);

    if (tripStartTimeS === null || tripEndTimeS === null) {
      return null;
    }

    const tripStartTime = new Date(Date.parse(tripStartTimeS));
    const tripEndTime = new Date(Date.parse(tripEndTimeS));

    const distanceMeters = distanceS === null ? 0 : parseInt(distanceS);

    const tripStats = <TripStats>{
      duration: duration,
      distanceMeters: distanceMeters,
      transferNo: parseInt(transfersNoS),
      startDatetime: tripStartTime,
      endDatetime: tripEndTime,
    }

    let legs: TripLeg[] = [];

    const tripResponseLegs = XPathOJP.queryNodes('ojp:Trip/ojp:TripLeg', tripResultNode)
    tripResponseLegs.forEach(tripLegNode => {
      const tripLeg = TripLegFactory.initWithContextNode(tripLegNode);
      if (tripLeg === null) {
        return
      }

      legs.push(tripLeg);
    })

    const trip = new Trip(tripId, legs, tripStats);

    return trip;
  }

  public computeDepartureTime(): Date | null {
    const timedLegs = this.legs.filter(leg => {
      return leg instanceof TripTimedLeg;
    });

    if (timedLegs.length === 0) {
      console.log('No TimedLeg found for this trip');
      console.log(this);
      return null;
    }

    const firstTimedLeg = timedLegs[0] as TripTimedLeg;
    const timeData = firstTimedLeg.fromStopPoint.departureData;
    if (timeData === null) {
      return null
    }

    const stopPointDate = timeData.estimatedTime ?? timeData.timetableTime;

    return stopPointDate;
  }

  public computeArrivalTime(): Date | null {
    const timedLegs = this.legs.filter(leg => {
      return leg instanceof TripTimedLeg;
    });

    if (timedLegs.length === 0) {
      console.log('No TimedLeg found for this trip');
      console.log(this);
      return new Date();
    }

    const lastTimedLeg = timedLegs[timedLegs.length - 1] as TripTimedLeg;
    const timeData = lastTimedLeg.toStopPoint.arrivalData;
    if (timeData === null) {
      return null
    }

    const stopPointDate = timeData.estimatedTime ?? timeData.timetableTime;

    return stopPointDate;
  }

  public computeGeoJSON(): GeoJSON.FeatureCollection {
    let features: GeoJSON.Feature[] = []

    this.legs.forEach(leg => {
      const legFeatures = leg.computeGeoJSONFeatures();
      features = features.concat(legFeatures);
    });

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: features,
    }

    return geojson
  }

  public computeFromLocation(): Location | null {
    if (this.legs.length === 0) {
      return null;
    }

    const firstLeg = this.legs[0];
    return firstLeg.fromLocation;
  }

  public computeToLocation(): Location | null {
    if (this.legs.length === 0) {
      return null;
    }

    const lastLeg = this.legs[this.legs.length - 1];
    return lastLeg.toLocation;
  }

  public computeBBOX(): GeoPositionBBOX {
    const bbox = new GeoPositionBBOX([]);

    const fromGeoPosition = this.computeFromLocation()?.geoPosition;
    if (fromGeoPosition) {
      bbox.extend(fromGeoPosition);
    }
    const toGeoPosition = this.computeToLocation()?.geoPosition;
    if (toGeoPosition) {
      bbox.extend(toGeoPosition);
    }

    this.legs.forEach(leg => {
      const features = leg.computeGeoJSONFeatures();
      features.forEach(feature => {
        const featureBBOX = feature.bbox ?? null;
        if (featureBBOX === null) {
          return;
        }

        bbox.extend(new GeoPosition(featureBBOX[0], featureBBOX[1]));
        bbox.extend(new GeoPosition(featureBBOX[2], featureBBOX[3]));
      });
    });

    return bbox;
  }
}
