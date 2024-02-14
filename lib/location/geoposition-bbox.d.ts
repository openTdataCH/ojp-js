import { GeoPosition } from "./geoposition";
export declare class GeoPositionBBOX {
    southWest: GeoPosition;
    northEast: GeoPosition;
    constructor(geoPositions: GeoPosition | GeoPosition[]);
    static initFromGeoPosition(geoPosition: GeoPosition, width_x_meters: number, width_y_meters: number): GeoPositionBBOX;
    extend(geoPositions: GeoPosition | GeoPosition[]): void;
    asFeatureBBOX(): [number, number, number, number];
    isValid(): boolean;
    containsGeoPosition(geoPosition: GeoPosition): boolean;
}
