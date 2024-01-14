import { TreeNode } from "../xml/tree-node"

export class TopographicPlace {
    public code: string
    public name: string
  
    constructor(code: string, name: string) {
      this.code = code
      this.name = name
    }

    public static initWithLocationTreeNode(locationTreeNode: TreeNode): TopographicPlace | null {
      const code = locationTreeNode.findTextFromChildNamed('ojp:TopographicPlace/ojp:TopographicPlaceCode');
      const name = locationTreeNode.findTextFromChildNamed('ojp:TopographicPlace/ojp:TopographicPlaceName/ojp:Text');
    
      if (!(code && name)) {
        return null;
      }

      const topographicPlace = new TopographicPlace(code, name);
      return topographicPlace;
    }
}
