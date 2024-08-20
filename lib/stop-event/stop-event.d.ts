import { StopPoint } from '../trip/leg/timed-leg/stop-point';
import { JourneyService } from '../journey/journey-service';
import { Location } from '../location/location';
import { TreeNode } from '../xml/tree-node';
export type StationBoardType = 'Departures' | 'Arrivals';
interface StationBoardTime {
    stopTime: string;
    stopTimeActual: string | null;
    stopDelayText: string | null;
    hasDelay: boolean;
    hasDelayDifferentTime: boolean;
}
interface SituationData {
    summary: string;
    description: string;
    details: string[];
}
export interface StationBoardModel {
    stopEvent: StopEvent;
    serviceLineNumber: string;
    servicePtMode: string;
    tripNumber: string | null;
    tripHeading: string;
    tripOperator: string;
    mapStationBoardTime: Record<StationBoardType, StationBoardTime>;
    stopPlatform: string | null;
    stopPlatformActual: string | null;
    stopSituations: SituationData[];
}
export declare class StopEvent {
    journeyService: JourneyService;
    stopPoint: StopPoint;
    prevStopPoints: StopPoint[];
    nextStopPoints: StopPoint[];
    constructor(stopPoint: StopPoint, journeyService: JourneyService);
    static initWithTreeNode(treeNode: TreeNode): StopEvent | null;
    patchStopEventLocations(mapContextLocations: Record<string, Location>): void;
    asStationBoard(): StationBoardModel;
    private computeServiceLineNumber;
    private computeStopTimeData;
    private computeStopTime;
    private computeDelayTime;
}
export {};
