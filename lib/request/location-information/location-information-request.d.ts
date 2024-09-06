import { StageConfig } from '../../types/stage-config';
import { POI_Restriction, RestrictionType } from '../../types/lir-restrictions.type';
import { OJPBaseRequest } from '../base-request';
import { LIR_Response } from '../types/location-information-request.type';
import { Location } from '../../location/location';
import { LocationInformationRequestParams } from './location-information-request-params';
import { Language } from '../../types/language-type';
export declare class LocationInformationRequest extends OJPBaseRequest {
    private requestParams;
    constructor(stageConfig: StageConfig, requestParams: LocationInformationRequestParams);
    static initWithResponseMock(mockText: string): LocationInformationRequest;
    static initWithRequestMock(mockText: string, stageConfig?: StageConfig): LocationInformationRequest;
    static initWithLocationName(stageConfig: StageConfig, language: Language, locationName: string, restrictionTypes: RestrictionType[], limit?: number): LocationInformationRequest;
    static initWithStopPlaceRef(stageConfig: StageConfig, language: Language, stopPlaceRef: string): LocationInformationRequest;
    static initWithCircleLngLatRadius(stageConfig: StageConfig, language: Language, circleLongitude: number, circleLatitude: number, circleRadius: number, restrictionTypes?: RestrictionType[], numberOfResults?: number): LocationInformationRequest;
    static initWithBBOXAndType(stageConfig: StageConfig, language: Language, bboxWest: number, bboxNorth: number, bboxEast: number, bboxSouth: number, restrictionTypes: RestrictionType[], limit?: number, poiRestriction?: POI_Restriction | null): LocationInformationRequest;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<LIR_Response>;
    fetchLocations(): Promise<Location[]>;
}