export class Address {
    constructor(addressCode, addressName, topographicPlaceRef) {
        this.addressCode = addressCode;
        this.addressName = addressName;
        this.topographicPlaceRef = topographicPlaceRef;
    }
    static initWithLocationTreeNode(locationTreeNode) {
        const addressTreeNode = locationTreeNode.findChildNamed('Address');
        if (addressTreeNode === null) {
            return null;
        }
        const addressCode = addressTreeNode.findTextFromChildNamed('AddressCode');
        if (addressCode === null) {
            return null;
        }
        const addressName = addressTreeNode.findTextFromChildNamed('AddressName/Text');
        const topographicPlaceRef = addressTreeNode.findTextFromChildNamed('TopographicPlaceRef');
        const address = new Address(addressCode, addressName, topographicPlaceRef);
        return address;
    }
}
