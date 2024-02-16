import * as sax from 'sax';

import { TreeNode } from "../xml/tree-node";
import { IS_NODE_CLI } from '..';

export class BaseParser {
  private rootNode: TreeNode;
  protected currentNode: TreeNode;
  protected stack: TreeNode[];

  private mapUriNS: Record<string, string> = {
    "http://www.vdv.de/ojp": "",
    "http://www.siri.org.uk/siri": "siri",
  };

  constructor() {
    this.rootNode = new TreeNode("root", null, {}, [], null);
    this.currentNode = this.rootNode;
    this.stack = [];
  }

  private resetNodes() {
    this.rootNode = new TreeNode("root", null, {}, [], null);
    this.currentNode = this.rootNode;
    this.stack = [];
  }

  public parseXML(responseXMLText: string) {
    if (IS_NODE_CLI) {
      // 'sax' doesnt have a default export 
      //    and "import * as sax from 'sax';" 
      //    will fail for node CLI apps
      import('sax').then((module) => {
        const stream = module.default.createStream(true, { trim: true, xmlns: true });  
        this._parseXML(responseXMLText, stream);
      });
    } else {
      const stream = sax.createStream(true, { trim: true, xmlns: true });
      this._parseXML(responseXMLText, stream);
    }
  }

  private _parseXML(responseXMLText: string, saxStream: sax.SAXStream) {
    this.resetNodes();

    saxStream.on('opentag', (node: sax.QualifiedTag) => {
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

  private onOpenTag(node: sax.QualifiedTag) {
    const nodeName = (() => {
      const nodeParts = [];
      const nodeNs = this.mapUriNS[node.uri] ?? '';
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

  private onText(text: string) {
    this.currentNode.text = text;
  }

  private onSaxCloseTag(saxNodeName: string) {
    // remove currentNode from stack
    this.stack.pop();

    // dont rely on callback saxNodeName because it might contain the wrong prefix
    const nodeName = this.currentNode.name;
    this.onCloseTag(nodeName);
    
    // currentNode becomes latest item from the stack
    this.currentNode = this.stack[this.stack.length - 1];
  }

  protected onCloseTag(nodeName: string) {
    // override
  }

  protected onError(saxError: any) {
    // override
  }

  protected onEnd(): void {
    // override
  }
}
