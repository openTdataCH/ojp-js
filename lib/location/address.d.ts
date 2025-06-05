import { XML_Config } from "../types/_all";
import { TreeNode } from "../xml/tree-node";
export declare class Address {
    addressCode: string;
    addressName: string | null;
    topographicPlaceRef: string | null;
    topographicPlaceName: string | null;
    street: string | null;
    houseNumber: string | null;
    postCode: string | null;
    constructor(addressCode: string);
    static initWithLocationTreeNode(locationTreeNode: TreeNode, xmlConfig: XML_Config): Address | null;
}
