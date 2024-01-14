import * as sax from "sax";

import { TreeNode } from "../xml/tree-node";

type FareResponseMessage = "Fare.DONE" | "ERROR";
type TravelClass = "first" | "second";

export type FareResponseCallback = (
  fareResults: FareResult[],
  message: FareResponseMessage
) => void;

export class FareResponse {
  fareResults: FareResult[];

  constructor() {
    this.fareResults = [];
  }

  public parseXML(responseXMLText: string, callback: FareResponseCallback) {
    const saxStream = sax.createStream(true, { trim: true });
    const rootNode = new TreeNode("root", null, {}, [], null);

    let currentNode: TreeNode = rootNode;
    const stack: TreeNode[] = [rootNode];

    this.fareResults = [];

    saxStream.on("opentag", (node) => {
      const newNode = new TreeNode(
        node.name,
        currentNode.name,
        node.attributes as Record<string, string>,
        [],
        null
      );

      currentNode.children.push(newNode);
      stack.push(newNode);
      currentNode = newNode;
    });

    saxStream.on("closetag", (nodeName) => {
      stack.pop();

      if (nodeName === "ojp:FareResult") {
        const fareResult = FareResult.initWithFareResultTreeNode(currentNode);
        if (fareResult) {
          this.fareResults.push(fareResult);
        }
      }

      currentNode = stack[stack.length - 1];
    });

    saxStream.on("text", (text) => {
      currentNode.text = text;
    });

    saxStream.on("error", (error) => {
      console.error("SAX parsing error:", error);
      callback(this.fareResults, "ERROR");
    });

    saxStream.on("end", () => {
      callback(this.fareResults, "Fare.DONE");
    });

    saxStream.write(responseXMLText);
    saxStream.end();
  }
}

export interface TripFareResult {
  fromTripLegIdRef: number;
  toTripLegIdRef: number;
  fareProduct: FareProduct;
}

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

  public static initWithFareProductTreeNode(
    fareProductTreeNode: TreeNode
  ): FareProduct | null {
    const fareProductId =
      fareProductTreeNode.findTextFromChildNamed("ojp:FareProductId");
    const fareAuthorityRef = fareProductTreeNode.findTextFromChildNamed(
      "ojp:FareAuthorityRef"
    );
    const priceS = fareProductTreeNode.findTextFromChildNamed("ojp:Price");
    const travelClassS =
      fareProductTreeNode.findTextFromChildNamed("ojp:TravelClass");

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
    const tripId = fareResultTreeNode.findTextFromChildNamed("ojp:ResultId");
    if (tripId === null) {
      return null;
    }

    const tripFareResultTreeNodes =
      fareResultTreeNode.findChildrenNamed("ojp:TripFareResult");

    const tripFareResults: TripFareResult[] = [];
    tripFareResultTreeNodes.forEach((tripFareResultNode) => {
      const fromTripLegIdRefS = tripFareResultNode.findTextFromChildNamed(
        "ojp:FromTripLegIdRef"
      );
      const toTripLegIdRefS =
        tripFareResultNode.findTextFromChildNamed("ojp:ToTripLegIdRef");

      if (fromTripLegIdRefS === null || toTripLegIdRefS === null) {
        return;
      }

      const fromTripLegIdRef = parseInt(fromTripLegIdRefS, 10);
      const toTripLegIdRef = parseInt(toTripLegIdRefS, 10);

      const fareProductTreeNode =
        tripFareResultNode.findChildNamed("ojp:FareProduct");
      if (fareProductTreeNode === null) {
        return;
      }

      const fareProduct =
        FareProduct.initWithFareProductTreeNode(fareProductTreeNode);
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
