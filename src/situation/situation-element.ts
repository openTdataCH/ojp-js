import { TreeNode } from "../xml/tree-node"

import { PtSituationSource } from './situation-source'

interface TimeInterval {
    startDate: Date
    endDate: Date
}

type ScopeType = 'line' | 'stopPlace' | 'vehicleJourney'

interface PassengerInformationAction {
    actionRef: string | null
    ownerRef: string | null
    perspectives: string[]    
    mapTextualContent: Record<string, string[]>
}

interface StopPlace {
    stopPlaceRef: string
    placeName: string
}

interface NetworkOperator {
    operatorRef: string
}

interface LineNetwork {
    operator: NetworkOperator
    lineRef: string
    publishedLineName: string
    stopPlaces: StopPlace[]
}

interface AffectedLineNetworkWithStops {
    lineNetwork: LineNetwork
    directionRef: string
    stopPlaces: StopPlace[]
}

interface FramedVehicleJourneyRef {
    dataFrameRef: string
    datedVehicleJourneyRef: string
}

interface AffectedStopPlace {
    stopPlaceRef: string
    placeName: string | null
}

interface AffectedVehicleJourney {
    framedVehicleJourneyRef: FramedVehicleJourneyRef
    operator: NetworkOperator
    origin: AffectedStopPlace | null
    destination: AffectedStopPlace | null
    callStopsRef: string[]
    lineRef: string | null
    publishedLineName: string | null
}

interface PublishingActionAffect {
    type: 'stop' | 'entire-line' | 'partial-line' | 'vehicle-journey'
    affect:  StopPlace | LineNetwork | AffectedLineNetworkWithStops | AffectedVehicleJourney
}

interface PublishingAction {
    passengerInformation: PassengerInformationAction
    affects: PublishingActionAffect[]
}

// Support also the v1 model with Description/Detail in the root level of the <PtSituation>
export interface SituationContent {
    summary: string
    descriptions: string[]
    details: string[]  
}

export class PtSituationElement {
    public situationNumber: string
    public creationTime: Date 
    public countryRef: string 
    public participantRef: string 
    public version: number 
    public source: PtSituationSource
    public progress: string
    public validityPeriods: TimeInterval[]
    public alertCause: string
    public priority: number
    public scopeType: ScopeType
    public publishingActions: PublishingAction[]
    public isPlanned: boolean

    public situationContent: SituationContent | null

    public treeNode: TreeNode | null

    constructor(
        situationNumber: string, 
        creationTime: Date, 
        countryRef: string, 
        participantRef: string, 
        version: number, 
        source: PtSituationSource, 
        progress: string, 
        validityPeriods: TimeInterval[], 
        alertCause: string, 
        priority: number, 
        scopeType: ScopeType,
        publishingActions: PublishingAction[],
        isPlanned: boolean
    ) {
        this.situationNumber = situationNumber
        this.creationTime = creationTime
        this.countryRef = countryRef
        this.participantRef = participantRef
        this.version = version
        this.source = source
        this.progress = progress
        this.validityPeriods = validityPeriods
        this.alertCause = alertCause
        this.priority = priority
        this.scopeType = scopeType
        this.publishingActions = publishingActions
        this.isPlanned = isPlanned

        this.situationContent = null
        
        this.treeNode = null;
    }

