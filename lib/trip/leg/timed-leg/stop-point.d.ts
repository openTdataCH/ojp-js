import { Location } from "../../../location/location";
import { StopPointTime } from "./stop-point-time";
import { StopPointType } from "../../../types/stop-point-type";
import { PtSituationElement } from "../../../situation/situation-element";
import { TreeNode } from "../../../xml/tree-node";
import { MapFareClassOccupancy } from "../../../types/_all";
export declare class StopPoint {
    stopPointType: StopPointType;
    location: Location;
    arrivalData: StopPointTime | null;
    departureData: StopPointTime | null;
    plannedPlatform: string | null;
    actualPlatform: string | null;
    sequenceOrder: number | null;
    isNotServicedStop: boolean | null;
    siriSituationIds: string[];
    siriSituations: PtSituationElement[];
    vehicleAccessType: string | null;
    mapFareClassOccupancy: MapFareClassOccupancy;
    constructor(stopPointType: StopPointType, location: Location, arrivalData: StopPointTime | null, departureData: StopPointTime | null, plannedPlatform: string | null, sequenceOrder: number | null);
    static initWithTreeNode(treeNode: TreeNode, stopPointType: StopPointType): StopPoint | null;
    private static computeMapFareClassOccupancy;
}
