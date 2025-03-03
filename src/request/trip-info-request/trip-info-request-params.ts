import { Language } from '../../types/language-type';
import { BaseRequestParams } from '../base-request-params';

export class TripInfoRequestParams extends BaseRequestParams {
    public journeyRef: string
    public operatingDayRef: string

    constructor(language: Language, journeyRef: string, operatingDayRef: string) {
        super(language);

        this.journeyRef = journeyRef;
        this.operatingDayRef = operatingDayRef;
    }

    public static Empty(): TripInfoRequestParams {
        const requestParams = new TripInfoRequestParams('en', 'n/a', 'n/a');
        return requestParams;
    }

    protected buildRequestNode(): void {
        super.buildRequestNode();

        const dateNowF = new Date().toISOString();
       
        this.serviceRequestNode.ele('RequestTimestamp', dateNowF);
        this.serviceRequestNode.ele("RequestorRef", BaseRequestParams.buildRequestorRef());

        const requestNode = this.serviceRequestNode.ele('ojp:OJPTripInfoRequest');
        requestNode.ele('RequestTimestamp', dateNowF);

        requestNode.ele('ojp:JourneyRef', this.journeyRef);
        requestNode.ele('ojp:OperatingDayRef', this.operatingDayRef);

        const paramsNode = requestNode.ele('ojp:Params');
        paramsNode.ele('ojp:IncludeCalls', true);
        paramsNode.ele('ojp:IncludeService', true);
    }
}
