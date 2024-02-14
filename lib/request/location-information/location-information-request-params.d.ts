import { GeoRestrictionType, GeoRestrictionPoiOSMTag } from "../../types/geo-restriction.type";
import { BaseRequestParams } from "../base-request-params";
export declare class LocationInformationRequestParams extends BaseRequestParams {
    locationName: string | null;
    stopPlaceRef: string | null;
    geoRestrictionType: GeoRestrictionType | null;
    poiOsmTags: GeoRestrictionPoiOSMTag[] | null;
    numberOfResults: number | null;
    bboxWest: number | null;
    bboxNorth: number | null;
    bboxEast: number | null;
    bboxSouth: number | null;
    constructor();
    static initWithLocationName(locationName: string, geoRestrictionType?: GeoRestrictionType | null): LocationInformationRequestParams;
    static initWithStopPlaceRef(stopPlaceRef: string): LocationInformationRequestParams;
    static initWithBBOXAndType(bboxWest: number, bboxNorth: number, bboxEast: number, bboxSouth: number, geoRestrictionType: GeoRestrictionType, limit?: number, poiOsmTags?: GeoRestrictionPoiOSMTag[] | null): LocationInformationRequestParams;
    protected buildRequestNode(): void;
    private computeRestrictionType;
}
