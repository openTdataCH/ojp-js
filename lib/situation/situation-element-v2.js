import { PtSituationSource } from './situation-source';
export class PtSituationElement {
    constructor(situationNumber, creationTime, countryRef, participantRef, version, source, progress, validityPeriods, alertCause, priority, publishingActions, isPlanned) {
        this.situationNumber = situationNumber;
        this.creationTime = creationTime;
        this.countryRef = countryRef;
        this.participantRef = participantRef;
        this.version = version;
        this.source = source;
        this.progress = progress;
        this.validityPeriods = validityPeriods;
        this.alertCause = alertCause;
        this.priority = priority;
        this.publishingActions = publishingActions;
        this.isPlanned = isPlanned;
        this.treeNode = null;
    }
    static initFromSituationNode(treeNode) {
        const situationNumber = treeNode.findTextFromChildNamed('siri:SituationNumber');
        const creationTimeS = treeNode.findTextFromChildNamed('siri:CreationTime');
        if (creationTimeS === null) {
            console.error('ERROR - creationTimeS is null', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const creationTime = new Date(creationTimeS);
        const countryRef = treeNode.findTextFromChildNamed('siri:CountryRef');
        const participantRef = treeNode.findTextFromChildNamed('siri:ParticipantRef');
        const versionS = treeNode.findTextFromChildNamed('siri:Version');
        if (versionS === null) {
            console.error('ERROR - Version is NULL', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const version = parseInt(versionS);
        const situationSource = PtSituationSource.initWithSituationTreeNode(treeNode);
        const situationProgress = treeNode.findTextFromChildNamed('siri:Progress');
        const validityPeriods = [];
        const validityPeriodNodes = treeNode.findChildrenNamed('siri:ValidityPeriod');
        validityPeriodNodes.forEach(validityPeriodNode => {
            const validityPeriodStartDateS = treeNode.findTextFromChildNamed('siri:StartTime');
            const validityPeriodEndDateS = treeNode.findTextFromChildNamed('siri:EndTime');
            if (!(validityPeriodStartDateS && validityPeriodEndDateS)) {
                return;
            }
            const validityPeriod = {
                startDate: new Date(validityPeriodStartDateS),
                endDate: new Date(validityPeriodEndDateS)
            };
            validityPeriods.push(validityPeriod);
        });
        if (validityPeriods.length === 0) {
            console.error('initFromSituationNode: EMPTY <ValidityPeriod>');
            console.log(situationNumber);
            console.log(treeNode);
            return null;
        }
        const alertCause = treeNode.findTextFromChildNamed('siri:AlertCause');
        const situationPriorityS = treeNode.findTextFromChildNamed('siri:Priority');
        if (situationPriorityS === null) {
            console.error('ERROR - Priority is NULL', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const situationPriority = parseInt(situationPriorityS);
        if (!(situationNumber && countryRef && participantRef && situationSource && situationProgress && alertCause)) {
            console.error('ERROR - cant init', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const plannedS = treeNode.findTextFromChildNamed('siri:Planned');
        const isPlanned = plannedS === 'true';
        const publishingActions = PtSituationElement.computePublishingActionsFromSituationNode(situationNumber, treeNode);
        const situationElement = new PtSituationElement(situationNumber, creationTime, countryRef, participantRef, version, situationSource, situationProgress, validityPeriods, alertCause, situationPriority, publishingActions, isPlanned);
        situationElement.treeNode = treeNode;
        return situationElement;
    }
    static computePublishingActionsFromSituationNode(situationNumber, treeNode) {
        const publishingActions = [];
        const publishingActionNodes = treeNode.findChildrenNamed('siri:PublishingActions/siri:PublishingAction');
        publishingActionNodes.forEach(publishingActionNode => {
            const publishingAction = PtSituationElement.computePublishingAction(situationNumber, publishingActionNode);
            if (publishingAction === null) {
                console.error('ERROR - cant compute PublishingAction', 'PtSituationElement.initFromSituationNode');
                console.log(publishingActionNode);
                return;
            }
            publishingActions.push(publishingAction);
        });
        return publishingActions;
    }
    static computePublishingAction(situationNumber, publishingActionTreeNode) {
        const infoActionNode = publishingActionTreeNode.findChildNamed('siri:PassengerInformationAction');
        if (infoActionNode === null) {
            console.error('computePublishingAction: NO <PassengerInformationAction>');
            console.log(situationNumber);
            console.log(publishingActionTreeNode);
            return null;
        }
        const actionRef = infoActionNode.findTextFromChildNamed('siri:ActionRef');
        if (actionRef === null) {
            console.error('computePublishingAction: NULL actionRef');
            console.log(situationNumber);
            console.log(publishingActionTreeNode);
            return null;
        }
        const ownerRef = infoActionNode.findTextFromChildNamed('siri:OwnerRef');
        const scopeType = publishingActionTreeNode.findTextFromChildNamed('siri:PublishAtScope/siri:ScopeType');
        if (scopeType === null) {
            console.error('computePublishingAction: NULL scopeType');
            console.log(situationNumber);
            console.log(publishingActionTreeNode);
            return null;
        }
        const perspectives = [];
        const perspectiveNodes = infoActionNode.findChildrenNamed('siri:Perspective');
        perspectiveNodes.forEach(perspectiveNode => {
            const perspectiveText = perspectiveNode.text;
            if (perspectiveText) {
                perspectives.push(perspectiveText);
            }
        });
        const mapTextualContent = {};
        const textualContentNodes = infoActionNode.findChildrenNamed('siri:TextualContent');
        textualContentNodes.forEach(textualContentNode => {
            const sizeKey = (() => {
                const sizeS = textualContentNode.findTextFromChildNamed('siri:TextualContentSize');
                if (sizeS === 'S') {
                    return 'small';
                }
                if (sizeS === 'M') {
                    return 'medium';
                }
                if (sizeS === 'L') {
                    return 'large';
                }
                return null;
            })();
            if (sizeKey === null) {
                console.error('ERROR: cant compute size', 'computePublishingAction');
                console.log(textualContentNode);
                return;
            }
            const textualContentItem = PtSituationElement.computeTextualContent(textualContentNode);
            if (textualContentItem === null) {
                console.error('ERROR: cant compute textual content', 'computePublishingAction');
                console.log(textualContentNode);
                return;
            }
            mapTextualContent[sizeKey] = textualContentItem;
        });
        const actionAffects = PtSituationElement.computeAffects(situationNumber, scopeType, publishingActionTreeNode);
        const publishingAction = {
            scopeType: scopeType,
            affects: actionAffects,
            passengerInformation: {
                actionRef: actionRef,
                ownerRef: ownerRef,
                perspectives: perspectives,
                mapTextualContent: mapTextualContent
            },
        };
        return publishingAction;
    }
    static computeAffects(situationNumber, scopeType, publishingActionNode) {
        const actionAffects = [];
        const affectedLineNetworkNodes = publishingActionNode.findChildrenNamed('siri:PublishAtScope/siri:Affects/siri:Networks/siri:AffectedNetwork/siri:AffectedLine');
        affectedLineNetworkNodes.forEach(affectedLineNetworkNode => {
            var _a;
            const lineNetwork = PtSituationElement.computeLineNetwork(affectedLineNetworkNode);
            if (lineNetwork === null) {
                return;
            }
            if (scopeType === 'line') {
                actionAffects.push({
                    type: 'entire-line',
                    affect: lineNetwork
                });
            }
            if (scopeType === 'stopPlace') {
                const directionRef = (_a = affectedLineNetworkNode.findTextFromChildNamed('siri:Direction/siri:DirectionRef')) !== null && _a !== void 0 ? _a : 'n/a';
                const stopPlacesNodes = affectedLineNetworkNode.findChildrenNamed('siri:StopPlaces/siri:AffectedStopPlace');
                const stopPlaces = PtSituationElement.computeAffectedStopPlaces(stopPlacesNodes);
                const affectedPartialLine = {
                    lineNetwork: lineNetwork,
                    directionRef: directionRef,
                    stopPlaces: stopPlaces,
                };
                actionAffects.push({
                    type: 'partial-line',
                    affect: affectedPartialLine
                });
            }
        });
        if (scopeType === 'stopPlace') {
            const stopPlacesNodes = publishingActionNode.findChildrenNamed('siri:PublishAtScope/siri:Affects/siri:StopPlaces/siri:AffectedStopPlace');
            const stopPlaces = PtSituationElement.computeAffectedStopPlaces(stopPlacesNodes);
            stopPlaces.forEach(stopPlace => {
                actionAffects.push({
                    type: 'stop',
                    affect: stopPlace
                });
            });
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
        if (actionAffects.length === 0) {
            console.error('computeAffects: EMPTY affects?');
            console.log(situationNumber);
            console.log(publishingActionNode);
        }
        else {
            if (scopeType === 'vehicleJourney') {
                // debugger;
            }
        }
        return actionAffects;
    }
    static computeLineNetwork(lineNetworkNode) {
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
        const lineNetwork = {
            operator: {
                operatorRef: operatorRef
            },
            lineRef: lineRef,
            publishedLineName: publishedLineName,
            stopPlaces: stopPlaces
        };
        return lineNetwork;
    }
    static computeAffectedStopPlaces(stopPlaceNodes) {
        const stopPlaces = [];
        stopPlaceNodes.forEach(stopPlaceNode => {
            const stopPlaceRef = stopPlaceNode.findTextFromChildNamed('siri:StopPlaceRef');
            const placeName = stopPlaceNode.findTextFromChildNamed('siri:PlaceName');
            if ((stopPlaceRef === null) || (placeName === null)) {
                console.log('ERROR: StopPlace cant init');
                console.log(stopPlaceNode);
                return null;
            }
            const stopPlace = {
                stopPlaceRef: stopPlaceRef,
                placeName: placeName,
            };
            stopPlaces.push(stopPlace);
        });
        return stopPlaces;
    }
    static computeAffectedJourneys(situationNumber, publishingActionNode) {
        const affectedVehicleJourneys = [];
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
            const framedVehicleJourneyRef = {
                dataFrameRef: dataFrameRef,
                datedVehicleJourneyRef: datedVehicleJourneyRef,
            };
            const operatorRef = vehicleJourneyNode.findTextFromChildNamed('siri:Operator/siri:OperatorRef');
            if (operatorRef === null) {
                console.error('computeAffectedJourneys - NULL operatorRef');
                console.log(situationNumber);
                console.log(vehicleJourneyNode);
                return;
            }
            let origin = null;
            const orginRef = vehicleJourneyNode.findTextFromChildNamed('siri:Origins/siri:StopPlaceRef');
            if (orginRef !== null) {
                origin = {
                    stopPlaceRef: orginRef,
                    placeName: vehicleJourneyNode.findTextFromChildNamed('siri:Origins/siri:PlaceName')
                };
            }
            let destination = null;
            const destinationRef = vehicleJourneyNode.findTextFromChildNamed('siri:Destinations/siri:StopPlaceRef');
            if (destinationRef !== null) {
                destination = {
                    stopPlaceRef: destinationRef,
                    placeName: vehicleJourneyNode.findTextFromChildNamed('siri:Destinations/siri:PlaceName')
                };
            }
            const stopCallNodes = vehicleJourneyNode.findChildrenNamed('siri:Calls/siri:Call');
            const callStopsRef = [];
            stopCallNodes.forEach(stopCallNode => {
                const stopPlaceRef = stopCallNode.findTextFromChildNamed('siri:StopPlaceRef');
                if (stopPlaceRef === null) {
                    return;
                }
                callStopsRef.push(stopPlaceRef);
            });
            const lineRef = vehicleJourneyNode.findTextFromChildNamed('siri:LineRef');
            const publishedLineName = vehicleJourneyNode.findTextFromChildNamed('siri:PublishedLineName');
            const affectedVehicleJourney = {
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
    static computeTextualContent(textualContentNode) {
        const summaryNode = textualContentNode.findChildNamed('siri:SummaryContent');
        if (summaryNode === null) {
            console.log('No SummaryText found');
            console.log(textualContentNode);
            return null;
        }
        const mapTextData = {};
        debugger;
        const childNodes = textualContentNode.findChildrenNamed('siri:*');
        // childNodes.forEach(childNode => {
        //     const childEl = childNode as Element;
        //     const textKey = childEl.tagName.replace('Content', '');
        //     // TextualContentSize doesnt have any text
        //     if (childEl.tagName === 'TextualContentSize') {
        //         return
        //     }
        //     if (!(textKey in mapTextData)) {
        //         mapTextData[textKey] = [];
        //     }
        //     const textPropertyContent = PtSituationElement.computeTextualPropertyContent(childNode);
        //     mapTextData[textKey].push(textPropertyContent);
        // });
        const summaryTextContent = PtSituationElement.computeTextualPropertyContent(summaryNode);
        const textualContent = {
            summary: summaryTextContent,
            mapTextData: mapTextData
        };
        return textualContent;
    }
    static computeTextualPropertyContent(textualPropertyContentNode) {
        const textPropertyData = {};
        const textLangNodes = textualPropertyContentNode.findChildrenNamed('siri:*');
        debugger;
        // textLangNodes.forEach(textLangNode => {
        //     const langKey: LangEnum | null = (() => {
        //         let langS = (textLangNode as Element).getAttribute('xml:lang');
        //         if (langS === null) {
        //             return null;
        //         }
        //         langS = langS.toLowerCase();
        //         if (langS === 'de') {
        //             return 'de'
        //         }
        //         if (langS === 'en') {
        //             return 'en'
        //         }
        //         if (langS === 'fr') {
        //             return 'fr'
        //         }
        //         if (langS === 'it') {
        //             return 'it'
        //         }
        //         return null;
        //     })();
        //     if (langKey === null) {
        //         return;
        //     }
        //     const textValue = textLangNode.textContent;
        //     textPropertyData[langKey] = textValue;
        // });
        return textPropertyData;
    }
    isActive(date = new Date()) {
        var _a;
        const activePeriod = (_a = this.validityPeriods.find(el => {
            return (el.startDate < date) && (el.endDate > date);
        })) !== null && _a !== void 0 ? _a : null;
        return activePeriod !== null;
    }
}
