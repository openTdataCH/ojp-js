import { BaseRequestParams } from '../base-request-params';

export class TripInfoRequestParams extends BaseRequestParams {
    public journeyRef: string
    public operatingDayRef: string

    constructor(journeyRef: string, operatingDayRef: string) {
        super();

        this.journeyRef = journeyRef;
        this.operatingDayRef = operatingDayRef;
    }

    public static Empty(): TripInfoRequestParams {
        const requestParams = new TripInfoRequestParams('n/a', 'n/a');
        return requestParams;
    }

    protected buildRequestNode(): void {
        super.buildRequestNode();

        const dateNowF = new Date().toISOString();
       
        this.serviceRequestNode.ele('siri:RequestTimestamp', dateNowF);
        this.serviceRequestNode.ele("siri:RequestorRef", this.buildRequestorRef());

        const requestNode = this.serviceRequestNode.ele('OJPTripInfoRequest');
        requestNode.ele('siri:RequestTimestamp', dateNowF);

        requestNode.ele('JourneyRef', this.journeyRef);
        requestNode.ele('OperatingDayRef', this.operatingDayRef);

        const paramsNode = requestNode.ele('Params');
        // paramsNode.ele('IncludeCalls', true);
        paramsNode.ele('IncludeService', false);
    }
}
