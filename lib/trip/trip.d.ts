import { XMLElement } from 'xmlbuilder';
import { TripStats } from '../types/trip-stats';
import { TripLeg } from './leg/trip-leg';
import { TreeNode } from '../xml/tree-node';
import { XML_Config } from '../types/_all';
export declare class Trip {
    id: string;
    legs: TripLeg[];
    stats: TripStats;
    constructor(tripID: string, legs: TripLeg[], tripStats: TripStats);
    static initFromTreeNode(treeNode: TreeNode, xmlConfig: XML_Config): Trip | null;
    computeDepartureTime(): Date | null;
    computeArrivalTime(): Date | null;
    asXMLNode(xmlConfig: XML_Config): XMLElement;
    asXML(xmlConfig: XML_Config): string;
}
