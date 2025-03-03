import { GeoPosition } from "../../location/geoposition"
import { Language } from "../../types/language-type";
import { StopEventType } from "../../types/stop-event-type"
import { BaseRequestParams } from '../base-request-params';

export class StopEventRequestParams extends BaseRequestParams {
    public stopPlaceRef: string | null
    public geoPosition: GeoPosition | null
    public depArrTime: Date
    public numberOfResults: number
    public stopEventType: StopEventType
    public includePreviousCalls: boolean
    public includeOnwardCalls: boolean
    public includeRealtimeData: boolean

    constructor(language: Language, stopPlaceRef: string | null, geoPosition: GeoPosition | null, stopEventType: StopEventType, stopEventDate: Date) {
        super(language);

        this.stopPlaceRef = stopPlaceRef;
        this.geoPosition = geoPosition;
        this.depArrTime = stopEventDate;
        this.numberOfResults = 10;
        this.stopEventType = stopEventType
        this.includePreviousCalls = false;
        this.includeOnwardCalls = false;
        this.includeRealtimeData = true;
    }

    public static Empty(): StopEventRequestParams {
        const stopEventRequestParams = new StopEventRequestParams('en', null, null, 'departure', new Date());
        return stopEventRequestParams;
    }

    protected buildRequestNode(): void {
        super.buildRequestNode();

        const dateNowF = new Date().toISOString();
        const dateF = this.depArrTime.toISOString();
       
        this.serviceRequestNode.ele('RequestTimestamp', dateNowF);

        this.serviceRequestNode.ele("RequestorRef", BaseRequestParams.buildRequestorRef());

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
        requestParamsNode.ele('ojp:IncludeRealtimeData', this.includeRealtimeData);

        const extensionsNode = requestNode.ele('Extensions');
        extensionsNode.ele('ojp:ParamsExtension').ele('ojp:PrivateModeFilter').ele('ojp:Exclude', 'false');
    }
}
