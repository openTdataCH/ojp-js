import { EMPTY_API_CONFIG, ApiConfig } from '../../types/stage-config'
import { OJPBaseRequest } from '../base-request'

import { TripInfoRequest_Response } from '../types/trip-info-request.type';
import { TripInfoRequestParser } from './trip-info-request-parser';
import { Language } from '../../types/language-type';
import { OJP_Helpers } from '../../helpers/ojp-helpers';

export class TripInfoRequest extends OJPBaseRequest {
    public journeyRef: string;
    public operatingDayRef: string;

    constructor(stageConfig: ApiConfig, language: Language, journeyRef: string, operatingDayRef: string) {
        super(stageConfig, language);

        this.journeyRef = journeyRef;
        this.operatingDayRef = operatingDayRef;
    }

    public static Empty(stageConfig: ApiConfig = EMPTY_API_CONFIG): TripInfoRequest {
        const request = new TripInfoRequest(stageConfig, 'en', 'n/a', 'n/a');

        return request;
    }

    public static initWithMock(mockText: string) {
        const request = TripInfoRequest.Empty();
        request.mockResponseXML = mockText;
        
        return request;
    }

    public static initWithRequestMock(mockText: string, stageConfig: ApiConfig = EMPTY_API_CONFIG) {
        const request = TripInfoRequest.Empty(stageConfig);
        request.mockRequestXML = mockText;
        
        return request;
      }

    public static initWithJourneyRef(stageConfig: ApiConfig, language: Language, journeyRef: string, operatingDayRef: string | null = null): TripInfoRequest {
        if (operatingDayRef === null) {
            const dateNowF = new Date().toISOString();
            operatingDayRef = dateNowF.substring(0, 10);
        }
        
        const request = new TripInfoRequest(stageConfig, language, journeyRef, operatingDayRef);
        
        return request;
    }

    protected buildRequestNode(): void {
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

    public async fetchResponse(): Promise<TripInfoRequest_Response> {
        await this.fetchOJPResponse();

        const promise = new Promise<TripInfoRequest_Response>((resolve) => {
            

            const response: TripInfoRequest_Response = {
                tripInfoResult: null,
                message: null,
            }

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
