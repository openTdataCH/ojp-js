import { TripContinuousLeg } from "./trip-continous-leg";
import { TripTimedLeg } from "./trip-timed-leg";
export class TripLegFactory {
    static initWithTreeNode(treeNode) {
        const legID_string = treeNode.findTextFromChildNamed('Id');
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
