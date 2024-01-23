import { TreeNode } from "../xml/tree-node"

// OJP reference - these are the same?
//  - 8.4.5.2 StopPoint Structure
//  - 8.4.5.3 StopPlace Structure
type StopType = 'StopPlace' | 'StopPoint'

export class StopPlace {
  public stopPlaceRef: string
  public stopPlaceName: string
  public topographicPlaceRef: string | null
  public stopType: StopType

  constructor(stopPlaceRef: string, stopPlaceName: string, topographicPlaceRef: string | null,  stopType: StopType = 'StopPlace') {
    this.stopPlaceRef = stopPlaceRef
    this.stopPlaceName = stopPlaceName
    this.topographicPlaceRef = topographicPlaceRef
    this.stopType = stopType
  }

  public static initWithLocationTreeNode(locationTreeNode: TreeNode): StopPlace | null {
    let stopType: StopType = 'StopPlace';

    let stopPlaceRef = locationTreeNode.findTextFromChildNamed('StopPlace/StopPlaceRef');
    let stopPlaceName = locationTreeNode.findTextFromChildNamed('StopPlace/StopPlaceName/Text') ?? '';
    let topographicPlaceRef = locationTreeNode.findTextFromChildNamed('StopPlace/TopographicPlaceRef');

    // Try to build the StopPlace from StopPoint
    if (stopPlaceRef === null) {
      stopType = 'StopPoint';
      stopPlaceRef = locationTreeNode.findTextFromChildNamed('StopPoint/StopPointRef');
      stopPlaceName = locationTreeNode.findTextFromChildNamed('StopPoint/StopPointName/Text') ?? '';
      topographicPlaceRef = locationTreeNode.findTextFromChildNamed('StopPoint/TopographicPlaceRef');
    }

    // Otherwise try to see if we have a single siri:StopPointRef node
    if (stopPlaceRef === null) {
      stopType = 'StopPoint';
      stopPlaceRef = locationTreeNode.findTextFromChildNamed('StopPointRef');
    }

    if (stopPlaceRef === null) {
      return null;
    }

    const stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, topographicPlaceRef, stopType);

    return stopPlace;
  }

  public static initWithServiceTreeNode(treeNode: TreeNode, pointType: 'Origin' | 'Destination'): StopPlace | null {
    const stopPlaceRef = treeNode.findTextFromChildNamed(pointType + 'StopPointRef');
    const stopPlaceText = treeNode.findTextFromChildNamed(pointType + 'Text/Text');

    if (!(stopPlaceRef && stopPlaceText)) {
      return null;
    }

    const stopPlace = new StopPlace(stopPlaceRef, stopPlaceText, null, 'StopPlace');
    return stopPlace;
  }
}
