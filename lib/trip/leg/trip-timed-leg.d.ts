import * as GeoJSON from 'geojson';
import { JourneyService } from '../../journey/journey-service';
import { StopPoint } from './timed-leg/stop-point';
import { TripLeg, LinePointData } from "./trip-leg";
import { TripLegLineType } from "../../types/map-geometry-types";
import { GeoPosition } from '../../location/geoposition';
import { Location } from '../../location/location';
import { PtSituationElement } from '../../situation/situation-element';
import { TreeNode } from '../../xml/tree-node';
export declare class TripTimedLeg extends TripLeg {
    service: JourneyService;
    fromStopPoint: StopPoint;
    toStopPoint: StopPoint;
    intermediateStopPoints: StopPoint[];
    constructor(legIDx: number, service: JourneyService, fromStopPoint: StopPoint, toStopPoint: StopPoint, intermediateStopPoints?: StopPoint[]);
    static initWithTreeNode(legIDx: number, treeNode: TreeNode): TripTimedLeg | null;
    patchLocations(mapContextLocations: Record<string, Location>): void;
    computeDepartureTime(): Date | null;
    computeArrivalTime(): Date | null;
    private computeStopPointTime;
    protected computeSpecificJSONFeatures(): GeoJSON.Feature[];
    protected computeLegLineType(): TripLegLineType;
    protected computeLinePointsData(): LinePointData[];
    computeLegColor(): string;
    protected computeBeelineGeoPositions(): GeoPosition[];
    protected useBeeline(): boolean;
    patchSituations(mapContextSituations: Record<string, PtSituationElement>): void;
}
