import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { StopEvent } from "../../stop-event/stop-event";
import { BaseParser } from "../base-parser";
import { StopEventRequest_Callback as ParserCallback } from "../types/stop-event-request.type";

export class StopEventRequestParser extends BaseParser {
  public stopEvents: StopEvent[];
  private mapContextLocations: Record<string, Location>;
  private mapContextSituations: Record<string, PtSituationElement>;
  public callback: ParserCallback | null = null;

  constructor() {
    super();

    this.stopEvents = [];
    this.mapContextLocations = {};
    this.mapContextSituations = {};
  }

  private reset() {
    this.stopEvents = [];
    this.mapContextLocations = {};
    this.mapContextSituations = {};
  }

  public parseXML(responseXMLText: string): void {
    this.reset();
    super.parseXML(responseXMLText);
  }

  protected onCloseTag(nodeName: string): void {
    if (nodeName === 'StopEventResult') {
      const stopEvent = StopEvent.initWithTreeNode(this.currentNode);
      if (stopEvent) {
        stopEvent.patchStopEventLocations(this.mapContextLocations);
        stopEvent.stopPoint.patchSituations(this.mapContextSituations);
        this.stopEvents.push(stopEvent);
      }
    }

    if (nodeName === 'StopEventResponseContext') {
      const placesTreeNode = this.currentNode.findChildNamed('Places');
      if (placesTreeNode) {
        this.mapContextLocations = {};
            
        const locationTreeNodes = placesTreeNode.findChildrenNamed('Location');
        locationTreeNodes.forEach(locationTreeNode => {
          const location = Location.initWithTreeNode(locationTreeNode);
          const stopPlaceRef = location.stopPlace?.stopPlaceRef ?? null;
          if (stopPlaceRef !== null) {
            this.mapContextLocations[stopPlaceRef] = location;
          }
        });
      }

      const situationsTreeNode = this.currentNode.findChildNamed('Situations');
      if (situationsTreeNode) {
        this.mapContextSituations = {};

        const situationTreeNodes = situationsTreeNode.findChildrenNamed('PtSituation');
        situationTreeNodes.forEach(situationTreeNode => {
          const situation = PtSituationElement.initWithSituationTreeNode(situationTreeNode);
          if (situation) {
            this.mapContextSituations[situation.situationNumber] = situation;
          }
        });
      }
    }
  }

  protected onEnd(): void {
    if (this.callback) {
      this.callback({
        stopEvents: this.stopEvents,
        message: 'StopEvent.DONE',
      });
    }
  }
}
