import * as sax from 'sax';
import { Location } from '../location/location';
import { Trip } from '../trip/trip';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';
export class TripsResponse {
    constructor() {
        this.hasValidResponse = false;
        this.trips = [];
        this.parserTripsNo = 0;
        this.tripRequestParams = null;
    }
    parseXML(responseXMLText, callback) {
        const saxStream = sax.createStream(true, { trim: true });
        const rootNode = new TreeNode('root', null, {}, [], null);
        let currentNode = rootNode;
        const stack = [rootNode];
        let mapContextLocations = {};
        let mapContextSituations = {};
        this.hasValidResponse = false;
        this.trips = [];
        this.parserTripsNo = 0;
        const tripsNo = responseXMLText.split('<ojp:Trip>').length - 1;
        this.parserTripsNo = tripsNo;
        callback('TripRequest.TripsNo', false);
        saxStream.on('opentag', (node) => {
            const newNode = new TreeNode(node.name, currentNode.name, node.attributes, [], null);
            currentNode.children.push(newNode);
            stack.push(newNode);
            currentNode = newNode;
        });
        saxStream.on('closetag', (nodeName) => {
            stack.pop();
            if (nodeName === 'ojp:Trip') {
                const trip = Trip.initFromTreeNode(currentNode);
                if (trip) {
                    trip.legs.forEach(leg => {
                        leg.patchLocations(mapContextLocations);
                        leg.patchSituations(mapContextSituations);
                    });
                    this.trips.push(trip);
                    callback('TripRequest.Trip', false);
                }
            }
            if (nodeName === 'ojp:TripResponseContext') {
                const placesTreeNode = currentNode.findChildNamed('ojp:Places');
                if (placesTreeNode) {
                    mapContextLocations = {};
                    const locationTreeNodes = placesTreeNode.findChildrenNamed('ojp:Location');
                    locationTreeNodes.forEach(locationTreeNode => {
                        var _a, _b;
                        const location = Location.initWithTreeNode(locationTreeNode);
                        const stopPlaceRef = (_b = (_a = location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
                        if (stopPlaceRef !== null) {
                            mapContextLocations[stopPlaceRef] = location;
                        }
                    });
                }
                const situationsTreeNode = currentNode.findChildNamed('ojp:Situations');
                if (situationsTreeNode) {
                    mapContextSituations = {};
                    const situationTreeNodes = situationsTreeNode.findChildrenNamed('ojp:PtSituation');
                    situationTreeNodes.forEach(situationTreeNode => {
                        const situation = PtSituationElement.initWithSituationTreeNode(situationTreeNode);
                        if (situation) {
                            mapContextSituations[situation.situationNumber] = situation;
                        }
                    });
                }
            }
            currentNode = stack[stack.length - 1];
        });
        saxStream.on('text', (text) => {
            currentNode.text = text;
        });
        saxStream.on('error', (error) => {
            console.error('SAX parsing error:', error);
            debugger;
        });
        saxStream.on('end', () => {
            this.hasValidResponse = true;
            TripsResponse.sortTrips(this.trips, this.tripRequestParams);
            callback('TripRequest.DONE', true);
        });
        saxStream.write(responseXMLText);
        saxStream.end();
    }
    static sortTrips(trips, tripRequestParams = null) {
        var _a;
        if (tripRequestParams === null) {
            return;
        }
        const tripModeType = tripRequestParams.modeType;
        const transportMode = tripRequestParams.transportMode;
        if (tripModeType !== 'monomodal') {
            return;
        }
        // Push first the monomodal trip with one leg matching the transport mode
        const monomodalTrip = (_a = trips.find(trip => {
            if (trip.legs.length !== 1) {
                return false;
            }
            if (trip.legs[0].legType !== 'ContinousLeg') {
                return false;
            }
            const continousLeg = trip.legs[0];
            return continousLeg.legTransportMode === transportMode;
        })) !== null && _a !== void 0 ? _a : null;
        if (monomodalTrip) {
            const tripIdx = trips.indexOf(monomodalTrip);
            trips.splice(tripIdx, 1);
            trips.unshift(monomodalTrip);
        }
    }
}
