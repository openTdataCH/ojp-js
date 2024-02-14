import { GeoRestrictionPoiOSMTag } from "../types/geo-restriction.type";
import { TreeNode } from "../xml/tree-node";
export declare class PointOfInterest {
    code: string;
    name: string;
    category: GeoRestrictionPoiOSMTag;
    subCategory: string | null;
    categoryTags: string[];
    constructor(code: string, name: string, category: GeoRestrictionPoiOSMTag, subCategory: string | null, categoryTags: string[]);
    static initWithLocationTreeNode(locationTreeNode: TreeNode): PointOfInterest | null;
    computePoiMapIcon(): string;
}
