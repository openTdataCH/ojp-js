import { XML_Config } from "../types/_all";
import { TreeNode } from "../xml/tree-node";

export class Address {
  public addressCode: string
  public addressName: string | null

  public topographicPlaceRef: string | null
  public topographicPlaceName: string | null

  public street: string | null
  public houseNumber: string | null
  public postCode: string | null

  constructor(addressCode: string) {
    this.addressCode = addressCode
    
    this.addressName = null;
    this.topographicPlaceRef = null;
    this.topographicPlaceName = null;
    this.street = null;
    this.houseNumber = null;
    this.postCode = null;
  }

  public static initWithLocationTreeNode(locationTreeNode: TreeNode, xmlConfig: XML_Config): Address | null {
    const isOJPv2 = xmlConfig.ojpVersion === '2.0';

    const addressTreeNode = locationTreeNode.findChildNamed('Address');
    if (addressTreeNode === null) {
      return null;
    }

    const addresCodeNodeName = isOJPv2 ? 'PublicCode' : 'AddressCode';
    const addressCode = addressTreeNode.findTextFromChildNamed(addresCodeNodeName);
    if (addressCode === null) {
      return null
    }

    const address = new Address(addressCode);

    const addressNamePath = isOJPv2 ? 'Name/Text' : 'AddressName/Text';
    address.addressName = addressTreeNode.findTextFromChildNamed(addressNamePath);

    address.topographicPlaceRef = addressTreeNode.findTextFromChildNamed('TopographicPlaceRef');
    address.topographicPlaceName = addressTreeNode.findTextFromChildNamed('TopographicPlaceName');
    
    address.street = addressTreeNode.findTextFromChildNamed('Street');
    address.houseNumber = addressTreeNode.findTextFromChildNamed('HouseNumber');
    address.postCode = addressTreeNode.findTextFromChildNamed('PostCode');    

    return address;
  }
}
