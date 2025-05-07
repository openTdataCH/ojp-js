import { Location } from '../../location/location';
import { PathGuidance } from '../path-guidance';
import { TripLeg, LegType } from "./trip-leg";
import { Duration } from '../../shared/duration';
import { IndividualTransportMode, TransferMode } from '../../types/individual-mode.types';
import { ServiceBooking } from './continous-leg/service-booking';
import { TreeNode } from '../../xml/tree-node';
import { XMLElement } from 'xmlbuilder';
import { XML_Config } from '../../types/_all';
type PersonalModeEnum = 'foot' | 'bicycle' | 'car' | 'motorcycle' | 'truck' | 'scooter' | 'other';
type PersonalModeOfOperation = 'self' | 'own' | 'otherOwned' | 'privateLift' | 'lease';
interface ContinuousLegService {
    personalMode: PersonalModeEnum;
    personalModeOfOperation: PersonalModeOfOperation;
}
export declare class TripContinuousLeg extends TripLeg {
    legTransportMode: IndividualTransportMode | null;
    legDistance: number;
    pathGuidance: PathGuidance | null;
    walkDuration: Duration | null;
    serviceBooking: ServiceBooking | null;
    transferMode: TransferMode | null;
    continousLegService: ContinuousLegService | null;
    constructor(legType: LegType, legIDx: number, legDistance: number, fromLocation: Location, toLocation: Location);
    static initWithTreeNode(legIDx: number, parentTreeNode: TreeNode, legType: LegType): TripContinuousLeg | null;
    private computeLegTransportModeFromTreeNode;
    private computeLegTransferModeFromTreeNode;
    private computeLegTransportModeFromString;
    isDriveCarLeg(): boolean;
    isSharedMobility(): boolean;
    isWalking(): boolean;
    isTaxi(): boolean;
    formatDistance(): string;
    addToXMLNode(parentNode: XMLElement, xmlConfig: XML_Config): void;
}
export {};
