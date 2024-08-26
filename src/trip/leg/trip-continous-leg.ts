import * as GeoJSON from 'geojson'

import { Location } from '../../location/location'

import { PathGuidance } from '../path-guidance'

import { LegTrack } from './leg-track'

import { TripLeg, LegType, LinePointData } from "./trip-leg"
import { TripLegPropertiesEnum, TripLegDrawType, TripLegLineType } from '../../types/map-geometry-types'
import { MapLegLineTypeColor } from '../../config/map-colors'
import { Duration } from '../../shared/duration'
import { IndividualTransportMode, TransferMode } from '../../types/individual-mode.types'
import { ServiceBooking } from './continous-leg/service-booking'
import { TreeNode } from '../../xml/tree-node'

export class TripContinousLeg extends TripLeg {
  public legTransportMode: IndividualTransportMode | null
  public legDistance: number
  public pathGuidance: PathGuidance | null
  public walkDuration: Duration | null
  public serviceBooking: ServiceBooking | null;
  public transferMode: TransferMode | null

  constructor(legType: LegType, legIDx: number, legDistance: number, fromLocation: Location, toLocation: Location) {
    super(legType, legIDx, fromLocation, toLocation)

    this.legTransportMode = null
    this.legDistance = legDistance
    this.pathGuidance = null
    this.walkDuration = null;
    this.serviceBooking = null;
    this.transferMode = null;
  }

  public static initWithTreeNode(legIDx: number, treeNode: TreeNode, legType: LegType): TripContinousLeg | null {
    const legStartPlaceRefTreeNode = treeNode.findChildNamed('LegStart');
    const legEndPlaceRefTreeNode = treeNode.findChildNamed('LegEnd');
    if (legStartPlaceRefTreeNode === null || legEndPlaceRefTreeNode === null) {
      return null;
    }

    const legStartPlaceRef = Location.initWithTreeNode(legStartPlaceRefTreeNode);
    const legEndPlaceRef = Location.initWithTreeNode(legEndPlaceRefTreeNode);
    if (legStartPlaceRef === null || legEndPlaceRef === null) {
      return null;
    }

    let distanceS = treeNode.findTextFromChildNamed('Length') ?? '0';
    const legDistance = parseInt(distanceS);

    const tripLeg = new TripContinousLeg(legType, legIDx, legDistance, legStartPlaceRef, legEndPlaceRef);
    tripLeg.legDuration = Duration.initWithTreeNode(treeNode);

    tripLeg.pathGuidance = PathGuidance.initWithTreeNode(treeNode);
    
    tripLeg.legTransportMode = tripLeg.computeLegTransportModeFromTreeNode(treeNode, legType);
    tripLeg.transferMode = tripLeg.computeLegTransferModeFromTreeNode(treeNode);

    const isOthersDriveCar = tripLeg.legTransportMode === 'taxi' || tripLeg.legTransportMode === 'others-drive-car';
    
    if (isOthersDriveCar) {
      tripLeg.serviceBooking = ServiceBooking.initWithLegTreeNode(treeNode);
    }

    tripLeg.legTrack = LegTrack.initWithLegTreeNode(treeNode);

    if (legType === 'TransferLeg') {
      tripLeg.walkDuration = Duration.initWithTreeNode(treeNode, 'WalkDuration');
    }

    return tripLeg;
  }

  private computeLegTransportModeFromTreeNode(treeNode: TreeNode, legType: LegType): IndividualTransportMode | null {
    let legModeS: string | null = null;

    if (legType === 'TransferLeg') {
      return null;
    }

    if (legType === 'TimedLeg' || legType === 'ContinousLeg') {
      legModeS = treeNode.findTextFromChildNamed('Service/IndividualMode');
      if (legModeS === null) {
        const personalModeParts: string[] = [];
  
        const personalNodePaths: string[] = [
          'Service/PersonalMode',
          'Service/PersonalModeOfOperation',
          'Service/Mode/PtMode',
          'Service/Mode/siri:RailSubmode',
          'Service/Mode/siri:WaterSubmode',
        ];
  
        personalNodePaths.forEach(personalNodePath => {
          const personalNodeValue = treeNode.findTextFromChildNamed(personalNodePath);
          if (personalNodeValue !== null) {
            personalModeParts.push(personalNodeValue);
          }
        });
  
        legModeS = personalModeParts.join('.');
      }
    }

    const firstBookingAgency = treeNode.findTextFromChildNamed('Service/BookingArrangements/BookingArrangement/BookingAgencyName/Text');
    const legMode = this.computeLegTransportModeFromString(legModeS, firstBookingAgency);

    if (legMode === null) {
      console.error('ERROR computeLegTransportModeFromString');
      console.log('=> CANT handle mode --' + legModeS + '--');
      console.log(treeNode);
    }

    return legMode;
  }

  private computeLegTransferModeFromTreeNode(treeNode: TreeNode): TransferMode | null {
    const transferModeS = treeNode.findTextFromChildNamed('TransferMode');
    if (transferModeS === null) {
      return null;
    }

    if (transferModeS === 'walk') {
      return 'walk'
    }
    if (transferModeS === 'remainInVehicle') {
      return 'remainInVehicle'
    }

    console.error('CANT map TransferMode from ==' + transferModeS + '==');

    return null;
  }

