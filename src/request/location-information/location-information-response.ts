import * as sax from 'sax';

import { Location } from '../../location/location';
import { RequestErrorData } from '../request-error';
import { TreeNode } from '../../xml/tree-node';

type LocationInformationResponseMessage = 'LocationInformation.DONE' | 'ERROR';
export type LocationInformationResponseCallback = (locations: Location[], message: LocationInformationResponseMessage) => void

export class LocationInformationResponse {
  public locations: Location[];
  public error: RequestErrorData | null;

  constructor() {
    this.locations = [];
    this.error = null;
  }

  public parseXML(responseXMLText: string, callback: LocationInformationResponseCallback) {
    const saxStream = sax.createStream(true, { trim: true });
    const rootNode = new TreeNode('root', null, {}, [], null);

    let currentNode: TreeNode = rootNode;
    const stack: TreeNode[] = [rootNode];

    this.locations = [];

    saxStream.on('opentag', (node) => {
      const newNode = new TreeNode(node.name, currentNode.name, node.attributes as Record<string, string>, [], null);

      currentNode.children.push(newNode);
      stack.push(newNode);
      currentNode = newNode;
    });

    saxStream.on('closetag', (nodeName) => {
      stack.pop();

      if (nodeName === 'PlaceResult') {
        const location = Location.initWithLocationResultTreeNode(currentNode);
        if (location) {
          this.locations.push(location);
        }
      }
      currentNode = stack[stack.length - 1];
    });

    saxStream.on('text', (text) => {
      currentNode.text = text;
    });

    saxStream.on('error', (error) => {
      console.error('SAX parsing error:', error);
      callback(this.locations, 'ERROR');
    });

    saxStream.on('end', () => {
      callback(this.locations, 'LocationInformation.DONE');
    });

    saxStream.write(responseXMLText);
    saxStream.end();
  }
}
