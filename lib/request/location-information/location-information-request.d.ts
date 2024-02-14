import { StageConfig } from '../../types/stage-config';
import { GeoRestrictionPoiOSMTag, GeoRestrictionType } from '../../types/geo-restriction.type';
import { OJPBaseRequest } from '../base-request';
import { LIR_Response } from '../types/location-information-request.type';
import { Location } from '../../location/location';
import { LocationInformationRequestParams } from './location-information-request-params';
export declare class LocationInformationRequest extends OJPBaseRequest {
    private requestParams;
    constructor(stageConfig: StageConfig, requestParams: LocationInformationRequestParams);
    static initWithResponseMock(mockText: string): LocationInformationRequest;
    static initWithLocationName(stageConfig: StageConfig, locationName: string, geoRestrictionType?: GeoRestrictionType | null): LocationInformationRequest;
    static initWithStopPlaceRef(stageConfig: StageConfig, stopPlaceRef: string): LocationInformationRequest;
    static initWithBBOXAndType(stageConfig: StageConfig, bboxWest: number, bboxNorth: number, bboxEast: number, bboxSouth: number, geoRestrictionType: GeoRestrictionType, limit?: number, poiOsmTags?: GeoRestrictionPoiOSMTag[] | null): LocationInformationRequest;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<LIR_Response>;
    fetchLocations(): Promise<Location[]>;
}
