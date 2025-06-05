import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { StopEventRequestParser } from './stop-event-request-parser';
export class StopEventRequest extends OJPBaseRequest {
    constructor(stageConfig, language, xmlConfig, requestorRef, stopPlaceRef, geoPosition, stopEventType, stopEventDate) {
        super(stageConfig, language, xmlConfig, requestorRef);
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
    static Empty(stageConfig, xmlConfig, requestorRef) {
        const request = new StopEventRequest(stageConfig, 'en', xmlConfig, requestorRef, null, null, 'departure', new Date());
        return request;
    }
    static initWithMock(mockText, xmlConfig, requestorRef) {
        const request = StopEventRequest.Empty(EMPTY_API_CONFIG, xmlConfig, requestorRef);
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig, xmlConfig, requestorRef) {
        const request = StopEventRequest.Empty(stageConfig, xmlConfig, requestorRef);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithStopPlaceRef(stageConfig, language, xmlConfig, requestorRef, stopPlaceRef, stopEventType, stopEventDate) {
        const stopEventRequest = new StopEventRequest(stageConfig, language, xmlConfig, requestorRef, stopPlaceRef, null, stopEventType, stopEventDate);
        return stopEventRequest;
    }
    buildRequestNode() {
        super.buildRequestNode();
        const siriPrefix = this.xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const ojpPrefix = this.xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const isOJPv2 = this.xmlConfig.ojpVersion === '2.0';
        const dateNowF = new Date().toISOString();
        const requestNode = this.serviceRequestNode.ele(ojpPrefix + 'OJPStopEventRequest');
        requestNode.ele(siriPrefix + 'RequestTimestamp', dateNowF);
        const locationNode = requestNode.ele(ojpPrefix + 'Location');
        if (this.stopPlaceRef) {
            const requestPlaceRefNode = locationNode.ele(ojpPrefix + "PlaceRef");
            const stopPointRefNode = isOJPv2 ? (siriPrefix + 'StopPointRef') : (ojpPrefix + 'StopPlaceRef');
            requestPlaceRefNode.ele(stopPointRefNode, this.stopPlaceRef);
            const nameTag = isOJPv2 ? 'Name' : 'LocationName';
            requestPlaceRefNode.ele(ojpPrefix + nameTag).ele(ojpPrefix + 'Text', 'n/a');
        }
        const dateF = this.depArrTime.toISOString();
        locationNode.ele(ojpPrefix + 'DepArrTime', dateF);
        const requestParamsNode = requestNode.ele(ojpPrefix + 'Params');
        requestParamsNode.ele(ojpPrefix + 'IncludeAllRestrictedLines', true);
        requestParamsNode.ele(ojpPrefix + 'NumberOfResults', this.numberOfResults);
        requestParamsNode.ele(ojpPrefix + 'StopEventType', this.stopEventType);
        requestParamsNode.ele(ojpPrefix + 'IncludePreviousCalls', this.includePreviousCalls);
        requestParamsNode.ele(ojpPrefix + 'IncludeOnwardCalls', this.includeOnwardCalls);
        if (isOJPv2) {
            requestParamsNode.ele(ojpPrefix + 'IncludeRealtimeData', this.includeRealtimeData);
            requestParamsNode.ele(ojpPrefix + "UseRealtimeData", this.useRealTimeDataType);
        }
        if (this.enableExtensions) {
            const extensionsNode = requestNode.ele(siriPrefix + 'Extensions');
            extensionsNode.ele(ojpPrefix + 'ParamsExtension').ele(ojpPrefix + 'PrivateModeFilter').ele(ojpPrefix + 'Exclude', 'false');
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
            const parser = new StopEventRequestParser(this.xmlConfig);
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
