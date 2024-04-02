import { TreeNode } from "../xml/tree-node";

export class Address {
  public addressCode: string
  public addressName: string | null
  public topographicPlaceRef: string | null

  constructor(addressCode: string, addressName: string | null, topographicPlaceRef: string | null) {
    this.addressCode = addressCode
    this.addressName = addressName
    this.topographicPlaceRef = topographicPlaceRef
  }

  public static initWithLocationTreeNode(locationTreeNode: TreeNode): Address | null {
    const addressTreeNode = locationTreeNode.findChildNamed('Address');
    if (addressTreeNode === null) {
      return null;
    }

    const addressCode = addressTreeNode.findTextFromChildNamed('PublicCode');
    if (addressCode === null) {
      return null
    }

    const topographicPlaceRef = addressTreeNode.findTextFromChildNamed('TopographicPlaceRef')
    const addressName = addressTreeNode.findTextFromChildNamed('Name/Text')

    const address = new Address(addressCode, addressName, topographicPlaceRef);

    return address;
  }
}
