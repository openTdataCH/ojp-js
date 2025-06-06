import { JourneyService } from '../../journey/journey-service'
import { StopPoint } from './timed-leg/stop-point'
import { LegTrack } from './leg-track'

import { TripLeg, LegType } from "./trip-leg"

import { StopPointTime } from './timed-leg/stop-point-time';

import { Location } from '../../location/location';
import { PtSituationElement } from '../../situation/situation-element'
import { TreeNode } from '../../xml/tree-node'
import { XMLElement } from 'xmlbuilder'
import { StopPointType } from '../../types/stop-point-type'
import { TripRequestBoardingType } from '../../request'
import { XML_Config } from '../../types/_all';
import { Duration } from '../../shared/duration';

export class TripTimedLeg extends TripLeg {
  public service: JourneyService

  public fromStopPoint: StopPoint
  public toStopPoint: StopPoint
  public intermediateStopPoints: StopPoint[]

  constructor(
    legIDx: number,
    service: JourneyService,
    fromStopPoint: StopPoint,
    toStopPoint: StopPoint,
    intermediateStopPoints: StopPoint[] = []
  ) {
    const legType: LegType = 'TimedLeg'
    super(legType, legIDx, fromStopPoint.location, toStopPoint.location);
    this.service = service
    this.fromStopPoint = fromStopPoint
    this.toStopPoint = toStopPoint
    this.intermediateStopPoints = intermediateStopPoints
  }

  public static initWithTreeNode(legIDx: number, parentTreeNode: TreeNode, xmlConfig: XML_Config): TripTimedLeg | null {
    const isOJPv2 = xmlConfig.ojpVersion === '2.0';

    const treeNode = parentTreeNode.findChildNamed('TimedLeg');
    if (treeNode === null) {
      return null;
    }

    const service = JourneyService.initWithTreeNode(treeNode, xmlConfig);
    if (service === null) {
      return null;
    }

    const fromStopTreeNode = treeNode.findChildNamed('LegBoard');
    const toStopTreeNode = treeNode.findChildNamed('LegAlight');
    if (fromStopTreeNode === null || toStopTreeNode === null) {
      return null;
    }

    const fromStopPoint = StopPoint.initWithTreeNode(fromStopTreeNode, 'From')
    const toStopPoint = StopPoint.initWithTreeNode(toStopTreeNode, 'To')
    if (fromStopPoint === null || toStopPoint === null) {
      return null;
    }

    const intermediateStopPoints: StopPoint[] = []

    const intermediaryStopTreeNodeName = isOJPv2 ? 'LegIntermediate' : 'LegIntermediates';
    const intermediaryStopTreeNodes = treeNode.findChildrenNamed(intermediaryStopTreeNodeName);
    intermediaryStopTreeNodes.forEach(intermediaryStopTreeNode => {
      const stopPoint = StopPoint.initWithTreeNode(intermediaryStopTreeNode, 'Intermediate');
      if (stopPoint) {
        intermediateStopPoints.push(stopPoint)
      }
    });

    const timedLeg = new TripTimedLeg(legIDx, service, fromStopPoint, toStopPoint, intermediateStopPoints);

    timedLeg.legTrack = LegTrack.initWithLegTreeNode(treeNode, xmlConfig);

    timedLeg.legDuration = (() => {
      // for TimedLeg Duration is at the parent level
      const timedLegDuration = Duration.initWithTreeNode(parentTreeNode);
      if (timedLegDuration !== null) {
        return timedLegDuration;
      }

      // rely on legtrack if present
      return timedLeg.legTrack?.duration ?? null;
    })();
    
    return timedLeg;
  }

  public override patchLocations(mapContextLocations: Record<string, Location>) {
    super.patchLocations(mapContextLocations)

    this.intermediateStopPoints.forEach(stopPoint => {
      this.patchLocation(stopPoint.location, mapContextLocations);
    });
  }

  public computeDepartureTime(): Date | null {
    return this.computeStopPointTime(this.fromStopPoint.departureData)
  }

  public computeArrivalTime(): Date | null {
    return this.computeStopPointTime(this.toStopPoint.arrivalData)
  }

