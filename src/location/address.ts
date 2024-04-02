import { TreeNode } from "../xml/tree-node";

export class Address {
  public addressCode: string
  public addressName: string | null

  public topographicPlaceRef: string | null

  constructor(addressCode: string) {
    this.addressCode = addressCode
    
    this.addressName = null;
    this.topographicPlaceRef = null;
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

    const addressName = addressTreeNode.findTextFromChildNamed('Name/Text')
    const address = new Address(addressCode);

    address.addressName = addressTreeNode.findTextFromChildNamed('Name/Text')

    address.topographicPlaceRef = addressTreeNode.findTextFromChildNamed('TopographicPlaceRef');

    return address;
  }
}
