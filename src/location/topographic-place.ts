import { TreeNode } from "../xml/tree-node"

export class TopographicPlace {
    public code: string
    public name: string
  
    constructor(code: string, name: string) {
      this.code = code
      this.name = name
    }

    public static initWithLocationTreeNode(locationTreeNode: TreeNode): TopographicPlace | null {
      const code = locationTreeNode.findTextFromChildNamed('TopographicPlace/TopographicPlaceCode');
      const name = locationTreeNode.findTextFromChildNamed('TopographicPlace/TopographicPlaceName/Text');
    
      if (!(code && name)) {
        return null;
      }

      const topographicPlace = new TopographicPlace(code, name);
      return topographicPlace;
    }
}
