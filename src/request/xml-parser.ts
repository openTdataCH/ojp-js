import { BaseParser } from "./base-parser";

type XMLParserMessage = "DONE" | "ERROR";
export type XMLParserResponse = {
    message: XMLParserMessage | null
}
export type XMLParserCallback = (response: XMLParserResponse) => void;

export class XMLParser extends BaseParser {
  public callback: XMLParserCallback | null = null;

  public parseXML(responseXMLText: string): void {
    super.parseXML(responseXMLText);
  }

  protected onError(saxError: any): void {
    console.error('ERROR: SAX parser');
    console.log(saxError);
    
    if (this.callback) {
      this.callback({
        message: 'ERROR',
      });
    }
  }

  protected onEnd(): void {
    if (this.callback) {
      this.callback({
        message: 'DONE',
      });
    }
  }
}
