import * as GeoJSON from 'geojson';
import { TripStats } from '../types/trip-stats';
import { TripLeg } from './leg/trip-leg';
import { Location } from '../location/location';
import { GeoPositionBBOX } from '../location/geoposition-bbox';
import { TreeNode } from '../xml/tree-node';
export declare class Trip {
    id: string;
    legs: TripLeg[];
    stats: TripStats;
    constructor(tripID: string, legs: TripLeg[], tripStats: TripStats);
    static initFromTreeNode(treeNode: TreeNode): Trip | null;
    computeDepartureTime(): Date | null;
    computeArrivalTime(): Date | null;
    computeGeoJSON(): GeoJSON.FeatureCollection;
    computeFromLocation(): Location | null;
    computeToLocation(): Location | null;
    computeBBOX(): GeoPositionBBOX;
}
