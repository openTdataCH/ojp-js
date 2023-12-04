import { XPathOJP } from '../helpers/xpath-ojp'

export class Fare {
    fareResults: FareResult[]

    constructor(fareResults: FareResult[]) {
        this.fareResults = fareResults
    }

    public static initFromXML(xmlText: string): Fare | null {
        const responseXML = new DOMParser().parseFromString(xmlText, 'application/xml');

        const fareResults: FareResult[] = [];

        const fareResultNodes = XPathOJP.queryNodes('//OJPResponse/ServiceDelivery/ojp:OJPFareDelivery/ojp:FareResult', responseXML);
        fareResultNodes.forEach(fareResultNode => {
            const fareResult = FareResult.initFromTripResultNode(fareResultNode);
            if (fareResult) {
                fareResults.push(fareResult);
            }
        });

        const fare = new Fare(fareResults);
        return fare;
    }
}

type TravelClass = 'first' | 'second'

export interface TripFareResult {
    fromTripLegIdRef: number
    toTripLegIdRef: number
    fareProduct: FareProduct
}

class FareProduct {
    fareProductId: string
    fareAuthorityRef: string
    price: number
    travelClass: TravelClass

    constructor(fareProductId: string, fareAuthorityRef: string, price: number, travelClass: TravelClass) {
        this.fareProductId = fareProductId
        this.fareAuthorityRef = fareAuthorityRef
        this.price = price
        this.travelClass = travelClass
    }

    public static initFromFareProductNode(fareProductNode: Node): FareProduct | null {
        const fareProductId = XPathOJP.queryText('ojp:FareProductId', fareProductNode);
        const fareAuthorityRef = XPathOJP.queryText('ojp:FareAuthorityRef', fareProductNode);
        const priceS = XPathOJP.queryText('ojp:Price', fareProductNode);
        const travelClassS = XPathOJP.queryText('ojp:TravelClass', fareProductNode);

        if (fareProductId === null || fareAuthorityRef === null || priceS === null || travelClassS === null) {
            return null
        }

        const price = parseFloat(priceS);
        const travelClass = travelClassS as TravelClass;

        const fareProduct = new FareProduct(fareProductId, fareAuthorityRef, price, travelClass);
        return fareProduct;
    }
}

export class FareResult {
    tripId: string
    tripFareResults: TripFareResult[]

    constructor(tripId: string, tripFareResults: TripFareResult[]) {
        this.tripId = tripId;
        this.tripFareResults = tripFareResults;
    }

    public static initFromTripResultNode(fareResultNode: Node): FareResult | null {
        const tripId = XPathOJP.queryText('ojp:ResultId', fareResultNode)
        if (tripId === null) {
            return null;
        }

        const tripFareResultNodes = XPathOJP.queryNodes('ojp:TripFareResult', fareResultNode);

        const tripFareResults: TripFareResult[] = [];
        tripFareResultNodes.forEach(tripFareResultNode => {
            const fromTripLegIdRefS = XPathOJP.queryText('ojp:FromTripLegIdRef', tripFareResultNode);
            const toTripLegIdRefS = XPathOJP.queryText('ojp:ToTripLegIdRef', tripFareResultNode);
    
            if (fromTripLegIdRefS === null || toTripLegIdRefS === null) {
                return;
            }

            const fromTripLegIdRef = parseInt(fromTripLegIdRefS, 10);
            const toTripLegIdRef = parseInt(toTripLegIdRefS, 10);

            const fareProductNode = XPathOJP.queryNode('ojp:FareProduct', tripFareResultNode);
            if (fareProductNode === null) {
                return;
            }

            const fareProduct = FareProduct.initFromFareProductNode(fareProductNode);
            if (fareProduct === null) {
                return;
            }

            const tripFareResult: TripFareResult = {
                fromTripLegIdRef: fromTripLegIdRef,
                toTripLegIdRef: toTripLegIdRef,
                fareProduct: fareProduct,
            }

            tripFareResults.push(tripFareResult);
        });

        if (tripFareResults.length === 0) {
            return null;
        }

        const fareResult = new FareResult(tripId, tripFareResults);
        
        return fareResult;
    }
}
