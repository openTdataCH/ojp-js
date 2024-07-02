import { RestrictionType, POI_Restriction } from "../../types/lir-restrictions.type";
import { BaseRequestParams } from "../base-request-params";
import { GeoPosition } from "../../location/geoposition";
export declare class LocationInformationRequestParams extends BaseRequestParams {
    locationName: string | null;
    stopPlaceRef: string | null;
    restrictionTypes: RestrictionType[];
    poiRestriction: POI_Restriction | null;
    numberOfResults: number | null;
    bboxWest: number | null;
    bboxNorth: number | null;
    bboxEast: number | null;
    bboxSouth: number | null;
    circleCenter: GeoPosition | null;
    circleRadius: number | null;
    constructor();
    static initWithLocationName(locationName: string, restrictionTypes?: RestrictionType[] | null, limit?: number): LocationInformationRequestParams;
    static initWithStopPlaceRef(stopPlaceRef: string): LocationInformationRequestParams;
    static initWithBBOXAndType(bboxWest: number, bboxNorth: number, bboxEast: number, bboxSouth: number, restrictionTypes: RestrictionType[], limit?: number, poiRestriction?: POI_Restriction | null): LocationInformationRequestParams;
    static initWithCircleLngLatRadius(circleLongitude: number, circleLatitude: number, circleRadius: number, restrictionTypes?: RestrictionType[], numberOfResults?: number): LocationInformationRequestParams;
    protected buildRequestNode(): void;
}
