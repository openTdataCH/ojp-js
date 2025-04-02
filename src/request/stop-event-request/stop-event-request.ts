import { EMPTY_API_CONFIG, ApiConfig } from '../../types/stage-config'
import { OJPBaseRequest } from '../base-request'

import { StopEventType } from '../../types/stop-event-type';

import { StopEventRequest_Response } from '../types/stop-event-request.type';
import { StopEventRequestParser } from './stop-event-request-parser';
import { Language } from '../../types/language-type';
import { OJP_Helpers } from '../../helpers/ojp-helpers';
import { GeoPosition } from '../../location/geoposition';
import { OJP_VERSION } from '../../constants';
import { UseRealtimeDataEnumeration } from '../../types/_all';

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
    public useRealTimeDataType: UseRealtimeDataEnumeration;

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
        this.useRealTimeDataType = 'explanatory';
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

    protected buildRequestNode() {
        super.buildRequestNode();

        const dateNowF = new Date().toISOString();
        const dateF = this.depArrTime.toISOString();
    
        this.serviceRequestNode.ele('RequestTimestamp', dateNowF);

        this.serviceRequestNode.ele("RequestorRef", OJP_Helpers.buildRequestorRef());

        const requestNode = this.serviceRequestNode.ele('ojp:OJPStopEventRequest');
        requestNode.ele('RequestTimestamp', dateNowF);

        const locationNode = requestNode.ele('ojp:Location');

        if (this.stopPlaceRef) {
            const requestPlaceRefNode = locationNode.ele('ojp:PlaceRef');
            requestPlaceRefNode.ele('ojp:StopPlaceRef', this.stopPlaceRef);
            requestPlaceRefNode.ele('ojp:LocationName').ele('Text', '');
        }

        locationNode.ele('ojp:DepArrTime', dateF);

        const requestParamsNode = requestNode.ele('ojp:Params');
        requestParamsNode.ele('ojp:NumberOfResults', this.numberOfResults);
        requestParamsNode.ele('ojp:StopEventType', this.stopEventType);
        requestParamsNode.ele('ojp:IncludePreviousCalls', this.includePreviousCalls);
        requestParamsNode.ele('ojp:IncludeOnwardCalls', this.includeOnwardCalls);

        if (OJP_VERSION === '2.0') {
            requestParamsNode.ele('ojp:IncludeRealtimeData', this.includeRealtimeData);
            requestParamsNode.ele("ojp:UseRealtimeData", this.useRealTimeDataType);
        }

        if (this.enableExtensions) {
            const extensionsNode = requestNode.ele('Extensions');
            extensionsNode.ele('ojp:ParamsExtension').ele('ojp:PrivateModeFilter').ele('ojp:Exclude', 'false');
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
