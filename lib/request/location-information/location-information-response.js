import * as sax from 'sax';
import { Location } from '../../location/location';
import { TreeNode } from '../../xml/tree-node';
export class LocationInformationResponse {
    constructor() {
        this.locations = [];
        this.error = null;
    }
    parseXML(responseXMLText, callback) {
        const saxStream = sax.createStream(true, { trim: true });
        const rootNode = new TreeNode('root', null, {}, [], null);
        let currentNode = rootNode;
        const stack = [rootNode];
        this.locations = [];
        saxStream.on('opentag', (node) => {
            const newNode = new TreeNode(node.name, currentNode.name, node.attributes, [], null);
            currentNode.children.push(newNode);
            stack.push(newNode);
            currentNode = newNode;
        });
        saxStream.on('closetag', (nodeName) => {
            stack.pop();
            if (nodeName === 'ojp:Location' && currentNode.parentName === 'ojp:OJPLocationInformationDelivery') {
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
