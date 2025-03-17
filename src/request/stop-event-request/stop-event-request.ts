import { EMPTY_API_CONFIG, ApiConfig } from '../../types/stage-config'
import { OJPBaseRequest } from '../base-request'

import { StopEventType } from '../../types/stop-event-type';

import { StopEventRequest_Response } from '../types/stop-event-request.type';
import { StopEventRequestParser } from './stop-event-request-parser';
import { Language } from '../../types/language-type';
import { OJP_Helpers } from '../../helpers/ojp-helpers';
import { GeoPosition } from '../../location/geoposition';

export class StopEventRequest extends OJPBaseRequest {
    public stopPlaceRef: string | null;
    public geoPosition: GeoPosition | null;
    
    public depArrTime: Date;
    public numberOfResults: number;
    
    public stopEventType: StopEventType;

    public includePreviousCalls: boolean;
    public includeOnwardCalls: boolean;
    public includeRealtimeData: boolean;
    
    public enableExtensions: boolean;

    constructor(stageConfig: ApiConfig, language: Language, stopPlaceRef: string | null, geoPosition: GeoPosition | null, stopEventType: StopEventType, stopEventDate: Date) {
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
    }

    public static Empty(stageConfig: ApiConfig = EMPTY_API_CONFIG): StopEventRequest {
        const request = new StopEventRequest(stageConfig, 'en', null, null, 'departure', new Date());

        return request;
    }

    public static initWithMock(mockText: string) {
        const request = StopEventRequest.Empty();
        request.mockResponseXML = mockText;
        
        return request;
    }

    public static initWithRequestMock(mockText: string, stageConfig: ApiConfig = EMPTY_API_CONFIG) {
        const request = StopEventRequest.Empty(stageConfig);
        request.mockRequestXML = mockText;
        
        return request;
      }

    public static initWithStopPlaceRef(stageConfig: ApiConfig, language: Language, stopPlaceRef: string, stopEventType: StopEventType, stopEventDate: Date): StopEventRequest {
        const stopEventRequest = new StopEventRequest(stageConfig, language, stopPlaceRef, null, stopEventType, stopEventDate);
        
        return stopEventRequest;
    }

    protected buildRequestNode(): void {
        super.buildRequestNode();

        const dateNowF = new Date().toISOString();
        const dateF = this.depArrTime.toISOString();
       
        this.serviceRequestNode.ele('siri:RequestTimestamp', dateNowF);

        this.serviceRequestNode.ele("siri:RequestorRef", OJP_Helpers.buildRequestorRef());

        const requestNode = this.serviceRequestNode.ele('OJPStopEventRequest');
        requestNode.ele('siri:RequestTimestamp', dateNowF);

        const locationNode = requestNode.ele('Location');

        if (this.stopPlaceRef) {
            const requestPlaceRefNode = locationNode.ele('PlaceRef');
            requestPlaceRefNode.ele('siri:StopPointRef', this.stopPlaceRef);
            requestPlaceRefNode.ele('Name').ele('Text', 'n/a');
        }

        locationNode.ele('DepArrTime', dateF);

        const requestParamsNode = requestNode.ele('Params');

        requestParamsNode.ele('IncludeAllRestrictedLines', true);
        requestParamsNode.ele('NumberOfResults', this.numberOfResults);
        requestParamsNode.ele('StopEventType', this.stopEventType);
        requestParamsNode.ele('IncludePreviousCalls', this.includePreviousCalls);
        requestParamsNode.ele('IncludeOnwardCalls', this.includeOnwardCalls);
        requestParamsNode.ele('IncludeRealtimeData', this.includeRealtimeData);

        if (this.enableExtensions) {
            const extensionsNode = requestNode.ele('siri:Extensions');
            extensionsNode.ele('ParamsExtension').ele('PrivateModeFilter').ele('Exclude', 'false');
        }
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
