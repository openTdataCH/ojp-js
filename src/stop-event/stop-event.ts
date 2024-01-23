import { StopPoint } from '../trip/leg/timed-leg/stop-point'
import { JourneyService } from '../journey/journey-service'
import { Location } from '../location/location';
import { StopPointTime } from '../trip';
import { DateHelpers } from '../helpers/date-helpers';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';

export type StationBoardType = 'Departures' | 'Arrivals'

interface StationBoardTime {
    stopTime: string
    stopTimeActual: string | null
    stopDelayText: string | null
    
    hasDelay: boolean
    hasDelayDifferentTime: boolean
}

export interface StationBoardModel {
    stopEvent: StopEvent

    serviceLineNumber: string
    servicePtMode: string
    tripNumber: string | null
    tripHeading: string
    tripOperator: string

    mapStationBoardTime: Record<StationBoardType, StationBoardTime>
    
    stopPlatform: string | null
    stopPlatformActual: string | null

    stopSituations: PtSituationElement[]
}

export class StopEvent {
    public journeyService: JourneyService;
    public stopPoint: StopPoint;
    public prevStopPoints: StopPoint[];
    public nextStopPoints: StopPoint[];

    constructor(stopPoint: StopPoint, journeyService: JourneyService) {
        this.stopPoint = stopPoint;
        this.journeyService = journeyService;
        this.prevStopPoints = [];
        this.nextStopPoints = [];
    }

    public static initWithTreeNode(treeNode: TreeNode): StopEvent | null {
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

    public patchStopEventLocations(mapContextLocations: Record<string, Location>) {
        let stopPointsToPatch = [this.stopPoint];

        const stopPointEventTypes = ['prev', 'next'];
        stopPointEventTypes.forEach(stopPointEventType => {
            const is_previous = stopPointEventType === 'prev';
            let stopPointsRef = is_previous ? this.prevStopPoints : this.nextStopPoints;
            stopPointsToPatch = stopPointsToPatch.concat(stopPointsRef);
        });

        stopPointsToPatch.forEach(stopPoint => {
            const stopPointRef = stopPoint.location.stopPlace?.stopPlaceRef;
            if (stopPointRef && (stopPointRef in mapContextLocations)) {
                stopPoint.location = mapContextLocations[stopPointRef];
            }
        });
    }

    public asStationBoard(): StationBoardModel {
        const serviceLineNumber = this.computeServiceLineNumber()
        const servicePtMode = this.journeyService.ptMode.shortName ?? 'N/A'

        const arrivalTime = this.computeStopTimeData(this.stopPoint.arrivalData)
        const departureTime = this.computeStopTimeData(this.stopPoint.departureData)

        const stopPlatformActual = this.stopPoint.plannedPlatform === this.stopPoint.actualPlatform ? null : this.stopPoint.actualPlatform;

        const model = <StationBoardModel>{
            stopEvent: this,
            serviceLineNumber: serviceLineNumber,
            servicePtMode: servicePtMode,
            tripNumber: this.journeyService.journeyNumber, 
            tripHeading: this.journeyService.destinationStopPlace?.stopPlaceName ?? 'N/A', 
            tripOperator: this.journeyService.agencyID,
            mapStationBoardTime: {
                Arrivals: arrivalTime,
                Departures: departureTime
            },
            stopPlatform: this.stopPoint.plannedPlatform, 
            stopPlatformActual: stopPlatformActual,
            stopSituations: this.stopPoint.siriSituations,
        }

        return model;
    }

    private computeServiceLineNumber(): string {
        const serviceShortName = this.journeyService.ptMode.shortName ?? 'N/A';
        const serviceLineNumber = this.journeyService.serviceLineNumber;
        if (serviceLineNumber) {
            return serviceLineNumber
        } else {
            return serviceShortName;
        }
    }

    private computeStopTimeData(stopPointTime: StopPointTime | null): StationBoardTime | null {
        if (stopPointTime === null) {
            return null
        }

        const hasDelay = stopPointTime.delayMinutes !== null;
        
        const timetableTimeF = DateHelpers.formatTimeHHMM(stopPointTime.timetableTime);
        const estimatedTimeF = stopPointTime.estimatedTime ? DateHelpers.formatTimeHHMM(stopPointTime.estimatedTime) : 'n/a';
        const hasDelayDifferentTime = stopPointTime.estimatedTime ? (timetableTimeF !== estimatedTimeF) : false;

        const stopTime = this.computeStopTime(stopPointTime.timetableTime);
        if (stopTime === null) {
            return null;
        }
    
        const stopTimeData: StationBoardTime = {
            stopTime: stopTime,
            stopTimeActual: this.computeStopTime(stopPointTime.estimatedTime ?? null),
            stopDelayText: this.computeDelayTime(stopPointTime),

            hasDelay: hasDelay,
            hasDelayDifferentTime: hasDelayDifferentTime,
        }
    
        return stopTimeData;
    }

    private computeStopTime(stopTime: Date | null): string | null {
        if (stopTime === null) {
          return null
        }
    
        const stopTimeText = DateHelpers.formatTimeHHMM(stopTime);
        
        return stopTimeText;
    }

    private computeDelayTime(stopPointTime: StopPointTime): string | null {
        const delayMinutes = stopPointTime.delayMinutes ?? null;
        if (delayMinutes === null) {
            return null;
        }
    
        if (delayMinutes === 0) {
            return 'ON TIME';
        }
    
        const delayTextParts: string[] = []
        delayTextParts.push(' ')
        delayTextParts.push(delayMinutes > 0 ? '+' : '')
        delayTextParts.push('' + delayMinutes)
        delayTextParts.push("'");
    
        const delayText = delayTextParts.join('');
        return delayText;
    }
}
