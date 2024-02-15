import { TreeNode } from "../xml/tree-node";
export declare class Address {
    addressCode: string;
    addressName: string | null;
    topographicPlaceRef: string | null;
    constructor(addressCode: string, addressName: string | null, topographicPlaceRef: string | null);
    static initWithLocationTreeNode(locationTreeNode: TreeNode): Address | null;
}
