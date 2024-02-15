import { BaseParser } from "../request/base-parser";
import { TreeNode } from "../xml/tree-node";

type NovaFare_ParserMessage = "NovaFares.DONE" | "ERROR";
export type NovaFare_Response = {
  fareResults: FareResult[];
  message: NovaFare_ParserMessage | null;
};
export type NovaFare_Callback = (response: NovaFare_Response) => void;

export class NovaFareParser extends BaseParser {
  public callback: NovaFare_Callback | null = null;
  public fareResults: FareResult[];

  constructor() {
    super();
    this.fareResults = [];
  }

  public parseXML(responseXMLText: string): void {
    this.fareResults = [];
    super.parseXML(responseXMLText);
  }

  protected onCloseTag(nodeName: string): void {
    if (nodeName === "FareResult") {
      const fareResult = FareResult.initWithFareResultTreeNode(
        this.currentNode
      );
      if (fareResult) {
        this.fareResults.push(fareResult);
      }
    }
  }

  protected onError(saxError: any): void {
    console.error("ERROR: SAX parser");
    console.log(saxError);

    if (this.callback) {
      this.callback({
        fareResults: this.fareResults,
        message: "ERROR",
      });
    }
  }

  protected onEnd(): void {
    if (this.callback) {
      this.callback({
        fareResults: this.fareResults,
        message: "NovaFares.DONE",
      });
    }
  }
}

type TravelClass = "first" | "second";

class FareProduct {
  fareProductId: string;
  fareAuthorityRef: string;
  price: number;
  travelClass: TravelClass;

  constructor(
    fareProductId: string,
    fareAuthorityRef: string,
    price: number,
    travelClass: TravelClass
  ) {
    this.fareProductId = fareProductId;
    this.fareAuthorityRef = fareAuthorityRef;
    this.price = price;
    this.travelClass = travelClass;
  }

  public static initFromFareProductNode(
    fareProductNode: TreeNode
  ): FareProduct | null {
    const fareProductId =
      fareProductNode.findTextFromChildNamed("FareProductId");
    const fareAuthorityRef =
      fareProductNode.findTextFromChildNamed("FareAuthorityRef");
    const priceS = fareProductNode.findTextFromChildNamed("Price");
    const travelClassS = fareProductNode.findTextFromChildNamed("TravelClass");

    if (
      fareProductId === null ||
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
