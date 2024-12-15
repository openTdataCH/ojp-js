import { BaseParser } from "../request/base-parser";
import { FareResult } from "./fare";

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
