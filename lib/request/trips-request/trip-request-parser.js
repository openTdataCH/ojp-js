import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { Trip } from "../../trip";
import { BaseParser } from "../base-parser";
export class TripRequestParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.trips = [];
        this.tripsNo = 0;
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    reset() {
        this.trips = [];
        this.tripsNo = 0;
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    parseXML(responseXMLText) {
        this.reset();
        this.tripsNo = responseXMLText.split('<TripResult>').length - 1;
        if (this.tripsNo === 0) {
            // Handle ojp: NS in the server response
            this.tripsNo = responseXMLText.split('<ojp:TripResult>').length - 1;
        }
        if (this.callback) {
            this.callback({
                trips: this.trips,
                tripsNo: this.tripsNo,
                message: 'TripRequest.TripsNo',
            });
        }
        super.parseXML(responseXMLText);
    }
    onCloseTag(nodeName) {
        if (nodeName === "Trip" && this.currentNode.parentName === "TripResult") {
            const trip = Trip.initFromTreeNode(this.currentNode);
            if (trip) {
                trip.legs.forEach((leg) => {
                    leg.patchLocations(this.mapContextLocations);
                    leg.patchSituations(this.mapContextSituations);
                });
                this.trips.push(trip);
                if (this.callback) {
                    this.callback({
                        tripsNo: this.tripsNo,
                        trips: this.trips,
                        message: 'TripRequest.Trip',
                    });
                }
            }
        }
        if (nodeName === 'TripResponseContext') {
            const placesTreeNode = this.currentNode.findChildNamed('Places');
            if (placesTreeNode) {
                this.mapContextLocations = {};
                const locationTreeNodes = placesTreeNode.findChildrenNamed('Place');
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
                tripsNo: this.tripsNo,
                trips: this.trips,
                message: 'TripRequest.DONE',
            });
        }
    }
}
