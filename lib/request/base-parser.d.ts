import { TreeNode } from "../xml/tree-node";
import { XML_Config } from '../types/_all';
export declare class BaseParser {
    protected xmlParserConfig: XML_Config;
    protected rootNode: TreeNode;
    protected currentNode: TreeNode;
    protected stack: TreeNode[];
    private mapUriNS;
    constructor(xmlBuilderConfig: XML_Config);
    private resetNodes;
    parseXML(responseXMLText: string): void;
    private _parseXML;
    private onOpenTag;
    private onText;
    private onSaxCloseTag;
    protected onCloseTag(nodeName: string): void;
    protected onError(saxError: any): void;
    protected onEnd(): void;
}
