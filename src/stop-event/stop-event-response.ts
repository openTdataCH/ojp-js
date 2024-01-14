import * as sax from 'sax';

import { Location } from '../location/location'
import { PtSituationElement } from '../situation/situation-element'
import { TreeNode } from '../xml/tree-node';
import { StopEvent } from './stop-event';
import { RequestErrorData } from '../request/request-error';

type StopEventResponseMessage = 'StopEvent.DONE' | 'ERROR';

export class StopEventResponse {
  public stopEvents: StopEvent[];
  public error: RequestErrorData | null;

  constructor() {
    this.stopEvents = [];
    this.error = null;
  }

  public parseXML(responseXMLText: string, callback: (message: StopEventResponseMessage) => void) {
    const saxStream = sax.createStream(true, { trim: true });
    const rootNode = new TreeNode('root', null, {}, [], null);

    let currentNode: TreeNode = rootNode;
    const stack: TreeNode[] = [rootNode];
    let mapContextLocations: Record<string, Location> = {};
    let mapContextSituations: Record<string, PtSituationElement> = {};

    this.stopEvents = [];

    saxStream.on('opentag', (node) => {
      const newNode = new TreeNode(node.name, currentNode.name, node.attributes as Record<string, string>, [], null);

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
            const location = Location.initWithTreeNode(locationTreeNode);
            const stopPlaceRef = location.stopPlace?.stopPlaceRef ?? null;
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
