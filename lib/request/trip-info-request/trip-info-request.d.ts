import { ApiConfig } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { TripInfoRequest_Response } from '../types/trip-info-request.type';
import { Language } from '../../types/language-type';
export declare class TripInfoRequest extends OJPBaseRequest {
    journeyRef: string;
    operatingDayRef: string;
    constructor(stageConfig: ApiConfig, language: Language, journeyRef: string, operatingDayRef: string);
    static Empty(stageConfig?: ApiConfig): TripInfoRequest;
    static initWithMock(mockText: string): TripInfoRequest;
    static initWithRequestMock(mockText: string, stageConfig?: ApiConfig): TripInfoRequest;
    static initWithJourneyRef(stageConfig: ApiConfig, language: Language, journeyRef: string, operatingDayRef?: string | null): TripInfoRequest;
    protected buildRequestNode(): void;
    fetchResponse(): Promise<TripInfoRequest_Response>;
}
