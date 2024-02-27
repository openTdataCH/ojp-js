import { TreeNode } from "../xml/tree-node";
export declare class BaseParser {
    private rootNode;
    protected currentNode: TreeNode;
    protected stack: TreeNode[];
    private mapUriNS;
    constructor();
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
