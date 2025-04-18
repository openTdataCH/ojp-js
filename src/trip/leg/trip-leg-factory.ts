import { OJP_VERSION } from "../../constants";
import { TreeNode } from "../../xml/tree-node";

import { TripContinuousLeg } from "./trip-continous-leg";
import { TripTimedLeg } from "./trip-timed-leg";

export class TripLegFactory {
  public static initWithTreeNode(treeNode: TreeNode): TripContinuousLeg | TripTimedLeg | null {
    const isOJPv2 = OJP_VERSION === '2.0';
    
    const legID_NodeName = isOJPv2 ? 'Id' : 'LegId';
    const legID_string = treeNode.findTextFromChildNamed(legID_NodeName);
    if (legID_string === null) {
      return null;
    }
    const legID = parseInt(legID_string, 10);

    const transferLeg = TripContinuousLeg.initWithTreeNode(legID, treeNode, 'TransferLeg');
    if (transferLeg) {
      return transferLeg;
    }

    const timedLeg = TripTimedLeg.initWithTreeNode(legID, treeNode);
    if (timedLeg) {
      return timedLeg;
    }

    const tripContinousLeg = TripContinuousLeg.initWithTreeNode(legID, treeNode, 'ContinuousLeg');
    if (tripContinousLeg) {
      return tripContinousLeg;
    }

    return null;
  }
}
