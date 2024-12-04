import { StageConfig } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { TripInfoRequestParams } from './trip-info-request-params';
import { TripInfoRequest_Response } from '../types/trip-info-request.type';
import { Language } from '../../types/language-type';
export declare class TripInfoRequest extends OJPBaseRequest {
    requestParams: TripInfoRequestParams;
    constructor(stageConfig: StageConfig, requestParams: TripInfoRequestParams);
    static Empty(stageConfig?: StageConfig): TripInfoRequest;
    static initWithMock(mockText: string): TripInfoRequest;
    static initWithRequestMock(mockText: string, stageConfig?: StageConfig): TripInfoRequest;
    static initWithJourneyRef(stageConfig: StageConfig, language: Language, journeyRef: string, operatingDayRef?: string | null): TripInfoRequest;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<TripInfoRequest_Response>;
}
