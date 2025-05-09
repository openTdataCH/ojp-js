import { Location } from "../../../location/location";
import { StopPointTime } from "./stop-point-time";
import { StopPlace } from "../../../location/stopplace";
import { DEBUG_LEVEL } from "../../../constants";
export class StopPoint {
    constructor(stopPointType, location, arrivalData, departureData, plannedPlatform, sequenceOrder) {
        this.stopPointType = stopPointType;
        this.location = location;
        this.arrivalData = arrivalData;
        this.departureData = departureData;
        this.plannedPlatform = plannedPlatform;
        this.actualPlatform = null;
        this.sequenceOrder = sequenceOrder;
        this.isNotServicedStop = null;
        this.siriSituationIds = [];
        this.siriSituations = [];
        this.vehicleAccessType = null;
        this.mapFareClassOccupancy = {
            firstClass: null,
            secondClass: null,
        };
    }
    static initWithTreeNode(treeNode, stopPointType) {
        const stopPointRef = treeNode.findTextFromChildNamed('siri:StopPointRef');
        const stopPointName = treeNode.findTextFromChildNamed('StopPointName/Text');
        if (!(stopPointRef && stopPointName)) {
            return null;
        }
        const location = new Location();
        location.stopPlace = new StopPlace(stopPointRef, stopPointName, null);
        const arrivalData = StopPointTime.initWithParentTreeNode(treeNode, 'ServiceArrival');
        const departureData = StopPointTime.initWithParentTreeNode(treeNode, 'ServiceDeparture');
        const plannedPlatform = treeNode.findTextFromChildNamed('PlannedQuay/Text');
        const sequenceOrderS = treeNode.findTextFromChildNamed('Order');
        const sequenceOrder = sequenceOrderS === null ? null : parseInt(sequenceOrderS, 10);
        const stopPoint = new StopPoint(stopPointType, location, arrivalData, departureData, plannedPlatform, sequenceOrder);
        stopPoint.actualPlatform = treeNode.findTextFromChildNamed('EstimatedQuay/Text');
        const notServicedStopNode = treeNode.findChildNamed('NotServicedStop');
        if (notServicedStopNode) {
            stopPoint.isNotServicedStop = notServicedStopNode.text === 'true';
        }
        stopPoint.siriSituationIds = [];
        const situationFullRefTreeNodes = treeNode.findChildrenNamed('SituationFullRef');
        situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
            const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('siri:SituationNumber');
            if (situationNumber) {
                stopPoint.siriSituationIds.push(situationNumber);
            }
        });
        stopPoint.vehicleAccessType = StopPoint.computePlatformAssistance(treeNode);
        stopPoint.mapFareClassOccupancy = StopPoint.computeMapFareClassOccupancy(treeNode);
        return stopPoint;
    }
    static computePlatformAssistance(treeNode) {
        const platformText = treeNode.findTextFromChildNamed('NameSuffix/Text');
        if (platformText === null) {
            return null;
        }
        if (platformText === 'PLATFORM_ACCESS_WITH_ASSISTANCE') {
            return 'PLATFORM_ACCESS_WITH_ASSISTANCE';
        }
        if (platformText === 'PLATFORM_ACCESS_WITH_ASSISTANCE_WHEN_NOTIFIED') {
            return 'PLATFORM_ACCESS_WITH_ASSISTANCE_WHEN_NOTIFIED';
        }
        if (platformText === 'PLATFORM_NOT_WHEELCHAIR_ACCESSIBLE') {
            return 'PLATFORM_NOT_WHEELCHAIR_ACCESSIBLE';
        }
        if (platformText === 'PLATFORM_ACCESS_WITHOUT_ASSISTANCE') {
            return 'PLATFORM_ACCESS_WITHOUT_ASSISTANCE';
        }
        if (platformText === 'NO_DATA') {
            return 'NO_DATA';
        }
        if (platformText === 'ALTERNATIVE_TRANSPORT') {
            return 'ALTERNATIVE_TRANSPORT';
        }
        if (DEBUG_LEVEL === 'DEBUG') {
            console.log('StopPoint.computePlatformAssistance - cant compute platform from text:--' + platformText + '--');
        }
        return null;
    }
    static computeMapFareClassOccupancy(treeNode) {
        const mapFareClassOccupancy = {
            firstClass: null,
            secondClass: null,
        };
        const expectedDepartureOccupancyNodes = treeNode.findChildrenNamed('siri:ExpectedDepartureOccupancy');
        expectedDepartureOccupancyNodes.forEach(occupancyNode => {
            const fareClass = (() => {
                const fareClassText = occupancyNode.findTextFromChildNamed('siri:FareClass');
                if (fareClassText === 'firstClass') {
                    return 'firstClass';
                }
                if (fareClassText === 'secondClass') {
                    return 'secondClass';
                }
                return null;
            })();
            if (fareClass === null) {
                console.error('computeMapFareClassOccupancy: unexpected fareClass');
                console.log(occupancyNode);
                return;
            }
            const occupancyLevelValue = (() => {
                const occupancyLevelText = occupancyNode.findTextFromChildNamed('siri:OccupancyLevel');
                if (occupancyLevelText === 'fewSeatsAvailable') {
                    return 'fewSeatsAvailable';
                }
                if (occupancyLevelText === 'manySeatsAvailable') {
                    return 'manySeatsAvailable';
                }
                if (occupancyLevelText === 'standingRoomOnly') {
                    return 'standingRoomOnly';
                }
                if (occupancyLevelText === 'unknown') {
                    return 'unknown';
                }
                return null;
            })();
            if (occupancyLevelValue === null) {
                console.error('computeMapFareClassOccupancy: unexpected occupancy level');
                console.log(occupancyNode);
                return;
            }
            mapFareClassOccupancy[fareClass] = occupancyLevelValue;
        });
        return mapFareClassOccupancy;
    }
}
