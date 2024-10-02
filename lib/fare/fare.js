import { BaseParser } from "../request/base-parser";
export class NovaFareParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.fareResults = [];
    }
    parseXML(responseXMLText) {
        this.fareResults = [];
        super.parseXML(responseXMLText);
    }
    onCloseTag(nodeName) {
        if (nodeName === "FareResult") {
            const fareResult = FareResult.initWithFareResultTreeNode(this.currentNode);
            if (fareResult) {
                this.fareResults.push(fareResult);
            }
        }
    }
    onError(saxError) {
        console.error("ERROR: SAX parser");
        console.log(saxError);
        if (this.callback) {
            this.callback({
                fareResults: this.fareResults,
                message: "ERROR",
            });
        }
    }
    onEnd() {
        if (this.callback) {
            this.callback({
                fareResults: this.fareResults,
                message: "NovaFares.DONE",
            });
        }
    }
}
class FareProduct {
    constructor(fareProductId, fareAuthorityRef, price, travelClass) {
        this.fareProductId = fareProductId;
        this.fareAuthorityRef = fareAuthorityRef;
        this.price = price;
        this.travelClass = travelClass;
    }
    static initFromFareProductNode(fareProductNode) {
        const fareProductId = fareProductNode.findTextFromChildNamed("FareProductId");
        const fareAuthorityRef = fareProductNode.findTextFromChildNamed("FareAuthorityRef");
        const priceS = fareProductNode.findTextFromChildNamed("Price");
        const travelClassS = fareProductNode.findTextFromChildNamed("TravelClass");
        if (fareProductId === null ||
            fareAuthorityRef === null ||
            priceS === null ||
            travelClassS === null) {
            return null;
        }
        const price = parseFloat(priceS);
        const travelClass = travelClassS;
        const fareProduct = new FareProduct(fareProductId, fareAuthorityRef, price, travelClass);
        return fareProduct;
    }
}
export class FareResult {
    constructor(tripId, tripFareResults) {
        this.tripId = tripId;
        this.tripFareResults = tripFareResults;
    }
    static initWithFareResultTreeNode(fareResultTreeNode) {
        const tripId = fareResultTreeNode.findTextFromChildNamed("ResultId");
        if (tripId === null) {
            return null;
        }
        const tripFareResultNodes = fareResultTreeNode.findChildrenNamed("TripFareResult");
        const tripFareResults = [];
        tripFareResultNodes.forEach((tripFareResultNode) => {
            const fromTripLegIdRefS = tripFareResultNode.findTextFromChildNamed("FromTripLegIdRef");
            const toTripLegIdRefS = tripFareResultNode.findTextFromChildNamed("ToTripLegIdRef");
            if (fromTripLegIdRefS === null || toTripLegIdRefS === null) {
                return;
            }
            const fromTripLegIdRef = parseInt(fromTripLegIdRefS, 10);
            const toTripLegIdRef = parseInt(toTripLegIdRefS, 10);
            const fareProductNode = tripFareResultNode.findChildNamed("FareProduct");
            if (fareProductNode === null) {
                return;
            }
            const fareProduct = FareProduct.initFromFareProductNode(fareProductNode);
            if (fareProduct === null) {
                return;
            }
            const tripFareResult = {
                fromTripLegIdRef: fromTripLegIdRef,
                toTripLegIdRef: toTripLegIdRef,
                fareProduct: fareProduct,
            };
            tripFareResults.push(tripFareResult);
        });
        if (tripFareResults.length === 0) {
            return null;
        }
        const fareResult = new FareResult(tripId, tripFareResults);
        return fareResult;
    }
}