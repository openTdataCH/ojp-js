import { Location } from "../../../location/location"
import { StopPointTime } from "./stop-point-time"
import { StopPointType } from "../../../types/stop-point-type"
import { PtSituationElement } from "../../../situation/situation-element"
import { TreeNode } from "../../../xml/tree-node"
import { StopPlace } from "../../../location/stopplace"

export class StopPoint {
  public stopPointType: StopPointType
  
  public location: Location
  public arrivalData: StopPointTime | null
  public departureData: StopPointTime | null
  public plannedPlatform: string | null
  public actualPlatform: string | null
  public sequenceOrder: number | null

  public siriSituationIds: string[]
  public siriSituations: PtSituationElement[]

  constructor(
    stopPointType: StopPointType, 
    location: Location, arrivalData: StopPointTime | null, 
    departureData: StopPointTime | null, 
    plannedPlatform: string | null, 
    sequenceOrder: number | null
  ) {
    this.stopPointType = stopPointType 
    this.location = location
    this.arrivalData = arrivalData
    this.departureData = departureData
    this.plannedPlatform = plannedPlatform
    this.actualPlatform = null
    this.sequenceOrder =  sequenceOrder

    this.siriSituationIds = [];
    this.siriSituations = [];
  }

  public static initWithTreeNode(treeNode: TreeNode, stopPointType: StopPointType): StopPoint | null {
    const stopPointRef = treeNode.findTextFromChildNamed('siri:StopPointRef');
    const stopPointName = treeNode.findTextFromChildNamed('StopPointName/Text');
    if (!(stopPointRef && stopPointName)) {
      return null;
    }

    const location = new Location();
    location.stopPlace = new StopPlace(stopPointRef, stopPointName, null);

    const arrivalData = StopPointTime.initWithParentTreeNode(treeNode, 'ServiceArrival');
    const departureData = StopPointTime.initWithParentTreeNode(treeNode, 'ServiceDeparture');
    const plannedPlatform = treeNode.findTextFromChildNamed('ojp:PlannedQuay/ojp:Text');

    const sequenceOrderS = treeNode.findTextFromChildNamed('Order');
    const sequenceOrder = sequenceOrderS === null ? null : parseInt(sequenceOrderS, 10);

    const stopPoint = new StopPoint(stopPointType, location, arrivalData, departureData, plannedPlatform, sequenceOrder);
    stopPoint.actualPlatform = treeNode.findTextFromChildNamed('EstimatedQuay/Text');

    stopPoint.siriSituationIds = [];
    const situationFullRefTreeNodes = treeNode.findChildrenNamed('SituationFullRef');
    situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
      const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('SituationNumber');
      if (situationNumber) {
        stopPoint.siriSituationIds.push(situationNumber);
      }
    });

    return stopPoint;
  }

  public patchSituations(mapContextSituations: Record<string, PtSituationElement>) {
    this.siriSituations = [];
    this.siriSituationIds.forEach(siriSituationId => {
      const siriSituation = mapContextSituations[siriSituationId] ?? null;
      if (siriSituation) {
        this.siriSituations.push(siriSituation)
      }
    })
  }
}
