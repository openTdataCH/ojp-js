import { PublicTransportMode } from './public-transport-mode'
import { TripLegLineType } from "../types/map-geometry-types";

import { StopPlace } from '../location/stopplace';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';

export class JourneyService {
  public journeyRef: string;
  public ptMode: PublicTransportMode;
  public agencyID: string;
  public originStopPlace: StopPlace | null;
  public destinationStopPlace: StopPlace | null;
  public serviceLineNumber: string | null
  public journeyNumber: string | null
  
  public siriSituationIds: string[]
  public siriSituations: PtSituationElement[]

  constructor(journeyRef: string, ptMode: PublicTransportMode, agencyID: string) {
    this.journeyRef = journeyRef;
    this.ptMode = ptMode;
    this.agencyID = agencyID;
    
    this.originStopPlace = null;
    this.destinationStopPlace = null;
    this.serviceLineNumber = null;
    this.journeyNumber = null;

    this.siriSituationIds = [];
    this.siriSituations = [];
  }

  public static initWithTreeNode(treeNode: TreeNode): JourneyService | null {
    const serviceTreeNode = treeNode.findChildNamed('Service');
    if (serviceTreeNode === null) {
      return null;
    }

    const journeyRef = serviceTreeNode.findTextFromChildNamed('JourneyRef');
    const ptMode = PublicTransportMode.initWithServiceTreeNode(serviceTreeNode);

    const agencyCode = serviceTreeNode.findTextFromChildNamed('siri:OperatorRef');

    if (!(journeyRef && ptMode && agencyID)) {
      return null;
    }

    const legService = new JourneyService(journeyRef, ptMode, agencyID);

    legService.originStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Origin');
    legService.destinationStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Destination');

    legService.serviceLineNumber = serviceTreeNode.findTextFromChildNamed('ojp:PublishedLineName/ojp:Text');
    legService.journeyNumber = treeNode.findTextFromChildNamed('ojp:Extension/ojp:PublishedJourneyNumber/ojp:Text');

    legService.siriSituationIds = [];
    const situationFullRefTreeNodes = serviceTreeNode.findChildrenNamed('SituationFullRef');
    situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
      const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('siri:SituationNumber');
      if (situationNumber) {
        legService.siriSituationIds.push(situationNumber);
      }
    });

    return legService;
  }

  public computeLegLineType(): TripLegLineType {
    const isPostAuto = this.agencyID === '801'
    if (isPostAuto) {
      return 'PostAuto'
    }

    if (this.ptMode.isRail()) {
      return 'LongDistanceRail'
    }

    if (this.ptMode.isDemandMode) {
      return 'OnDemand'
    }

    return 'Bus'
  }

  public formatServiceName(): string {
    if (this.ptMode.isDemandMode) {
      return this.serviceLineNumber ?? 'OnDemand';
    }

    const nameParts: string[] = []

    if (this.serviceLineNumber) {
      if (!this.ptMode.isRail()) {
        nameParts.push(this.ptMode.shortName ?? this.ptMode.ptMode)
      }

      nameParts.push(this.serviceLineNumber)
      nameParts.push(this.journeyNumber ?? '')
    } else {
      nameParts.push(this.ptMode.shortName ?? this.ptMode.ptMode)
    }

    nameParts.push('(' + this.agencyID + ')')

    return nameParts.join(' ')
  }
}
