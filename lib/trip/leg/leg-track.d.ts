import { GeoPosition } from "../../location/geoposition";
import { Location } from "../../location/location";
import { Duration } from "../../shared/duration";
import { XML_Config } from "../../types/_all";
import { TreeNode } from "../../xml/tree-node";
import { LinkProjection } from "../link-projection";
export declare class LegTrack {
    trackSections: TrackSection[];
    hasGeoData: boolean;
    duration: Duration | null;
    constructor(trackSections: TrackSection[]);
    plus(otherLegTrack: LegTrack): LegTrack;
    static initWithLegTreeNode(treeNode: TreeNode, xmlConfig: XML_Config): LegTrack | null;
    fromGeoPosition(): GeoPosition | null;
    toGeoPosition(): GeoPosition | null;
}
declare class TrackSection {
    fromLocation: Location;
    toLocation: Location;
    duration: Duration | null;
    length: number | null;
    linkProjection: LinkProjection | null;
    constructor(fromLocation: Location, toLocation: Location);
    static initWithTreeNode(treeNode: TreeNode, xmlConfig: XML_Config): TrackSection | null;
}
export {};
