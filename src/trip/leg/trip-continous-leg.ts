import { Location } from '../../location/location'

import { PathGuidance } from '../path-guidance'
import { XPathOJP } from '../../helpers/xpath-ojp'

import { LegTrack } from './leg-track'

import { TripLeg, LegType, LinePointData } from "./trip-leg"
import { TripLegPropertiesEnum, TripLegDrawType, TripLegLineType } from '../../types/map-geometry-types'
import { MapLegLineTypeColor } from '../../config/map-colors'
import { Duration } from '../../shared/duration'
import { IndividualTransportMode } from '../../types/individual-mode.types'
import { ServiceBooking } from './continous-leg/service-booking'

export class TripContinousLeg extends TripLeg {
  public legTransportMode: IndividualTransportMode | null
  public legDistance: number
  public pathGuidance: PathGuidance | null
  public walkDuration: Duration | null
  public serviceBooking: ServiceBooking | null;

  constructor(legType: LegType, legIDx: number, legDistance: number, fromLocation: Location, toLocation: Location) {
    super(legType, legIDx, fromLocation, toLocation)

    this.legTransportMode = null
    this.legDistance = legDistance
    this.pathGuidance = null
    this.walkDuration = null;
    this.serviceBooking = null;
  }

  public static initFromTripLeg(legIDx: number, legNode: Node | null, legType: LegType): TripContinousLeg | null {
    if (legNode === null) {
      return null;
    }

    const fromLocationNode = XPathOJP.queryNode('ojp:LegStart', legNode)
    const toLocationNode = XPathOJP.queryNode('ojp:LegEnd', legNode)
    if (fromLocationNode === null || toLocationNode === null) {
      return null
    }

    const fromLocation = Location.initWithOJPContextNode(fromLocationNode)
    const toLocation = Location.initWithOJPContextNode(toLocationNode)

    let distanceS = XPathOJP.queryText('ojp:Length', legNode)
    if (distanceS === null) {
      distanceS = '0';
    }
    const legDistance = parseInt(distanceS)

    const tripLeg = new TripContinousLeg(legType, legIDx, legDistance, fromLocation, toLocation);
    tripLeg.legDuration = Duration.initFromContextNode(legNode)

    tripLeg.pathGuidance = PathGuidance.initFromTripLeg(legNode);
    tripLeg.legTransportMode = tripLeg.computeLegTransportMode(legNode);
    if (tripLeg.legTransportMode === 'taxi') {
      tripLeg.serviceBooking = ServiceBooking.initWithContextNode(legNode);
    }

    tripLeg.legTrack = LegTrack.initFromLegNode(legNode);

    if (legType === 'TransferLeg') {
      tripLeg.walkDuration = Duration.initFromContextNode(legNode, 'ojp:WalkDuration')
    }

    return tripLeg;
  }

  private computeLegTransportMode(legNode: Node): IndividualTransportMode | null {
    const legModeS = XPathOJP.queryText('ojp:Service/ojp:IndividualMode', legNode)
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
      return 'taxi'
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
    return this.legTransportMode === 'taxi';
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
