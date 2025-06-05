export class Address {
    constructor(addressCode) {
        this.addressCode = addressCode;
        this.addressName = null;
        this.topographicPlaceRef = null;
        this.topographicPlaceName = null;
        this.street = null;
        this.houseNumber = null;
        this.postCode = null;
    }
    static initWithLocationTreeNode(locationTreeNode, xmlConfig) {
        const isOJPv2 = xmlConfig.ojpVersion === '2.0';
        const addressTreeNode = locationTreeNode.findChildNamed('Address');
        if (addressTreeNode === null) {
            return null;
        }
        const addresCodeNodeName = isOJPv2 ? 'PublicCode' : 'AddressCode';
        const addressCode = addressTreeNode.findTextFromChildNamed(addresCodeNodeName);
        if (addressCode === null) {
            return null;
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
