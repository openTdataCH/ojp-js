import { BaseParser } from "../request/base-parser";
import { TreeNode } from "../xml/tree-node";
type NovaFare_ParserMessage = "NovaFares.DONE" | "ERROR";
export type NovaFare_Response = {
    fareResults: FareResult[];
    message: NovaFare_ParserMessage | null;
};
export type NovaFare_Callback = (response: NovaFare_Response) => void;
export declare class NovaFareParser extends BaseParser {
    callback: NovaFare_Callback | null;
    fareResults: FareResult[];
    constructor();
    parseXML(responseXMLText: string): void;
    protected onCloseTag(nodeName: string): void;
    protected onError(saxError: any): void;
    protected onEnd(): void;
}
type TravelClass = "first" | "second";
declare class FareProduct {
    fareProductId: string;
    fareAuthorityRef: string;
    price: number;
    travelClass: TravelClass;
    constructor(fareProductId: string, fareAuthorityRef: string, price: number, travelClass: TravelClass);
    static initFromFareProductNode(fareProductNode: TreeNode): FareProduct | null;
}
export interface TripFareResult {
    fromTripLegIdRef: number;
    toTripLegIdRef: number;
    fareProduct: FareProduct;
}
export declare class FareResult {
    tripId: string;
    tripFareResults: TripFareResult[];
    constructor(tripId: string, tripFareResults: TripFareResult[]);
    static initWithFareResultTreeNode(fareResultTreeNode: TreeNode): FareResult | null;
}
export {};
