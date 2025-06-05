import { ApiConfig } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { StopEventType } from '../../types/stop-event-type';
import { StopEventRequest_Response } from '../types/stop-event-request.type';
import { Language } from '../../types/language-type';
import { GeoPosition } from '../../location/geoposition';
import { UseRealtimeDataEnumeration, XML_Config } from '../../types/_all';
export declare class StopEventRequest extends OJPBaseRequest {
    stopPlaceRef: string | null;
    geoPosition: GeoPosition | null;
    depArrTime: Date;
    numberOfResults: number;
    stopEventType: StopEventType;
    includePreviousCalls: boolean;
    includeOnwardCalls: boolean;
    includeRealtimeData: boolean;
    enableExtensions: boolean;
    useRealTimeDataType: UseRealtimeDataEnumeration;
    constructor(stageConfig: ApiConfig, language: Language, xmlConfig: XML_Config, requestorRef: string, stopPlaceRef: string | null, geoPosition: GeoPosition | null, stopEventType: StopEventType, stopEventDate: Date);
    static Empty(stageConfig: ApiConfig, xmlConfig: XML_Config, requestorRef: string): StopEventRequest;
    static initWithMock(mockText: string, xmlConfig: XML_Config, requestorRef: string): StopEventRequest;
    static initWithRequestMock(mockText: string, stageConfig: ApiConfig, xmlConfig: XML_Config, requestorRef: string): StopEventRequest;
    static initWithStopPlaceRef(stageConfig: ApiConfig, language: Language, xmlConfig: XML_Config, requestorRef: string, stopPlaceRef: string, stopEventType: StopEventType, stopEventDate: Date): StopEventRequest;
    protected buildRequestNode(): void;
    fetchResponse(): Promise<StopEventRequest_Response>;
}