  private computeStopPointTime(timeData: StopPointTime | null): Date | null {
    if (timeData === null) {
      return null
    }

    const stopPointDate = timeData.estimatedTime ?? timeData.timetableTime;
    return stopPointDate
  }

  public patchSituations(mapContextSituations: Record<string, PtSituationElement>) {
    this.service.siriSituations = [];
    this.service.siriSituationIds.forEach(siriSituationId => {
      const siriSituation = mapContextSituations[siriSituationId] ?? null;
      if (siriSituation) {
        this.service.siriSituations.push(siriSituation)
      }
    })
  }

  public addToXMLNode(parentNode: XMLElement, xmlConfig: XML_Config) {
    const isOJPv2 = xmlConfig.ojpVersion === '2.0';
    const ojpPrefix = xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
    const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';

    const legNodeName = isOJPv2 ? 'Leg' : 'TripLeg';
    const tripLegNode = parentNode.ele(ojpPrefix + legNodeName);

    const legIdTagName = isOJPv2 ? 'Id' : 'LegId';
    tripLegNode.ele(ojpPrefix + legIdTagName, this.legID);

    const legDurationF = this.legDuration?.asOJPFormattedText() ?? null;
    if (legDurationF) {
      tripLegNode.ele(ojpPrefix + 'Duration', legDurationF);
    }

    const timedLeg = tripLegNode.ele(ojpPrefix + 'TimedLeg');
    
    const boardingTypes: TripRequestBoardingType[] = ['Arr', 'Dep'];
    
    const addStopPoint = (stopPoint: StopPoint, stopPointType: StopPointType) => {
      const legEndpointName: string = (() => {
        if (stopPointType === 'From') {
          return ojpPrefix + 'LegBoard';
        }
        if (stopPointType === 'To') {
          return ojpPrefix + 'LegAlight';
        }

        const tagName = isOJPv2 ? 'LegIntermediate' : 'LegIntermediates';
        return ojpPrefix + tagName;
      })();

      const legEndpoint = timedLeg.ele(legEndpointName);

      const stopPlace = stopPoint.location.stopPlace;
      if (stopPlace) {
        legEndpoint.ele(siriPrefix + 'StopPointRef', stopPlace.stopPlaceRef);
        legEndpoint.ele(ojpPrefix + 'StopPointName').ele(ojpPrefix + 'Text', stopPlace.stopPlaceName ?? 'n/a');
      }

      if (stopPoint.vehicleAccessType) {
        legEndpoint.ele(ojpPrefix + 'NameSuffix').ele(ojpPrefix + 'Text', stopPoint.vehicleAccessType);
      }

      if (stopPoint.plannedPlatform) {
        legEndpoint.ele(ojpPrefix + 'PlannedQuay').ele(ojpPrefix + 'Text', stopPoint.plannedPlatform);
      }

      if (stopPoint.actualPlatform) {
        legEndpoint.ele(ojpPrefix + 'EstimatedQuay').ele(ojpPrefix + 'Text', stopPoint.actualPlatform);
      }

      boardingTypes.forEach(boardingType => {
        const isArrival = boardingType === 'Arr';
        const serviceDepArrData = isArrival ? stopPoint.arrivalData : stopPoint.departureData;

        if (serviceDepArrData) {
          const serviceDepArrTagName = isArrival ? 'ServiceArrival' : 'ServiceDeparture';
          const serviceDepArrNode = legEndpoint.ele(ojpPrefix + serviceDepArrTagName);
          serviceDepArrNode.ele(ojpPrefix + 'TimetabledTime', serviceDepArrData.timetableTime.toISOString());

          if (serviceDepArrData.estimatedTime) {
            serviceDepArrNode.ele(ojpPrefix + 'EstimatedTime', serviceDepArrData.estimatedTime.toISOString());
          }
        }
      });

      legEndpoint.ele(ojpPrefix + 'Order', legOrder);
      legOrder = legOrder + 1;
    };

    let legOrder = 1;
    addStopPoint(this.fromStopPoint, 'From');
    this.intermediateStopPoints.forEach(stopPoint => {
      addStopPoint(stopPoint, 'Intermediate');
    });
    addStopPoint(this.toStopPoint, 'To');

    this.service.addToXMLNode(timedLeg, xmlConfig);
  }
}
