import * as GeoJSON from 'geojson';
import { Location } from '../../location/location';
import { LegTrack } from './leg-track';
import { TripLegLineType } from '../../types/map-geometry-types';
import { GeoPosition } from '../../location/geoposition';
import { StopPointType } from '../../types/stop-point-type';
import { Duration } from '../../shared/duration';
import { PtSituationElement } from '../../situation/situation-element';
export type LegType = 'ContinousLeg' | 'TimedLeg' | 'TransferLeg';
export interface LinePointData {
    type: StopPointType;
    feature: GeoJSON.Feature<GeoJSON.Point>;
}
export declare class TripLeg {
    legType: LegType;
    legID: number;
    fromLocation: Location;
    toLocation: Location;
    legTrack: LegTrack | null;
    legDuration: Duration | null;
    constructor(legType: LegType, legIDx: number, fromLocation: Location, toLocation: Location);
    patchLocations(mapContextLocations: Record<string, Location>): void;
    patchSituations(mapContextSituations: Record<string, PtSituationElement>): void;
    protected patchLocation(location: Location, mapContextLocations: Record<string, Location>): void;
    computeGeoJSONFeatures(): GeoJSON.Feature[];
    protected useBeeline(): boolean;
    private computeLegType;
    protected computeSpecificJSONFeatures(): GeoJSON.Feature[];
    computeLegColor(): string;
    protected computeLinePointsData(): LinePointData[];
    private computeLinePointFeatures;
    protected computeLegLineType(): TripLegLineType;
    private computeBeelineFeature;
    protected computeBeelineGeoPositions(): GeoPosition[];
}