  private computeLegTransportModeFromString(legModeS: string | null, firstBookingAgency: string | null = null): IndividualTransportMode | null {
    if (legModeS === null) {
      return null
    }

    if (legModeS === 'walk') {
      return 'walk'
    }

    if (legModeS === 'self-drive-car') {
      return 'self-drive-car'
    }

    if (legModeS === 'cycle') {
      return 'cycle'
    }

    if (legModeS === 'taxi') {
      // HACK: BE returns 'taxi' for limo, check first booking agency to see if is actually a limo leg
      if (firstBookingAgency?.indexOf('_limousine_') !== -1) {
        return 'others-drive-car';
      }
      return 'taxi'
    }

    if (legModeS === 'car.own') {
      return 'self-drive-car';
    }

    if (legModeS === 'car.own.rail.vehicleTunnelTransportRailService') {
      return 'car-shuttle-train';
    }

    if (legModeS === 'car.own.water.localCarFerry') {
      return 'car-ferry'
    }

    return null
  }

  public isDriveCarLeg(): boolean {
    return this.legTransportMode === 'self-drive-car';
  }

  public isSharedMobility(): boolean {
    if (this.legTransportMode === null) {
      return false;
    }

    const sharedMobilityModes: IndividualTransportMode[] = ['cycle', 'bicycle_rental', 'car_sharing', 'escooter_rental'];
    const hasSharedMobilityMode = sharedMobilityModes.indexOf(this.legTransportMode) !== -1;

    return hasSharedMobilityMode;
  }

  public isWalking(): boolean {
    return this.legTransportMode === 'walk';
  }

  public isTaxi(): boolean {
    return this.legTransportMode === 'taxi' || this.legTransportMode === 'others-drive-car';
  }

  protected override computeSpecificJSONFeatures(): GeoJSON.Feature[] {
    const features: GeoJSON.Feature[] = [];

    this.pathGuidance?.sections.forEach((pathGuidanceSection, guidanceIDx) => {
      const feature = pathGuidanceSection.trackSection?.linkProjection?.asGeoJSONFeature();
      if (feature?.properties) {
        const drawType: TripLegDrawType = 'LegLine'
        feature.properties[TripLegPropertiesEnum.DrawType] = drawType

        const lineType: TripLegLineType = 'Guidance'
        feature.properties[TripLegPropertiesEnum.LineType] = lineType

        feature.properties['PathGuidanceSection.idx'] = guidanceIDx;
        feature.properties['PathGuidanceSection.TrackSection.RoadName'] = pathGuidanceSection.trackSection?.roadName ?? '';
        feature.properties['PathGuidanceSection.TrackSection.Duration'] = pathGuidanceSection.trackSection?.duration ?? '';
        feature.properties['PathGuidanceSection.TrackSection.Length'] = pathGuidanceSection.trackSection?.length ?? '';
        feature.properties['PathGuidanceSection.GuidanceAdvice'] = pathGuidanceSection.guidanceAdvice ?? '';
        feature.properties['PathGuidanceSection.TurnAction'] = pathGuidanceSection.turnAction ?? '';

        features.push(feature);
      }
    });

    this.legTrack?.trackSections.forEach(trackSection => {
      const feature = trackSection.linkProjection?.asGeoJSONFeature()
      if (feature?.properties) {
        const drawType: TripLegDrawType = 'LegLine'
        feature.properties[TripLegPropertiesEnum.DrawType] = drawType

        feature.properties[TripLegPropertiesEnum.LineType] = this.computeLegLineType()

        features.push(feature);
      }
    });

    return features;
  }

  protected override computeLegLineType(): TripLegLineType {
    if (this.isDriveCarLeg()) {
      return 'Self-Drive Car'
    }

    if (this.isSharedMobility()) {
      return 'Shared Mobility'
    }

    if (this.isTaxi()) {
      return 'OnDemand';
    }

    if (this.legType === 'TransferLeg') {
      return 'Transfer'
    }

    if (this.legTransportMode === 'car-ferry') {
      return 'Water';
    }

    return 'Walk'
  }

  protected override computeLinePointsData(): LinePointData[] {
    // Don't show endpoints for TransferLeg
    if (this.legType === 'TransferLeg') {
      return []
    }

    const pointsData = super.computeLinePointsData()

    return pointsData;
  }

  public override computeLegColor(): string {
    if (this.isDriveCarLeg()) {
      return MapLegLineTypeColor['Self-Drive Car']
    }

    if (this.isSharedMobility()) {
      return MapLegLineTypeColor['Shared Mobility']
    }

    if (this.legType === 'TransferLeg') {
      return MapLegLineTypeColor.Transfer
    }

    if (this.isTaxi()) {
      return MapLegLineTypeColor.OnDemand;
    }

    if (this.legTransportMode === 'car-ferry') {
      return MapLegLineTypeColor.Water;
    }

    return MapLegLineTypeColor.Walk;
  }

  public formatDistance(): string {
    if (this.legDistance > 1000) {
      const distanceKmS = (this.legDistance / 1000).toFixed(1) + ' km'
      return distanceKmS
    }

    return this.legDistance + ' m'
  }

  protected override useBeeline(): boolean {
    if (this.legType === 'TransferLeg') {
      if (this.pathGuidance === null) {
        return super.useBeeline();
      }

      let hasGeoData = false;
      this.pathGuidance.sections.forEach(section => {
        if (section.trackSection?.linkProjection) {
          hasGeoData = true;
        }
      });

      return hasGeoData === false;
    }

    return super.useBeeline();
  }
}
