import { StageConfig } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { StopEventRequestParams } from './stop-event-request-params';
import { StopEventType } from '../../types/stop-event-type';
import { StopEventRequest_Response } from '../types/stop-event-request.type';
export declare class StopEventRequest extends OJPBaseRequest {
    requestParams: StopEventRequestParams;
    constructor(stageConfig: StageConfig, requestParams: StopEventRequestParams);
    static Empty(stageConfig?: StageConfig): StopEventRequest;
    static initWithMock(mockText: string): StopEventRequest;
    static initWithRequestMock(mockText: string, stageConfig?: StageConfig): StopEventRequest;
    static initWithStopPlaceRef(stageConfig: StageConfig, stopPlaceRef: string, stopEventType: StopEventType, stopEventDate: Date): StopEventRequest;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<StopEventRequest_Response>;
}
