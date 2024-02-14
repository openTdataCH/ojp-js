import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { StopEvent } from "../../stop-event/stop-event";
import { BaseParser } from "../base-parser";
export class StopEventRequestParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.stopEvents = [];
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    reset() {
        this.stopEvents = [];
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    parseXML(responseXMLText) {
        this.reset();
        super.parseXML(responseXMLText);
    }
    onCloseTag(nodeName) {
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
                    var _a, _b;
                    const location = Location.initWithTreeNode(locationTreeNode);
                    const stopPlaceRef = (_b = (_a = location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
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
    onEnd() {
        if (this.callback) {
            this.callback({
                stopEvents: this.stopEvents,
                message: 'StopEvent.DONE',
            });
        }
    }
}
