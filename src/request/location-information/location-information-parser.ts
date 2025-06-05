import { Location } from "../../location/location";
import { XML_Config } from "../../types/_all";
import { BaseParser } from "../base-parser";
import { LIR_Callback as ParserCallback } from "../types/location-information-request.type";

export class LocationInformationParser extends BaseParser {
  private locations: Location[];
  public callback: ParserCallback | null = null;

  constructor(xmlConfig: XML_Config) {
    super(xmlConfig);
    this.locations = [];
  }

  public parseXML(responseXMLText: string): void {
    this.locations = [];
    super.parseXML(responseXMLText);
  }

  protected onCloseTag(nodeName: string): void {
    const ojpNodeName = this.xmlParserConfig.ojpVersion === '2.0' ? 'PlaceResult' : 'Location';

    if (nodeName === ojpNodeName && this.currentNode.parentName === 'OJPLocationInformationDelivery') {
      const location = Location.initWithLocationResultTreeNode(this.currentNode, this.xmlParserConfig);

      if (location) {
        this.locations.push(location);
      }
    }
  }

  protected onError(saxError: any): void {
    console.error('ERROR: SAX parser');
    console.log(saxError);
    
    if (this.callback) {
      this.callback({
        locations: this.locations,
        message: 'ERROR',
      });
    }
  }

  protected onEnd(): void {
    if (this.callback) {
      this.callback({
        locations: this.locations,
        message: 'LocationInformation.DONE',
      });
    }
  }
}
