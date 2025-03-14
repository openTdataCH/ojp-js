import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { TripInfoRequestParser } from './trip-info-request-parser';
import { OJP_Helpers } from '../../helpers/ojp-helpers';
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
        const dateNowF = new Date().toISOString();
        this.serviceRequestNode.ele('RequestTimestamp', dateNowF);
        this.serviceRequestNode.ele("RequestorRef", OJP_Helpers.buildRequestorRef());
        const requestNode = this.serviceRequestNode.ele('ojp:OJPTripInfoRequest');
        requestNode.ele('RequestTimestamp', dateNowF);
        requestNode.ele('ojp:JourneyRef', this.journeyRef);
        requestNode.ele('ojp:OperatingDayRef', this.operatingDayRef);
        const paramsNode = requestNode.ele('ojp:Params');
        paramsNode.ele('ojp:IncludeCalls', true);
        paramsNode.ele('ojp:IncludeService', true);
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
