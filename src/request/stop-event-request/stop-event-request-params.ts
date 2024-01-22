import { GeoPosition } from "../../location/geoposition"
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

    constructor(stopPlaceRef: string | null, geoPosition: GeoPosition | null, stopEventType: StopEventType, stopEventDate: Date) {
        super();

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
        const stopEventRequestParams = new StopEventRequestParams(null, null, 'departure', new Date());
        return stopEventRequestParams;
    }

    protected buildRequestNode(): void {
        super.buildRequestNode();

        const dateNowF = new Date().toISOString();
        const dateF = this.depArrTime.toISOString();
        
        this.serviceRequestNode.ele('siri:RequestTimestamp', dateNowF);

        const requestNode = this.serviceRequestNode.ele('OJPStopEventRequest');
        requestNode.ele('siri:RequestTimestamp', dateNowF);

        const locationNode = requestNode.ele('Location');

        if (this.stopPlaceRef) {
            const requestPlaceRefNode = locationNode.ele('PlaceRef');
            requestPlaceRefNode.ele('StopPlaceRef', this.stopPlaceRef);
            requestPlaceRefNode.ele('LocationName').ele('Text', '');
        }

        locationNode.ele('DepArrTime', dateF);

        const requestParamsNode = requestNode.ele('Params');
        requestParamsNode.ele('NumberOfResults', this.numberOfResults);
        requestParamsNode.ele('StopEventType', this.stopEventType);
        requestParamsNode.ele('IncludePreviousCalls', this.includePreviousCalls);
        requestParamsNode.ele('IncludeOnwardCalls', this.includeOnwardCalls);
        requestParamsNode.ele('IncludeRealtimeData', this.includeRealtimeData);

        const extensionsNode = requestNode.ele('Extensions');
        extensionsNode.ele('ParamsExtension').ele('PrivateModeFilter').ele('Exclude', 'false');
    }
}
