import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { StopEventRequestParser } from './stop-event-request-parser';
import { OJP_VERSION } from '../../constants';
export class StopEventRequest extends OJPBaseRequest {
    constructor(stageConfig, language, stopPlaceRef, geoPosition, stopEventType, stopEventDate) {
        super(stageConfig, language);
        this.stopPlaceRef = stopPlaceRef;
        this.geoPosition = geoPosition;
        this.depArrTime = stopEventDate;
        this.numberOfResults = 10;
        this.stopEventType = stopEventType;
        this.includePreviousCalls = true;
        this.includeOnwardCalls = true;
        this.includeRealtimeData = true;
        this.enableExtensions = true;
        this.useRealTimeDataType = 'explanatory';
    }
    static Empty(stageConfig = EMPTY_API_CONFIG) {
        const request = new StopEventRequest(stageConfig, 'en', null, null, 'departure', new Date());
        return request;
    }
    static initWithMock(mockText) {
        const request = StopEventRequest.Empty();
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const request = StopEventRequest.Empty(stageConfig);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithStopPlaceRef(stageConfig, language, stopPlaceRef, stopEventType, stopEventDate) {
        const stopEventRequest = new StopEventRequest(stageConfig, language, stopPlaceRef, null, stopEventType, stopEventDate);
        return stopEventRequest;
    }
    buildRequestNode() {
        super.buildRequestNode();
        // TODO - use XML_Config, see Trip asXML()
        // console.log(this.xmlConfig);
        const dateNowF = new Date().toISOString();
        const requestNode = this.serviceRequestNode.ele('OJPStopEventRequest');
        requestNode.ele('siri:RequestTimestamp', dateNowF);
        const locationNode = requestNode.ele('Location');
        if (this.stopPlaceRef) {
            const requestPlaceRefNode = locationNode.ele('PlaceRef');
            requestPlaceRefNode.ele('siri:StopPointRef', this.stopPlaceRef);
            requestPlaceRefNode.ele('Name').ele('Text', 'n/a');
        }
        const dateF = this.depArrTime.toISOString();
        locationNode.ele('DepArrTime', dateF);
        const requestParamsNode = requestNode.ele('Params');
        requestParamsNode.ele('IncludeAllRestrictedLines', true);
        requestParamsNode.ele('NumberOfResults', this.numberOfResults);
        requestParamsNode.ele('StopEventType', this.stopEventType);
        requestParamsNode.ele('IncludePreviousCalls', this.includePreviousCalls);
        requestParamsNode.ele('IncludeOnwardCalls', this.includeOnwardCalls);
        if (OJP_VERSION === '2.0') {
            requestParamsNode.ele('IncludeRealtimeData', this.includeRealtimeData);
            requestParamsNode.ele("UseRealtimeData", this.useRealTimeDataType);
        }
        if (this.enableExtensions) {
            const extensionsNode = requestNode.ele('siri:Extensions');
            extensionsNode.ele('ParamsExtension').ele('PrivateModeFilter').ele('Exclude', 'false');
        }
    }
    async fetchResponse() {
        await this.fetchOJPResponse();
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
    }
}
