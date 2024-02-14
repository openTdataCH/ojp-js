import { GeoPosition } from "../../location/geoposition";
import { StopEventType } from "../../types/stop-event-type";
import { BaseRequestParams } from '../base-request-params';
export declare class StopEventRequestParams extends BaseRequestParams {
    stopPlaceRef: string | null;
    geoPosition: GeoPosition | null;
    depArrTime: Date;
    numberOfResults: number;
    stopEventType: StopEventType;
    includePreviousCalls: boolean;
    includeOnwardCalls: boolean;
    includeRealtimeData: boolean;
    constructor(stopPlaceRef: string | null, geoPosition: GeoPosition | null, stopEventType: StopEventType, stopEventDate: Date);
    static Empty(): StopEventRequestParams;
    protected buildRequestNode(): void;
}
