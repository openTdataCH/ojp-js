var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DEFAULT_STAGE } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { StopEventRequestParams } from './stop-event-request-params';
import { StopEventRequestParser } from './stop-event-request-parser';
export class StopEventRequest extends OJPBaseRequest {
    constructor(stageConfig, requestParams) {
        requestParams.includePreviousCalls = true;
        requestParams.includeOnwardCalls = true;
        super(stageConfig);
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    static Empty() {
        const emptyRequestParams = StopEventRequestParams.Empty();
        const request = new StopEventRequest(DEFAULT_STAGE, emptyRequestParams);
        return request;
    }
    static initWithMock(mockText) {
        const request = StopEventRequest.Empty();
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText) {
        const request = StopEventRequest.Empty();
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithStopPlaceRef(stageConfig, stopPlaceRef, stopEventType, stopEventDate) {
        const stopEventRequestParams = new StopEventRequestParams(stopPlaceRef, null, stopEventType, stopEventDate);
        const stopEventRequest = new StopEventRequest(stageConfig, stopEventRequestParams);
        return stopEventRequest;
    }
    buildRequestXML() {
        return this.requestParams.buildRequestXML();
    }
    fetchResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchOJPResponse();
            const promise = new Promise((resolve) => {
                const response = {
                    stopEvents: [],
                    message: null,
                };
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
        });
    }
}
