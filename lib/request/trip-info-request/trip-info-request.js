import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { TripInfoRequestParser } from './trip-info-request-parser';
export class TripInfoRequest extends OJPBaseRequest {
    constructor(stageConfig, language, journeyRef, operatingDayRef) {
        super(stageConfig, language);
        this.journeyRef = journeyRef;
        this.operatingDayRef = operatingDayRef;
    }
    static Empty(stageConfig = EMPTY_API_CONFIG) {
        const request = new TripInfoRequest(stageConfig, 'en', 'n/a', 'n/a');
        return request;
    }
    static initWithMock(mockText) {
        const request = TripInfoRequest.Empty();
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const request = TripInfoRequest.Empty(stageConfig);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithJourneyRef(stageConfig, language, journeyRef, operatingDayRef = null) {
        if (operatingDayRef === null) {
            const dateNowF = new Date().toISOString();
            operatingDayRef = dateNowF.substring(0, 10);
        }
        const request = new TripInfoRequest(stageConfig, language, journeyRef, operatingDayRef);
        return request;
    }
    buildRequestNode() {
        super.buildRequestNode();
        // TODO - use XML_Config, see Trip asXML()
        // console.log(this.xmlConfig);
        const requestNode = this.serviceRequestNode.ele('OJPTripInfoRequest');
        const dateNowF = new Date().toISOString();
        requestNode.ele('siri:RequestTimestamp', dateNowF);
        requestNode.ele('JourneyRef', this.journeyRef);
        requestNode.ele('OperatingDayRef', this.operatingDayRef);
        const paramsNode = requestNode.ele('Params');
        paramsNode.ele('IncludeCalls', true);
        paramsNode.ele('IncludeService', true);
    }
    async fetchResponse() {
        await this.fetchOJPResponse();
        const promise = new Promise((resolve) => {
            const response = {
                tripInfoResult: null,
                message: null,
            };
            if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
                response.message = 'ERROR';
                resolve(response);
                return;
            }
            const parser = new TripInfoRequestParser();
            parser.callback = ({ tripInfoResult, message }) => {
                response.tripInfoResult = tripInfoResult;
                response.message = message;
                if (message === 'TripInfoRequest.DONE') {
                    this.requestInfo.parseDateTime = new Date();
                    resolve(response);
                }
            };
            parser.parseXML(this.requestInfo.responseXML);
        });
        return promise;
    }
}
