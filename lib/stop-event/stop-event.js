import { StopPoint } from '../trip/leg/timed-leg/stop-point';
import { JourneyService } from '../journey/journey-service';
import { DateHelpers } from '../helpers/date-helpers';
export class StopEvent {
    constructor(stopPoint, journeyService) {
        this.stopPoint = stopPoint;
        this.journeyService = journeyService;
        this.prevStopPoints = [];
        this.nextStopPoints = [];
    }
    static initWithTreeNode(treeNode) {
        const stopEventTreeNode = treeNode.findChildNamed('StopEvent');
        if (stopEventTreeNode === null) {
            return null;
        }
        const currentStopTreeNode = stopEventTreeNode.findChildNamed('ThisCall/CallAtStop');
        if (currentStopTreeNode === null) {
            return null;
        }
        const stopPoint = StopPoint.initWithTreeNode(currentStopTreeNode, 'Intermediate');
        if (stopPoint === null) {
            return null;
        }
        const journeyService = JourneyService.initWithTreeNode(stopEventTreeNode);
        if (journeyService === null) {
            return null;
        }
        const stopEvent = new StopEvent(stopPoint, journeyService);
        const tripNodeTypes = ['PreviousCall', 'OnwardCall'];
        tripNodeTypes.forEach(tripNodeType => {
            const is_previous = tripNodeType === 'PreviousCall';
            const stopPointsRef = is_previous ? stopEvent.prevStopPoints : stopEvent.nextStopPoints;
            const groupStopsTreeNodes = stopEventTreeNode.findChildrenNamed(tripNodeType);
            groupStopsTreeNodes.forEach(groupStopsTreeNode => {
                const tripStopPointNode = groupStopsTreeNode.findChildNamed('CallAtStop');
                if (tripStopPointNode === null) {
                    return;
                }
                const tripStopPoint = StopPoint.initWithTreeNode(tripStopPointNode, 'Intermediate');
                if (tripStopPoint) {
                    stopPointsRef.push(tripStopPoint);
                }
            });
        });
        return stopEvent;
    }
    patchStopEventLocations(mapContextLocations) {
        let stopPointsToPatch = [this.stopPoint];
        const stopPointEventTypes = ['prev', 'next'];
        stopPointEventTypes.forEach(stopPointEventType => {
            const is_previous = stopPointEventType === 'prev';
            let stopPointsRef = is_previous ? this.prevStopPoints : this.nextStopPoints;
            stopPointsToPatch = stopPointsToPatch.concat(stopPointsRef);
        });
        stopPointsToPatch.forEach(stopPoint => {
            var _a;
            const stopPointRef = (_a = stopPoint.location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef;
            if (stopPointRef && (stopPointRef in mapContextLocations)) {
                stopPoint.location = mapContextLocations[stopPointRef];
            }
        });
    }
    asStationBoard() {
        var _a, _b, _c;
        const serviceLineNumber = this.computeServiceLineNumber();
        const servicePtMode = (_a = this.journeyService.ptMode.shortName) !== null && _a !== void 0 ? _a : 'N/A';
        const arrivalTime = this.computeStopTimeData(this.stopPoint.arrivalData);
        const departureTime = this.computeStopTimeData(this.stopPoint.departureData);
        const stopPlatformActual = this.stopPoint.plannedPlatform === this.stopPoint.actualPlatform ? null : this.stopPoint.actualPlatform;
        const model = {
            stopEvent: this,
            serviceLineNumber: serviceLineNumber,
            servicePtMode: servicePtMode,
            tripNumber: this.journeyService.journeyNumber,
            tripHeading: (_c = (_b = this.journeyService.destinationStopPlace) === null || _b === void 0 ? void 0 : _b.stopPlaceName) !== null && _c !== void 0 ? _c : 'N/A',
            tripOperator: this.journeyService.agencyCode,
            mapStationBoardTime: {
                Arrivals: arrivalTime,
                Departures: departureTime
            },
            stopPlatform: this.stopPoint.plannedPlatform,
            stopPlatformActual: stopPlatformActual,
            stopSituations: [],
        };
        // TODO - share the logic with OJP GUI 
        //  => src/app/journey/journey-result-row/result-trip-leg/result-trip-leg.component.ts
        model.stopSituations = (() => {
            const situationsData = [];
            this.stopPoint.siriSituations.forEach(situation => {
                situation.publishingActions.forEach(publishingAction => {
                    const mapTextualContent = publishingAction.passengerInformation.mapTextualContent;
                    const situationData = {};
                    if ('Summary' in mapTextualContent) {
                        situationData.summary = mapTextualContent['Summary'].join('. ');
                    }
                    if ('Description' in mapTextualContent) {
                        situationData.description = mapTextualContent['Description'].join('. ');
                    }
                    situationData.details = [];
                    const detailKeys = ['Consequence', 'Duration', 'Reason', 'Recommendation', 'Remark'];
                    detailKeys.forEach(detailKey => {
                        if (detailKey in mapTextualContent) {
                            situationData.details = situationData.details.concat(mapTextualContent[detailKey]);
                        }
                    });
                    situationsData.push(situationData);
                });
            });
            return situationsData;
        })();
        return model;
    }
    computeServiceLineNumber() {
        var _a;
        const serviceShortName = (_a = this.journeyService.ptMode.shortName) !== null && _a !== void 0 ? _a : 'N/A';
        const serviceLineNumber = this.journeyService.serviceLineNumber;
        if (serviceLineNumber) {
            return serviceLineNumber;
        }
        else {
            return serviceShortName;
        }
    }
    computeStopTimeData(stopPointTime) {
        var _a;
        if (stopPointTime === null) {
            return null;
        }
        const hasDelay = stopPointTime.delayMinutes !== null;
        const timetableTimeF = DateHelpers.formatTimeHHMM(stopPointTime.timetableTime);
        const estimatedTimeF = stopPointTime.estimatedTime ? DateHelpers.formatTimeHHMM(stopPointTime.estimatedTime) : 'n/a';
        const hasDelayDifferentTime = stopPointTime.estimatedTime ? (timetableTimeF !== estimatedTimeF) : false;
        const stopTime = this.computeStopTime(stopPointTime.timetableTime);
        if (stopTime === null) {
            return null;
        }
        const stopTimeData = {
            stopTime: stopTime,
            stopTimeActual: this.computeStopTime((_a = stopPointTime.estimatedTime) !== null && _a !== void 0 ? _a : null),
            stopDelayText: this.computeDelayTime(stopPointTime),
            hasDelay: hasDelay,
            hasDelayDifferentTime: hasDelayDifferentTime,
        };
        return stopTimeData;
    }
    computeStopTime(stopTime) {
        if (stopTime === null) {
            return null;
        }
        const stopTimeText = DateHelpers.formatTimeHHMM(stopTime);
        return stopTimeText;
    }
    computeDelayTime(stopPointTime) {
        var _a;
        const delayMinutes = (_a = stopPointTime.delayMinutes) !== null && _a !== void 0 ? _a : null;
        if (delayMinutes === null) {
            return null;
        }
        if (delayMinutes === 0) {
            return 'ON TIME';
        }
        const delayTextParts = [];
        delayTextParts.push(' ');
        delayTextParts.push(delayMinutes > 0 ? '+' : '');
        delayTextParts.push('' + delayMinutes);
        delayTextParts.push("'");
        const delayText = delayTextParts.join('');
        return delayText;
    }
}
