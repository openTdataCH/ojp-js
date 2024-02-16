import * as sax from 'sax';
import { Location } from '../location/location';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';
import { StopEvent } from './stop-event';
export class StopEventResponse {
    constructor() {
        this.stopEvents = [];
        this.error = null;
    }
    parseXML(responseXMLText, callback) {
        const saxStream = sax.createStream(true, { trim: true });
        const rootNode = new TreeNode('root', null, {}, [], null);
        let currentNode = rootNode;
        const stack = [rootNode];
        let mapContextLocations = {};
        let mapContextSituations = {};
        this.stopEvents = [];
        saxStream.on('opentag', (node) => {
            const newNode = new TreeNode(node.name, currentNode.name, node.attributes, [], null);
            currentNode.children.push(newNode);
            stack.push(newNode);
            currentNode = newNode;
        });
        saxStream.on('closetag', (nodeName) => {
            stack.pop();
            if (nodeName === 'ojp:StopEventResponseContext') {
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
            if (nodeName === 'ojp:StopEventResult') {
                const stopEvent = StopEvent.initWithTreeNode(currentNode);
                if (stopEvent) {
                    stopEvent.patchStopEventLocations(mapContextLocations);
                    stopEvent.stopPoint.patchSituations(mapContextSituations);
                    this.stopEvents.push(stopEvent);
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
            callback('StopEvent.DONE');
        });
        saxStream.write(responseXMLText);
        saxStream.end();
    }
}
