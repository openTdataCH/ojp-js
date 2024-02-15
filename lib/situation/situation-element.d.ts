import { TreeNode } from "../xml/tree-node";
import { SituationContent } from "./situation-content";
import { PtSituationSource } from './situation-source';
interface TimeInterval {
    startDate: Date;
    endDate: Date;
}
export declare class PtSituationElement {
    situationNumber: string;
    creationTime: Date;
    participantRef: string;
    version: number;
    source: PtSituationSource;
    validityPeriod: TimeInterval;
    priority: number;
    situationContent: SituationContent;
    treeNode: TreeNode | null;
    constructor(situationNumber: string, creationTime: Date, participantRef: string, version: number, source: PtSituationSource, validityPeriod: TimeInterval, priority: number, situationContent: SituationContent);
    static initWithSituationTreeNode(treeNode: TreeNode): PtSituationElement | null;
}
export {};
