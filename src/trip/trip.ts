import * as GeoJSON from 'geojson'

import { DistanceSource, TripStats } from '../types/trip-stats'

import { TripLeg } from './leg/trip-leg'
import { TripLegFactory } from './leg/trip-leg-factory'
import { TripTimedLeg } from './leg/trip-timed-leg'
import { Duration } from '../shared/duration'
import { Location } from '../location/location';
import { GeoPositionBBOX } from '../location/geoposition-bbox'
import { GeoPosition } from '../location/geoposition'
import { TreeNode } from '../xml/tree-node'
import { TripFareResult } from '../fare/fare'

export class Trip {
  public id: string
  public legs: TripLeg[]
  public stats: TripStats
  public tripFareResults: TripFareResult[]

  constructor(tripID: string, legs: TripLeg[], tripStats: TripStats) {
    this.id = tripID;
    this.legs = legs;
    this.stats = tripStats
    this.tripFareResults = []
  }

  public static initFromTreeNode(treeNode: TreeNode): Trip | null {
    // HACK for solution demo, backend sometimes delivers Trip with empty Id
    // TODO: revert when backend is ready, DONT merge to main
    const tripId = treeNode.findTextFromChildNamed('Id') ?? 'RandomTripId';
    // if (tripId === null) {
    //   return null;
    // }

    const duration = Duration.initFromDurationText(treeNode.findTextFromChildNamed('Duration'));
    if (duration === null) {
      return null;
    }

    const transfersNoS = treeNode.findTextFromChildNamed('Transfers');
    if (transfersNoS === null) {
      return null;
    }

    const tripStartTimeS = treeNode.findTextFromChildNamed('StartTime');
    const tripEndTimeS = treeNode.findTextFromChildNamed('EndTime');
    if (tripStartTimeS === null || tripEndTimeS === null) {
      return null;
    }

    const tripStartTime = new Date(Date.parse(tripStartTimeS));
    const tripEndTime = new Date(Date.parse(tripEndTimeS));

    const legs: TripLeg[] = [];
    let tripLegsTotalDistance = 0;

    const tripLegTreeNodes = treeNode.findChildrenNamed('Leg');
    tripLegTreeNodes.forEach(tripLegTreeNode => {
      const tripLeg = TripLegFactory.initWithTreeNode(tripLegTreeNode);
      if (tripLeg === null) {
        return;
      }

      const legTrackSections = tripLeg.legTrack?.trackSections ?? [];
      legTrackSections.forEach(legTrackSection => {
        tripLegsTotalDistance += legTrackSection.length ?? 0;
      });

      legs.push(tripLeg);
    });

    if (legs.length === 0) {
      console.error('Trip.initFromTreeNode no legs found ?');
      console.log(treeNode);
      return null;
    }

    let distanceMeters = 0;
    let distanceSource: DistanceSource = 'trip';
    const distanceS = treeNode.findTextFromChildNamed('Distance');
    if (distanceS === null) {
      distanceSource = 'legs-sum';
      distanceMeters = tripLegsTotalDistance;
    } else {
      distanceMeters = parseInt(distanceS);
    }

    const tripStats: TripStats = {
      duration: duration,
      distanceMeters: distanceMeters,
      distanceSource: distanceSource,
      transferNo: parseInt(transfersNoS),
      startDatetime: tripStartTime,
      endDatetime: tripEndTime,
    }

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
