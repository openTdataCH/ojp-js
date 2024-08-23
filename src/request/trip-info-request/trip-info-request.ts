import { DEFAULT_STAGE, StageConfig } from '../../types/stage-config'
import { OJPBaseRequest } from '../base-request'

import { TripInfoRequestParams } from './trip-info-request-params';

import { TripInfoRequest_Response } from '../types/trip-info-request.type';
import { TripInfoRequestParser } from './trip-info-request-parser';
import { Language } from '../../types/language-type';

export class TripInfoRequest extends OJPBaseRequest {
    public requestParams: TripInfoRequestParams

    constructor(stageConfig: StageConfig, requestParams: TripInfoRequestParams) {
        super(stageConfig);
        
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }

    public static Empty(stageConfig: StageConfig = DEFAULT_STAGE): TripInfoRequest {
        const emptyRequestParams = TripInfoRequestParams.Empty();
        const request = new TripInfoRequest(stageConfig, emptyRequestParams);

        return request;
    }

    public static initWithMock(mockText: string) {
        const request = TripInfoRequest.Empty();
        request.mockResponseXML = mockText;
        
        return request;
    }

    public static initWithRequestMock(mockText: string, stageConfig: StageConfig = DEFAULT_STAGE) {
        const request = TripInfoRequest.Empty(stageConfig);
        request.mockRequestXML = mockText;
        
        return request;
      }

    public static initWithJourneyRef(stageConfig: StageConfig, language: Language, journeyRef: string, operatingDayRef: string | null = null): TripInfoRequest {
        if (operatingDayRef === null) {
            const dateNowF = new Date().toISOString();
            operatingDayRef = dateNowF.substring(0, 10);
        }
        
        const requestParams = new TripInfoRequestParams(language, journeyRef, operatingDayRef);
        const request = new TripInfoRequest(stageConfig, requestParams);
        
        return request;
    }

    protected buildRequestXML(): string {
        return this.requestParams.buildRequestXML();
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
