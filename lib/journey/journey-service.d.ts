import { XMLElement } from 'xmlbuilder';
import { PublicTransportMode } from './public-transport-mode';
import { StopPlace } from '../location/stopplace';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';
import { XML_Config } from '../types/_all';
interface ServiceAttribute {
    code: string;
    text: string;
    extra: Record<string, string>;
}
interface ProductCategory {
    name: string;
    shortName: string;
    productCategoryRef: string;
}
export declare class JourneyService {
    journeyRef: string;
    lineRef: string | null;
    directionRef: string | null;
    operatingDayRef: string;
    ptMode: PublicTransportMode;
    operatorRef: string;
    originStopPlace: StopPlace | null;
    destinationStopPlace: StopPlace | null;
    productCategory: ProductCategory | null;
    serviceLineNumber: string | null;
    journeyNumber: string | null;
    siriSituationIds: string[];
    siriSituations: PtSituationElement[];
    serviceAttributes: Record<string, ServiceAttribute>;
    hasCancellation: boolean | null;
    hasDeviation: boolean | null;
    isUnplanned: boolean | null;
    constructor(journeyRef: string, operatingDayRef: string, ptMode: PublicTransportMode, operatorRef: string);
    static initWithTreeNode(treeNode: TreeNode, xmlConfig: XML_Config): JourneyService | null;
    formatServiceName(): string;
    addToXMLNode(parentNode: XMLElement, xmlConfig: XML_Config): void;
}
export {};
