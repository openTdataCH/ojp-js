import { XML_Config } from "../../types/_all";
import { TreeNode } from "../../xml/tree-node";

import { TripContinuousLeg } from "./trip-continous-leg";
import { TripTimedLeg } from "./trip-timed-leg";

export class TripLegFactory {
  public static initWithTreeNode(treeNode: TreeNode, xmlConfig: XML_Config): TripContinuousLeg | TripTimedLeg | null {
    const isOJPv2 = xmlConfig.ojpVersion === '2.0';
    
    const legID_NodeName = isOJPv2 ? 'Id' : 'LegId';
    const legID_string = treeNode.findTextFromChildNamed(legID_NodeName);
    if (legID_string === null) {
      return null;
    }
    const legID = parseInt(legID_string, 10);

    const transferLeg = TripContinuousLeg.initWithTreeNode(legID, treeNode, 'TransferLeg', xmlConfig);
    if (transferLeg) {
      return transferLeg;
    }

    const timedLeg = TripTimedLeg.initWithTreeNode(legID, treeNode, xmlConfig);
    if (timedLeg) {
      return timedLeg;
    }

    const tripContinousLeg = TripContinuousLeg.initWithTreeNode(legID, treeNode, 'ContinuousLeg', xmlConfig);
    if (tripContinousLeg) {
      return tripContinousLeg;
    }

    return null;
  }
}
