import { StageConfig } from '../../types/stage-config'
import { OJPBaseRequest } from '../base-request'
import { StopEvent } from '../../stop-event/stop-event';

import { StopEventRequestParams } from './stop-event-request-params';
import { StopEventType } from '../../types/stop-event-type';

import { StopEventResponse } from './stop-event-response';

export class StopEventRequest extends OJPBaseRequest {
    public requestParams: StopEventRequestParams

    constructor(stageConfig: StageConfig, requestParams: StopEventRequestParams) {
        requestParams.includePreviousCalls = true;
        requestParams.includeOnwardCalls = true;

        super(stageConfig);
        
        this.requestParams = requestParams;
    }

    public static initWithStopPlaceRef(stageConfig: StageConfig, stopPlaceRef: string, stopEventType: StopEventType, stopEventDate: Date): StopEventRequest {
        const stopEventRequestParams = new StopEventRequestParams(stopPlaceRef, null, stopEventType, stopEventDate);
        const stopEventRequest = new StopEventRequest(stageConfig, stopEventRequestParams);
        return stopEventRequest;
    }

    public fetchResponse(): Promise<StopEvent[]> {
        const loadingPromise = new Promise<StopEvent[]>(resolve => {
            const bodyXML_s = this.requestParams.buildRequestXML(this.serviceRequestNode);
            super.fetchOJPResponse(bodyXML_s, (responseText, errorData) => {
                if (errorData) {
                    console.error('ERROR: StopEventRequest network');
                    console.log(errorData);
                    resolve([]);
                    return;
                }

                const stopEventResponse = new StopEventResponse();
                stopEventResponse.parseXML(responseText, (message) => {
                    if (message === 'StopEvent.DONE') {
                        resolve(stopEventResponse.stopEvents);
                    } else {
                        console.error('ERROR: StopEventRequest parse XML');
                        console.log(errorData);
                        console.log(responseText);
                        resolve([]);
                        return;
                    }
                })
            });
        });

        return loadingPromise;
    }

    public computeRequestXmlString(): string {
        const bodyXML_s = this.requestParams.buildRequestXML(this.serviceRequestNode);
        return bodyXML_s;
    }
}
