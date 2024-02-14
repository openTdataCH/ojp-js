import { TreeNode } from "../xml/tree-node";
export declare class SituationContent {
    summary: string;
    description: string;
    details: string[];
    constructor(summary: string, description: string, details: string[]);
    static initWithSituationTreeNode(treeNode: TreeNode): SituationContent | null;
}
