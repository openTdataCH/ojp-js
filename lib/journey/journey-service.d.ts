import { PublicTransportMode } from './public-transport-mode';
import { TripLegLineType } from "../types/map-geometry-types";
import { StopPlace } from '../location/stopplace';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';
export declare class JourneyService {
    journeyRef: string;
    ptMode: PublicTransportMode;
    agencyCode: string;
    originStopPlace: StopPlace | null;
    destinationStopPlace: StopPlace | null;
    serviceLineNumber: string | null;
    journeyNumber: string | null;
    siriSituationIds: string[];
    siriSituations: PtSituationElement[];
    constructor(journeyRef: string, ptMode: PublicTransportMode, agencyCode: string);
    static initWithTreeNode(treeNode: TreeNode): JourneyService | null;
    computeLegLineType(): TripLegLineType;
    formatServiceName(): string;
}
