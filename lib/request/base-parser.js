import * as sax from 'sax';
import { TreeNode } from "../xml/tree-node";
export class BaseParser {
    constructor() {
        this.mapUriNS = {
            "http://www.vdv.de/ojp": "",
            "http://www.siri.org.uk/siri": "siri",
        };
        this.rootNode = new TreeNode("root", null, {}, [], null);
        this.currentNode = this.rootNode;
        this.stack = [];
    }
    resetNodes() {
        this.rootNode = new TreeNode("root", null, {}, [], null);
        this.currentNode = this.rootNode;
        this.stack = [];
    }
    parseXML(responseXMLText) {
        this.resetNodes();
        const saxStream = sax.createStream(true, { trim: true, xmlns: true });
        saxStream.on('opentag', (node) => {
            this.onOpenTag(node);
        });
        saxStream.on('text', (text) => {
            this.onText(text);
        });
        saxStream.on('closetag', (saxNodeName) => {
            this.onSaxCloseTag(saxNodeName);
        });
        saxStream.on('error', (saxError) => {
            this.onError(saxError);
        });
        saxStream.on('end', () => {
            this.onEnd();
        });
        saxStream.write(responseXMLText);
        saxStream.end();
    }
    onOpenTag(node) {
        const nodeName = (() => {
            var _a;
            const nodeParts = [];
            const nodeNs = (_a = this.mapUriNS[node.uri]) !== null && _a !== void 0 ? _a : '';
            if (nodeNs !== '') {
                nodeParts.push(nodeNs);
            }
            nodeParts.push(node.local);
            return nodeParts.join(':');
        })();
        const newNode = new TreeNode(nodeName, this.currentNode.name, node.attributes, [], null);
        this.currentNode.children.push(newNode);
        this.stack.push(newNode);
        this.currentNode = newNode;
    }
    onText(text) {
        this.currentNode.text = text;
    }
    onSaxCloseTag(saxNodeName) {
        // remove currentNode from stack
        this.stack.pop();
        // dont rely on callback saxNodeName because it might contain the wrong prefix
        const nodeName = this.currentNode.name;
        this.onCloseTag(nodeName);
        // currentNode becomes latest item from the stack
        this.currentNode = this.stack[this.stack.length - 1];
    }
    onCloseTag(nodeName) {
        // override
    }
    onError(saxError) {
        // override
    }
    onEnd() {
        // override
    }
}
