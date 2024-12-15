import { TreeNode } from "../xml/tree-node";

type TravelClass = "first" | "second";

class FareProduct {
  fareProductId: string;
  fareProductName: string;
  fareAuthorityRef: string;
  price: number;
  travelClass: TravelClass;

  constructor(
    fareProductId: string,
    fareProductName: string,
    fareAuthorityRef: string,
    price: number,
    travelClass: TravelClass
  ) {
    this.fareProductId = fareProductId;
    this.fareProductName = fareProductName;
    this.fareAuthorityRef = fareAuthorityRef;
    this.price = price;
    this.travelClass = travelClass;
  }

  public static initFromFareProductNode(
    fareProductNode: TreeNode
  ): FareProduct | null {
    const fareProductId =
      fareProductNode.findTextFromChildNamed("FareProductId");
    const fareProductName = fareProductNode.findTextFromChildNamed("FareProductName");
    const fareAuthorityRef =
      fareProductNode.findTextFromChildNamed("FareAuthorityRef");
    const priceS = fareProductNode.findTextFromChildNamed("Price");
    const travelClassS = fareProductNode.findTextFromChildNamed("TravelClass");

    if (
      fareProductId === null ||
      fareProductName === null ||
      fareAuthorityRef === null ||
      priceS === null ||
      travelClassS === null
    ) {
      return null;
    }

    const price = parseFloat(priceS);
    const travelClass = travelClassS as TravelClass;

    const fareProduct = new FareProduct(
      fareProductId,
      fareProductName,
      fareAuthorityRef,
      price,
      travelClass
    );
    return fareProduct;
  }
}

export interface TripFareResult {
  fromTripLegIdRef: number;
  toTripLegIdRef: number;
  fareProduct: FareProduct;
}

export class FareResult {
  tripId: string;
  tripFareResults: TripFareResult[];

  constructor(tripId: string, tripFareResults: TripFareResult[]) {
    this.tripId = tripId;
    this.tripFareResults = tripFareResults;
  }

  public static initWithFareResultTreeNode(
    fareResultTreeNode: TreeNode
  ): FareResult | null {
    const tripId = fareResultTreeNode.findTextFromChildNamed("ResultId");
    if (tripId === null) {
      return null;
    }

    const tripFareResultNodes =
      fareResultTreeNode.findChildrenNamed("TripFareResult");

    const tripFareResults: TripFareResult[] = [];
    tripFareResultNodes.forEach((tripFareResultNode) => {
      const fromTripLegIdRefS =
        tripFareResultNode.findTextFromChildNamed("FromTripLegIdRef");
      const toTripLegIdRefS =
        tripFareResultNode.findTextFromChildNamed("ToTripLegIdRef");

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

      const tripFareResult: TripFareResult = {
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
