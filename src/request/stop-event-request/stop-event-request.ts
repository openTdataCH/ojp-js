import { EMPTY_API_CONFIG, ApiConfig } from '../../types/stage-config'
import { OJPBaseRequest } from '../base-request'

import { StopEventType } from '../../types/stop-event-type';

import { StopEventRequest_Response } from '../types/stop-event-request.type';
import { StopEventRequestParser } from './stop-event-request-parser';
import { Language } from '../../types/language-type';
import { GeoPosition } from '../../location/geoposition';
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

    protected buildRequestNode(): void {
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
            
            requestPlaceRefNode.ele(ojpPrefix + 'Name').ele(ojpPrefix + 'Text', 'n/a');
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
