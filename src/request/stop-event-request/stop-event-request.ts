import { DEFAULT_STAGE, StageConfig } from '../../types/stage-config'
import { OJPBaseRequest } from '../base-request'

import { StopEventRequestParams } from './stop-event-request-params';
import { StopEventType } from '../../types/stop-event-type';

import { StopEventRequest_Response } from '../types/stop-event-request.type';
import { StopEventRequestParser } from './stop-event-request-parser';

export class StopEventRequest extends OJPBaseRequest {
    public requestParams: StopEventRequestParams

    constructor(stageConfig: StageConfig, requestParams: StopEventRequestParams) {
        requestParams.includePreviousCalls = true;
        requestParams.includeOnwardCalls = true;

        super(stageConfig);
        
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }

    public static Empty(): StopEventRequest {
        const emptyRequestParams = StopEventRequestParams.Empty();
        const request = new StopEventRequest(DEFAULT_STAGE, emptyRequestParams);

        return request;
    }

    public static initWithMock(mockText: string) {
        const request = StopEventRequest.Empty();
        request.mockResponseXML = mockText;
        
        return request;
    }

    public static initWithRequestMock(mockText: string) {
        const request = StopEventRequest.Empty();
        request.mockRequestXML = mockText;
        
        return request;
      }

    public static initWithStopPlaceRef(stageConfig: StageConfig, stopPlaceRef: string, stopEventType: StopEventType, stopEventDate: Date): StopEventRequest {
        const stopEventRequestParams = new StopEventRequestParams(stopPlaceRef, null, stopEventType, stopEventDate);
        const stopEventRequest = new StopEventRequest(stageConfig, stopEventRequestParams);
        return stopEventRequest;
    }

    protected buildRequestXML(): string {
        return this.requestParams.buildRequestXML();
    }

    public async fetchResponse(): Promise<StopEventRequest_Response> {
        await this.fetchOJPResponse();

        const promise = new Promise<StopEventRequest_Response>((resolve) => {
            const response: StopEventRequest_Response = {
                stopEvents: [],
                message: null,
            }

            if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
                response.message = 'ERROR';
                resolve(response);
                return;
            }

            const parser = new StopEventRequestParser();
            parser.callback = ({ stopEvents, message }) => {
                response.stopEvents = stopEvents;
                response.message = message;

                if (message === 'StopEvent.DONE') {
                    this.requestInfo.parseDateTime = new Date();
                    resolve(response);
                }
            };
            parser.parseXML(this.requestInfo.responseXML);
        });

        return promise;
    }
}
