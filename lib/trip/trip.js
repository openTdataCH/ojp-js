import { TripLegFactory } from './leg/trip-leg-factory';
import { TripTimedLeg } from './leg/trip-timed-leg';
import { Duration } from '../shared/duration';
import { GeoPositionBBOX } from '../location/geoposition-bbox';
import { GeoPosition } from '../location/geoposition';
export class Trip {
    constructor(tripID, legs, tripStats) {
        this.id = tripID;
        this.legs = legs;
        this.stats = tripStats;
    }
    static initFromTreeNode(treeNode) {
        const tripId = treeNode.findTextFromChildNamed('Id');
        if (tripId === null) {
            return null;
        }
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
        const legs = [];
        let tripLegsTotalDistance = 0;
        const tripLegTreeNodes = treeNode.findChildrenNamed('Leg');
        tripLegTreeNodes.forEach(tripLegTreeNode => {
            var _a, _b;
            const tripLeg = TripLegFactory.initWithTreeNode(tripLegTreeNode);
            if (tripLeg === null) {
                return;
            }
            const legTrackSections = (_b = (_a = tripLeg.legTrack) === null || _a === void 0 ? void 0 : _a.trackSections) !== null && _b !== void 0 ? _b : [];
            legTrackSections.forEach(legTrackSection => {
                var _a;
                tripLegsTotalDistance += (_a = legTrackSection.length) !== null && _a !== void 0 ? _a : 0;
            });
            legs.push(tripLeg);
        });
        if (legs.length === 0) {
            console.error('Trip.initFromTreeNode no legs found ?');
            console.log(treeNode);
            return null;
        }
        let distanceMeters = 0;
        let distanceSource = 'trip';
        const distanceS = treeNode.findTextFromChildNamed('Distance');
        if (distanceS === null) {
            distanceSource = 'legs-sum';
            distanceMeters = tripLegsTotalDistance;
        }
        else {
            distanceMeters = parseInt(distanceS);
        }
        const tripStats = {
            duration: duration,
            distanceMeters: distanceMeters,
            distanceSource: distanceSource,
            transferNo: parseInt(transfersNoS),
            startDatetime: tripStartTime,
            endDatetime: tripEndTime,
        };
        const trip = new Trip(tripId, legs, tripStats);
        return trip;
    }
    computeDepartureTime() {
        var _a;
        const timedLegs = this.legs.filter(leg => {
            return leg instanceof TripTimedLeg;
        });
        if (timedLegs.length === 0) {
            console.log('No TimedLeg found for this trip');
            console.log(this);
            return null;
        }
        const firstTimedLeg = timedLegs[0];
        const timeData = firstTimedLeg.fromStopPoint.departureData;
        if (timeData === null) {
            return null;
        }
        const stopPointDate = (_a = timeData.estimatedTime) !== null && _a !== void 0 ? _a : timeData.timetableTime;
        return stopPointDate;
    }
    computeArrivalTime() {
        var _a;
        const timedLegs = this.legs.filter(leg => {
            return leg instanceof TripTimedLeg;
        });
        if (timedLegs.length === 0) {
            console.log('No TimedLeg found for this trip');
            console.log(this);
            return new Date();
        }
        const lastTimedLeg = timedLegs[timedLegs.length - 1];
        const timeData = lastTimedLeg.toStopPoint.arrivalData;
        if (timeData === null) {
            return null;
        }
        const stopPointDate = (_a = timeData.estimatedTime) !== null && _a !== void 0 ? _a : timeData.timetableTime;
        return stopPointDate;
    }
    computeGeoJSON() {
        let features = [];
        this.legs.forEach(leg => {
            const legFeatures = leg.computeGeoJSONFeatures();
            features = features.concat(legFeatures);
        });
        const geojson = {
            type: 'FeatureCollection',
            features: features,
        };
        return geojson;
    }
    computeFromLocation() {
        if (this.legs.length === 0) {
            return null;
        }
        const firstLeg = this.legs[0];
        return firstLeg.fromLocation;
    }
    computeToLocation() {
        if (this.legs.length === 0) {
            return null;
        }
        const lastLeg = this.legs[this.legs.length - 1];
        return lastLeg.toLocation;
    }
    computeBBOX() {
        var _a, _b;
        const bbox = new GeoPositionBBOX([]);
        const fromGeoPosition = (_a = this.computeFromLocation()) === null || _a === void 0 ? void 0 : _a.geoPosition;
        if (fromGeoPosition) {
            bbox.extend(fromGeoPosition);
        }
        const toGeoPosition = (_b = this.computeToLocation()) === null || _b === void 0 ? void 0 : _b.geoPosition;
        if (toGeoPosition) {
            bbox.extend(toGeoPosition);
        }
        this.legs.forEach(leg => {
            const features = leg.computeGeoJSONFeatures();
            features.forEach(feature => {
                var _a;
                const featureBBOX = (_a = feature.bbox) !== null && _a !== void 0 ? _a : null;
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
