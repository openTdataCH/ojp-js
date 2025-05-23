import { Location } from "../../../location/location"
import { StopPointTime } from "./stop-point-time"
import { StopPointType } from "../../../types/stop-point-type"
import { PtSituationElement } from "../../../situation/situation-element"
import { TreeNode } from "../../../xml/tree-node"
import { StopPlace } from "../../../location/stopplace"
import { FareClassType, OccupancyLevel } from "../../../types/_all"
type MapFareClassOccupancy = Record<FareClassType, OccupancyLevel | null>;

export class StopPoint {
  public stopPointType: StopPointType
  
  public location: Location
  public arrivalData: StopPointTime | null
  public departureData: StopPointTime | null
  public plannedPlatform: string | null
  public actualPlatform: string | null
  public sequenceOrder: number | null
  public isNotServicedStop: boolean | null

  public siriSituationIds: string[]
  public siriSituations: PtSituationElement[]

  public vehicleAccessType: string | null;

  public mapFareClassOccupancy: MapFareClassOccupancy;

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
    this.sequenceOrder = sequenceOrder
    this.isNotServicedStop = null;

    this.siriSituationIds = [];
    this.siriSituations = [];

    this.vehicleAccessType = null;
    this.mapFareClassOccupancy = {
      firstClass: null,
      secondClass: null,
    };
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
    const plannedPlatform = treeNode.findTextFromChildNamed('PlannedQuay/Text');

    const sequenceOrderS = treeNode.findTextFromChildNamed('Order');
    const sequenceOrder = sequenceOrderS === null ? null : parseInt(sequenceOrderS, 10);

    const stopPoint = new StopPoint(stopPointType, location, arrivalData, departureData, plannedPlatform, sequenceOrder);
    
    stopPoint.actualPlatform = treeNode.findTextFromChildNamed('EstimatedQuay/Text');

    const notServicedStopNode = treeNode.findChildNamed('NotServicedStop');
    if (notServicedStopNode) {
      stopPoint.isNotServicedStop = notServicedStopNode.text === 'true';
    }

    stopPoint.siriSituationIds = [];
    const situationFullRefTreeNodes = treeNode.findChildrenNamed('SituationFullRef');
    situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
      const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('siri:SituationNumber');
      if (situationNumber) {
        stopPoint.siriSituationIds.push(situationNumber);
      }
    });

    stopPoint.vehicleAccessType = treeNode.findTextFromChildNamed('NameSuffix/Text');
    stopPoint.mapFareClassOccupancy = StopPoint.computeMapFareClassOccupancy(treeNode);

    return stopPoint;
  }

  private static computeMapFareClassOccupancy(treeNode: TreeNode): MapFareClassOccupancy {
    const mapFareClassOccupancy: MapFareClassOccupancy = {
      firstClass: null,
      secondClass: null,
    };

    const expectedDepartureOccupancyNodes = treeNode.findChildrenNamed('siri:ExpectedDepartureOccupancy');
    expectedDepartureOccupancyNodes.forEach(occupancyNode => {
      const fareClass: FareClassType | null = (() => {
        const fareClassText = occupancyNode.findTextFromChildNamed('siri:FareClass');
        if (fareClassText === 'firstClass') {
          return 'firstClass';
        }

        if (fareClassText === 'secondClass') {
          return 'secondClass';
        }

        return null;
      })();

      if (fareClass === null) {
        console.error('computeMapFareClassOccupancy: unexpected fareClass');
        console.log(occupancyNode);
        return;
      }

      const occupancyLevelValue: OccupancyLevel | null = (() => {
        const occupancyLevelText = occupancyNode.findTextFromChildNamed('siri:OccupancyLevel');
        if (occupancyLevelText === 'fewSeatsAvailable') {
          return 'fewSeatsAvailable';
        }

        if (occupancyLevelText === 'manySeatsAvailable') {
          return 'manySeatsAvailable';
        }

        if (occupancyLevelText === 'standingRoomOnly') {
          return 'standingRoomOnly';
        }

        if (occupancyLevelText === 'unknown') {
          return 'unknown';
        }

        return null;
      })();

      if (occupancyLevelValue === null) {
        console.error('computeMapFareClassOccupancy: unexpected occupancy level');
        console.log(occupancyNode);
        return;
      }

      mapFareClassOccupancy[fareClass] = occupancyLevelValue;
    });

    return mapFareClassOccupancy;
  }
}