    public static initWithSituationTreeNode(treeNode: TreeNode): PtSituationElement | null {
        const situationNumber = treeNode.findTextFromChildNamed('siri:SituationNumber');
        
        const creationTimeS = treeNode.findTextFromChildNamed('siri:CreationTime');
        if (creationTimeS === null) {
            console.error('ERROR - creationTimeS is null', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const creationTime = new Date(creationTimeS);
        
        const countryRef = treeNode.findTextFromChildNamed('siri:CountryRef') ?? 'n/a CountryRef';
        const participantRef = treeNode.findTextFromChildNamed('siri:ParticipantRef');
        
        const versionS = treeNode.findTextFromChildNamed('siri:Version');
        if (versionS === null) {
            console.error('ERROR - Version is NULL', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const version = parseInt(versionS)

        const situationSource = PtSituationSource.initWithSituationTreeNode(treeNode);

        const situationProgress = treeNode.findTextFromChildNamed('siri:Progress') ?? 'n/a Progress';

        const validityPeriods: TimeInterval[] = [];
        const validityPeriodNodes = treeNode.findChildrenNamed('siri:ValidityPeriod');
        validityPeriodNodes.forEach(validityPeriodNode => {
            const validityPeriodStartDateS = validityPeriodNode.findTextFromChildNamed('siri:StartTime');
            const validityPeriodEndDateS = validityPeriodNode.findTextFromChildNamed('siri:EndTime');
            if (!(validityPeriodStartDateS && validityPeriodEndDateS)) {
                return;
            }
            const validityPeriod: TimeInterval = {
                startDate: new Date(validityPeriodStartDateS),
                endDate: new Date(validityPeriodEndDateS)
            };
            validityPeriods.push(validityPeriod);
        });

        if (validityPeriods.length === 0) {
            console.error('initFromSituationNode: EMPTY <ValidityPeriod>')
            console.log(situationNumber);
            console.log(treeNode);
            return null;            
        }

        const alertCause = treeNode.findTextFromChildNamed('siri:AlertCause') ?? 'n/a AlertCause';
        
        const situationPriorityS = treeNode.findTextFromChildNamed('siri:Priority');
        if (situationPriorityS === null) {
            console.error('ERROR - Priority is NULL', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const situationPriority = parseInt(situationPriorityS);

        const scopeType: ScopeType | null = (() => {
            const scopeTypeS = treeNode.findTextFromChildNamed('siri:ScopeType');
            
            if (scopeTypeS === 'line' || scopeTypeS === 'route') {
                return 'line'
            };

            if (scopeTypeS === 'stopPlace' || scopeTypeS === 'stopPoint') {
                return 'stopPlace'
            };

            if (scopeTypeS === 'vehicleJourney') {
                return 'vehicleJourney';
            };

            return null;
        })();

        if (!(situationNumber && countryRef && participantRef && situationSource && situationProgress && alertCause && scopeType)) {
            console.error('ERROR - cant init', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }

        const plannedS = treeNode.findTextFromChildNamed('siri:Planned');
        const isPlanned = plannedS === 'true';

        const publishingActions = PtSituationElement.computePublishingActionsFromSituationNode(situationNumber, scopeType, treeNode);

        const situationElement = new PtSituationElement(
            situationNumber, 
            creationTime, 
            countryRef, 
            participantRef, 
            version, 
            situationSource, 
            situationProgress, 
            validityPeriods, 
            alertCause, 
            situationPriority, 
            scopeType,
            publishingActions, 
            isPlanned,
        );
        situationElement.treeNode = treeNode;
        situationElement.situationContent = this.computeSituationContent(treeNode);

        if ((situationElement.publishingActions.length === 0) && (situationElement.situationContent === null)) {
            console.error('PtSituationElement.initFromSituationNode: NO publishing action found and also situationContent is null')
        }

        return situationElement;
    }

    private static computePublishingActionsFromSituationNode(situationNumber: string, scopeType: ScopeType, treeNode: TreeNode): PublishingAction[] {
        const publishingActions: PublishingAction[] = [];

        const publishingActionsNode = treeNode.findChildNamed('siri:PublishingActions');
        if (publishingActionsNode === null) {
            return publishingActions;
        }

        const publishingActionNodes = publishingActionsNode.findChildrenNamed('siri:PublishingAction');
        publishingActionNodes.forEach(publishingActionNode => {
            const publishingAction = PtSituationElement.computePublishingAction(situationNumber, scopeType, publishingActionNode);
            if (publishingAction === null) {
                console.error('ERROR - cant compute PublishingAction', 'PtSituationElement.initFromSituationNode');
                console.log(publishingActionNode);
                return;
            }

            publishingActions.push(publishingAction);
        });

        return publishingActions;
    }

    private static computePublishingAction(situationNumber: string, scopeType: ScopeType, publishingActionTreeNode: TreeNode): PublishingAction | null {
        const infoActionNode = publishingActionTreeNode.findChildNamed('siri:PassengerInformationAction');
        if (infoActionNode === null) {
            console.error('computePublishingAction: NO <PassengerInformationAction>');
            console.log(situationNumber);
            console.log(publishingActionTreeNode);
            return null;
        }

        const actionRef = infoActionNode.findTextFromChildNamed('siri:ActionRef');
        const ownerRef = infoActionNode.findTextFromChildNamed('siri:OwnerRef');

        const perspectives: string[] = [];
        const perspectiveNodes = infoActionNode.findChildrenNamed('siri:Perspective')
        perspectiveNodes.forEach(perspectiveNode => {
            const perspectiveText = perspectiveNode.text;
            if (perspectiveText) {
                perspectives.push(perspectiveText);
            }
        });

        const textualContentTreeNode = publishingActionTreeNode.findChildNamed('siri:PassengerInformationAction/siri:TextualContent');
        let mapTextualContent: Record<string, string[]> = {};
        if (textualContentTreeNode) {
            mapTextualContent = {};
            textualContentTreeNode.children.forEach(childTreeNode => {
                const textKey = childTreeNode.name.replace('siri:', '').replace('Content', '');
                if (!(textKey in mapTextualContent)) {
                    mapTextualContent[textKey] = [];
                }

                if (childTreeNode.children.length > 0) {
                    const textValue = childTreeNode.children[0].text;
                    if (textValue !== null) {
                        mapTextualContent[textKey].push(textValue.trim());
                    }
                }
            });
        }

        const actionAffects = PtSituationElement.computeAffects(situationNumber, scopeType, publishingActionTreeNode);

        const publishingAction: PublishingAction = {
            affects: actionAffects,
            passengerInformation: {
                actionRef: actionRef,
                ownerRef: ownerRef,
                perspectives: perspectives,
                mapTextualContent: mapTextualContent,
            },
        }

        return publishingAction;
    }

    private static computeAffects(situationNumber: string, scopeType: ScopeType, publishingActionNode: TreeNode): PublishingActionAffect[] {
        const actionAffects: PublishingActionAffect[] = []

        const affectedNetworkTreeNode = publishingActionNode.findChildNamed('siri:PublishAtScope/siri:Affects/siri:Networks/siri:AffectedNetwork');
        if (affectedNetworkTreeNode) {
            const affectedLineNetworkNodes = affectedNetworkTreeNode.findChildrenNamed('siri:AffectedLine');
            affectedLineNetworkNodes.forEach(affectedLineNetworkNode => {
                const lineNetwork = PtSituationElement.computeLineNetwork(affectedLineNetworkNode);
                if (lineNetwork === null) {
                    return
                }
    
                if (scopeType === 'line') {
                    actionAffects.push({
                        type: 'entire-line',
                        affect: lineNetwork
                    })
                }
    
                if (scopeType === 'stopPlace') {
                    const directionRef = affectedLineNetworkNode.findTextFromChildNamed('siri:Direction/siri:DirectionRef') ?? 'n/a';
    
                    const stopPlacesNodes = affectedLineNetworkNode.findChildrenNamed('siri:StopPlaces/siri:AffectedStopPlace');
                    const stopPlaces = PtSituationElement.computeAffectedStopPlaces(stopPlacesNodes);
    
                    const affectedPartialLine: AffectedLineNetworkWithStops = {
                        lineNetwork: lineNetwork,
                        directionRef: directionRef,
                        stopPlaces: stopPlaces,
                    }
    
                    actionAffects.push({
                        type: 'partial-line',
                        affect: affectedPartialLine
                    });
                }
            });
        }

        if (scopeType === 'stopPlace') {
            const stopPlacesTreeNode = publishingActionNode.findChildNamed('siri:PublishAtScope/siri:Affects/siri:StopPlaces');
            if (stopPlacesTreeNode) {
                const affectedStopPlaceNodes = stopPlacesTreeNode.findChildrenNamed('siri:AffectedStopPlace');
                const stopPlaces = PtSituationElement.computeAffectedStopPlaces(affectedStopPlaceNodes);
                stopPlaces.forEach(stopPlace => {
                    actionAffects.push({
                        type: 'stop',
                        affect: stopPlace
                    });
                });
            }
        }

        if (scopeType === 'vehicleJourney') {
            const affectedVehicleJourneys = PtSituationElement.computeAffectedJourneys(situationNumber, publishingActionNode);
            affectedVehicleJourneys.forEach(affectedVehicleJourney => {
                actionAffects.push({
                    type: 'vehicle-journey',
                    affect: affectedVehicleJourney
                });
            });
        }

        return actionAffects;
    }

    private static computeLineNetwork(lineNetworkNode: TreeNode): LineNetwork | null {
        const operatorRef = lineNetworkNode.findTextFromChildNamed('siri:AffectedOperator/siri:OperatorRef');
        const lineRef = lineNetworkNode.findTextFromChildNamed('siri:LineRef');
        const publishedLineName = lineNetworkNode.findTextFromChildNamed('siri:PublishedLineName');

        if ((operatorRef === null) || (lineRef === null) || (publishedLineName === null)) {
            console.log('ERROR: LineNetwork cant init');
            console.log(lineNetworkNode);
            return null;
        }

        const stopPlaceNodes = lineNetworkNode.findChildrenNamed('siri:StopPlaces/siri:AffectedStopPlace');
        const stopPlaces = PtSituationElement.computeAffectedStopPlaces(stopPlaceNodes);

        const lineNetwork: LineNetwork = {
            operator: {
                operatorRef: operatorRef
            },
            lineRef: lineRef,
            publishedLineName: publishedLineName,
            stopPlaces: stopPlaces
        };

        return lineNetwork;
    }

    private static computeAffectedStopPlaces(stopPlaceNodes: TreeNode[]): StopPlace[] {
        const stopPlaces: StopPlace[] = []

        stopPlaceNodes.forEach(stopPlaceNode => {
            const stopPlaceRef = stopPlaceNode.findTextFromChildNamed('siri:StopPlaceRef');
            const placeName = stopPlaceNode.findTextFromChildNamed('siri:PlaceName');

            if ((stopPlaceRef === null) || (placeName === null)) {
                console.log('ERROR: StopPlace cant init');
                console.log(stopPlaceNode);
                return null;
            }

            const stopPlace: StopPlace = {
                stopPlaceRef: stopPlaceRef,
                placeName: placeName,
            }
            stopPlaces.push(stopPlace);
        });

        return stopPlaces;
    }

    private static computeAffectedJourneys(situationNumber: string, publishingActionNode: TreeNode): AffectedVehicleJourney[] {
        const affectedVehicleJourneys: AffectedVehicleJourney[] = [];

        const affectedVehicleJourneyNodes = publishingActionNode.findChildrenNamed('siri:PublishAtScope/siri:Affects/siri:VehicleJourneys/siri:AffectedVehicleJourney');
        affectedVehicleJourneyNodes.forEach((vehicleJourneyNode, idx) => {
            const framedVehicleJourneyRefNode = vehicleJourneyNode.findChildNamed('siri:FramedVehicleJourneyRef');
            if (framedVehicleJourneyRefNode === null) {
                console.error('computeAffectedJourneys - NULL FramedVehicleJourneyRef');
                console.log(situationNumber);
                console.log(vehicleJourneyNode);
                return;
            }

            const dataFrameRef = framedVehicleJourneyRefNode.findTextFromChildNamed('siri:DataFrameRef');
            const datedVehicleJourneyRef = framedVehicleJourneyRefNode.findTextFromChildNamed('siri:DatedVehicleJourneyRef');
            if (dataFrameRef === null || datedVehicleJourneyRef === null) {
                console.error('computeAffectedJourneys - NULL FramedVehicleJourneyRef members');
                console.log(situationNumber);
                console.log(framedVehicleJourneyRefNode);
                return;
            }

            const framedVehicleJourneyRef: FramedVehicleJourneyRef = {
                dataFrameRef: dataFrameRef,
                datedVehicleJourneyRef: datedVehicleJourneyRef,
            }
            
            const operatorRef = vehicleJourneyNode.findTextFromChildNamed('siri:Operator/siri:OperatorRef');
            if (operatorRef === null) {
                console.error('computeAffectedJourneys - NULL operatorRef');
                console.log(situationNumber);
                console.log(vehicleJourneyNode);
                return;
            }

            let origin: AffectedStopPlace | null = null;
            const orginRef = vehicleJourneyNode.findTextFromChildNamed('siri:Origins/siri:StopPlaceRef');
            if (orginRef !== null) {
                origin = {
                    stopPlaceRef: orginRef,
                    placeName: vehicleJourneyNode.findTextFromChildNamed('siri:Origins/siri:PlaceName')
                }
            }

            let destination: AffectedStopPlace | null = null;
            const destinationRef = vehicleJourneyNode.findTextFromChildNamed('siri:Destinations/siri:StopPlaceRef');
            if (destinationRef !== null) {
                destination = {
                    stopPlaceRef: destinationRef,
                    placeName: vehicleJourneyNode.findTextFromChildNamed('siri:Destinations/siri:PlaceName')
                }
            }
            
            const stopCallNodes = vehicleJourneyNode.findChildrenNamed('siri:Calls/siri:Call');
            const callStopsRef: string[] = [];
            stopCallNodes.forEach(stopCallNode => {
                const stopPlaceRef = stopCallNode.findTextFromChildNamed('siri:StopPlaceRef');
                if (stopPlaceRef === null) {
                    return
                }
                
                callStopsRef.push(stopPlaceRef);
            });

            const lineRef = vehicleJourneyNode.findTextFromChildNamed('siri:LineRef');
            const publishedLineName = vehicleJourneyNode.findTextFromChildNamed('siri:PublishedLineName');

            const affectedVehicleJourney: AffectedVehicleJourney = {
                framedVehicleJourneyRef: framedVehicleJourneyRef,
                operator: {
                    operatorRef: operatorRef
                },
                origin: origin,
                destination: destination,
                callStopsRef: callStopsRef,
                lineRef: lineRef,
                publishedLineName: publishedLineName,
            };

            affectedVehicleJourneys.push(affectedVehicleJourney);
        });

        return affectedVehicleJourneys;
    }

    public isActive(date: Date = new Date()): boolean {
        const activePeriod = this.validityPeriods.find(el => {
            return (el.startDate < date) && (el.endDate > date);
        }) ?? null;

        return activePeriod !== null;
    }


    public static computeSituationContent(treeNode: TreeNode): SituationContent | null {
        const summary = treeNode.findTextFromChildNamed('siri:Summary');
    
        if (summary === null) {
          return null;
        }
    
        const descriptions: string[] = []
        const descriptionNodes = treeNode.findChildrenNamed('siri:Description');
        descriptionNodes.forEach(descriptionTreeNode => {
          const descriptionText = descriptionTreeNode.text;
          if (descriptionText) {
            descriptions.push(descriptionText);
          }
        });
    
        const details: string[] = []
        const detailNodes = treeNode.findChildrenNamed('siri:Detail');
        detailNodes.forEach(detailTreeNode => {
          const detailText = detailTreeNode.text;
          if (detailText) {
            details.push(detailText);
          }
        });
    
        const situationContent: SituationContent = {
            summary: summary,
            descriptions: descriptions,
            details: details
        };

        return situationContent;
    }    

}
