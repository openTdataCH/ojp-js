import { XMLElement } from 'xmlbuilder';
import { TreeNode } from '../xml/tree-node';
type PublicTransportPictogram = 'picto-bus' | 'picto-railway' | 'picto-tram' | 'picto-rack-railway' | 'picto-funicular' | 'picto-cablecar' | 'picto-gondola' | 'picto-chairlift' | 'picto-boat' | 'car-sharing' | 'picto-bus-fallback';
export declare class PublicTransportMode {
    ptMode: string;
    name: string | null;
    shortName: string | null;
    isDemandMode: boolean;
    constructor(ptMode: string, name: string | null, shortName: string | null);
    static initWithServiceTreeNode(serviceTreeNode: TreeNode): PublicTransportMode | null;
    isRail(): boolean;
    hasPrecisePolyline(): boolean;
    computePublicTransportPictogram(): PublicTransportPictogram;
    addToXMLNode(parentNode: XMLElement): void;
}
export {};
