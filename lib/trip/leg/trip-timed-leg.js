import { JourneyService } from '../../journey/journey-service';
import { StopPoint } from './timed-leg/stop-point';
import { LegTrack } from './leg-track';
import { TripLeg } from "./trip-leg";
import { Duration } from '../../shared/duration';
export class TripTimedLeg extends TripLeg {
    constructor(legIDx, service, fromStopPoint, toStopPoint, intermediateStopPoints = []) {
        const legType = 'TimedLeg';
        super(legType, legIDx, fromStopPoint.location, toStopPoint.location);
        this.service = service;
        this.fromStopPoint = fromStopPoint;
        this.toStopPoint = toStopPoint;
        this.intermediateStopPoints = intermediateStopPoints;
    }
    static initWithTreeNode(legIDx, parentTreeNode) {
        const treeNode = parentTreeNode.findChildNamed('TimedLeg');
        if (treeNode === null) {
            return null;
        }
        const service = JourneyService.initWithTreeNode(treeNode);
        if (service === null) {
            return null;
        }
        const fromStopTreeNode = treeNode.findChildNamed('LegBoard');
        const toStopTreeNode = treeNode.findChildNamed('LegAlight');
        if (fromStopTreeNode === null || toStopTreeNode === null) {
            return null;
        }
        const fromStopPoint = StopPoint.initWithTreeNode(fromStopTreeNode, 'From');
        const toStopPoint = StopPoint.initWithTreeNode(toStopTreeNode, 'To');
        if (fromStopPoint === null || toStopPoint === null) {
            return null;
        }
        const intermediateStopPoints = [];
        const intermediaryStopTreeNodes = treeNode.findChildrenNamed('LegIntermediate');
        intermediaryStopTreeNodes.forEach(intermediaryStopTreeNode => {
            const stopPoint = StopPoint.initWithTreeNode(intermediaryStopTreeNode, 'Intermediate');
            if (stopPoint) {
                intermediateStopPoints.push(stopPoint);
            }
        });
        const timedLeg = new TripTimedLeg(legIDx, service, fromStopPoint, toStopPoint, intermediateStopPoints);
        timedLeg.legTrack = LegTrack.initWithLegTreeNode(treeNode);
        timedLeg.legDuration = (() => {
            var _a, _b;
            // for TimedLeg Duration is at the parent level
            const timedLegDuration = Duration.initWithTreeNode(parentTreeNode);
            if (timedLegDuration !== null) {
                return timedLegDuration;
            }
            // rely on legtrack if present
            return (_b = (_a = timedLeg.legTrack) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : null;
        })();
        return timedLeg;
    }
    patchLocations(mapContextLocations) {
        super.patchLocations(mapContextLocations);
        this.intermediateStopPoints.forEach(stopPoint => {
            this.patchLocation(stopPoint.location, mapContextLocations);
        });
    }
    computeDepartureTime() {
        return this.computeStopPointTime(this.fromStopPoint.departureData);
    }
    computeArrivalTime() {
        return this.computeStopPointTime(this.toStopPoint.arrivalData);
    }
    computeStopPointTime(timeData) {
        var _a;
        if (timeData === null) {
            return null;
        }
        const stopPointDate = (_a = timeData.estimatedTime) !== null && _a !== void 0 ? _a : timeData.timetableTime;
        return stopPointDate;
    }
    patchSituations(mapContextSituations) {
        this.service.siriSituations = [];
        this.service.siriSituationIds.forEach(siriSituationId => {
            var _a;
            const siriSituation = (_a = mapContextSituations[siriSituationId]) !== null && _a !== void 0 ? _a : null;
            if (siriSituation) {
                this.service.siriSituations.push(siriSituation);
            }
        });
    }
    addToXMLNode(parentNode, xmlConfig) {
        var _a, _b;
        const isOJPv1 = xmlConfig.ojpVersion === '1.0';
        const ojpPrefix = xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const legNodeName = isOJPv1 ? 'TripLeg' : 'Leg';
        const tripLegNode = parentNode.ele(ojpPrefix + legNodeName);
        const legIdTagName = isOJPv1 ? 'LegId' : 'Id';
        tripLegNode.ele(ojpPrefix + legIdTagName, this.legID);
        const legDurationF = (_b = (_a = this.legDuration) === null || _a === void 0 ? void 0 : _a.asOJPFormattedText()) !== null && _b !== void 0 ? _b : null;
        if (legDurationF) {
            tripLegNode.ele(ojpPrefix + 'Duration', legDurationF);
        }
        const timedLeg = tripLegNode.ele(ojpPrefix + 'TimedLeg');
        const boardingTypes = ['Arr', 'Dep'];
        const addStopPoint = (stopPoint, stopPointType) => {
            var _a;
            const legEndpointName = (() => {
                if (stopPointType === 'From') {
                    return ojpPrefix + 'LegBoard';
                }
                if (stopPointType === 'To') {
                    return ojpPrefix + 'LegAlight';
                }
                const tagName = isOJPv1 ? 'LegIntermediates' : 'LegIntermediate';
                return ojpPrefix + tagName;
            })();
            const legEndpoint = timedLeg.ele(legEndpointName);
            const stopPlace = stopPoint.location.stopPlace;
            if (stopPlace) {
                legEndpoint.ele(siriPrefix + 'StopPointRef', stopPlace.stopPlaceRef);
                legEndpoint.ele(ojpPrefix + 'StopPointName').ele(ojpPrefix + 'Text', (_a = stopPlace.stopPlaceName) !== null && _a !== void 0 ? _a : 'n/a');
            }
            if (stopPoint.vehicleAccessType) {
                legEndpoint.ele(ojpPrefix + 'NameSuffix').ele(ojpPrefix + 'Text', stopPoint.vehicleAccessType);
            }
            if (stopPoint.plannedPlatform) {
                legEndpoint.ele(ojpPrefix + 'PlannedQuay').ele(ojpPrefix + 'Text', stopPoint.plannedPlatform);
            }
            if (stopPoint.actualPlatform) {
                legEndpoint.ele(ojpPrefix + 'EstimatedQuay').ele(ojpPrefix + 'Text', stopPoint.actualPlatform);
            }
            boardingTypes.forEach(boardingType => {
                const isArrival = boardingType === 'Arr';
                const serviceDepArrData = isArrival ? stopPoint.arrivalData : stopPoint.departureData;
                if (serviceDepArrData) {
                    const serviceDepArrTagName = isArrival ? 'ServiceArrival' : 'ServiceDeparture';
                    const serviceDepArrNode = legEndpoint.ele(ojpPrefix + serviceDepArrTagName);
                    serviceDepArrNode.ele(ojpPrefix + 'TimetabledTime', serviceDepArrData.timetableTime.toISOString());
                    if (serviceDepArrData.estimatedTime) {
                        serviceDepArrNode.ele(ojpPrefix + 'EstimatedTime', serviceDepArrData.estimatedTime.toISOString());
                    }
                }
            });
            legEndpoint.ele(ojpPrefix + 'Order', legOrder);
            legOrder = legOrder + 1;
        };
        let legOrder = 1;
        addStopPoint(this.fromStopPoint, 'From');
        this.intermediateStopPoints.forEach(stopPoint => {
            addStopPoint(stopPoint, 'Intermediate');
        });
        addStopPoint(this.toStopPoint, 'To');
        this.service.addToXMLNode(timedLeg, xmlConfig);
    }
}
