import { XML_Config } from "../../types/_all";
import { TreeNode } from "../../xml/tree-node";
import { TripContinuousLeg } from "./trip-continous-leg";
import { TripTimedLeg } from "./trip-timed-leg";
export declare class TripLegFactory {
    static initWithTreeNode(treeNode: TreeNode, xmlConfig: XML_Config): TripContinuousLeg | TripTimedLeg | null;
}
