import { TreeNode } from "../xml/tree-node";
import { PtSituationSource } from './situation-source';
interface TimeInterval {
    startDate: Date;
    endDate: Date;
}
type ScopeType = 'line' | 'stopPlace' | 'vehicleJourney';
type TextualContentSizeEnum = 'small' | 'medium' | 'large';
type LangEnum = 'de' | 'fr' | 'it' | 'en';
type TextualPropertyContent = Record<LangEnum, string | null>;
interface TextualContent {
    summary: TextualPropertyContent;
    mapTextData: Record<string, TextualPropertyContent[]>;
}
type MapTextualContent = Record<TextualContentSizeEnum, TextualContent>;
interface PassengerInformationAction {
    actionRef: string;
    ownerRef: string | null;
    perspectives: string[];
    mapTextualContent: MapTextualContent;
}
interface StopPlace {
    stopPlaceRef: string;
    placeName: string;
}
interface NetworkOperator {
    operatorRef: string;
}
interface LineNetwork {
    operator: NetworkOperator;
    lineRef: string;
    publishedLineName: string;
    stopPlaces: StopPlace[];
}
interface AffectedLineNetworkWithStops {
    lineNetwork: LineNetwork;
    directionRef: string;
    stopPlaces: StopPlace[];
}
interface FramedVehicleJourneyRef {
    dataFrameRef: string;
    datedVehicleJourneyRef: string;
}
interface AffectedStopPlace {
    stopPlaceRef: string;
    placeName: string | null;
}
interface AffectedVehicleJourney {
    framedVehicleJourneyRef: FramedVehicleJourneyRef;
    operator: NetworkOperator;
    origin: AffectedStopPlace | null;
    destination: AffectedStopPlace | null;
    callStopsRef: string[];
    lineRef: string | null;
    publishedLineName: string | null;
}
interface PublishingActionAffect {
    type: 'stop' | 'entire-line' | 'partial-line' | 'vehicle-journey';
    affect: StopPlace | LineNetwork | AffectedLineNetworkWithStops | AffectedVehicleJourney;
}
interface PublishingAction {
    scopeType: ScopeType;
    passengerInformation: PassengerInformationAction;
    affects: PublishingActionAffect[];
}
export declare class PtSituationElement {
    situationNumber: string;
    creationTime: Date;
    countryRef: string;
    participantRef: string;
    version: number;
    source: PtSituationSource;
    progress: string;
    validityPeriods: TimeInterval[];
    alertCause: string;
    priority: number;
    publishingActions: PublishingAction[];
    isPlanned: boolean;
    treeNode: TreeNode | null;
    constructor(situationNumber: string, creationTime: Date, countryRef: string, participantRef: string, version: number, source: PtSituationSource, progress: string, validityPeriods: TimeInterval[], alertCause: string, priority: number, publishingActions: PublishingAction[], isPlanned: boolean);
    static initFromSituationNode(treeNode: TreeNode): PtSituationElement | null;
    private static computePublishingActionsFromSituationNode;
    private static computePublishingAction;
    private static computeAffects;
    private static computeLineNetwork;
    private static computeAffectedStopPlaces;
    private static computeAffectedJourneys;
    private static computeTextualContent;
    private static computeTextualPropertyContent;
    isActive(date?: Date): boolean;
}
export {};
