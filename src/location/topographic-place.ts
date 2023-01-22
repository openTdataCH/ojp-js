import { XPathOJP } from "../helpers/xpath-ojp"

export class TopographicPlace {
    public code: string
    public name: string
  
    constructor(code: string, name: string) {
      this.code = code
      this.name = name
    }

    public static initFromContextNode(contextNode: Node): TopographicPlace | null {
        const code = XPathOJP.queryText('ojp:TopographicPlace/ojp:TopographicPlaceCode', contextNode)
        const name = XPathOJP.queryText('ojp:TopographicPlace/ojp:TopographicPlaceName/ojp:Text', contextNode)
    
        if (!(code && name)) {
          return null;
        }

        const topographicPlace = new TopographicPlace(code, name);
        return topographicPlace;
    }
}
