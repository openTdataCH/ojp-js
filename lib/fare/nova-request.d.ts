import { RequestInfo } from "../request";
import { Trip } from "../trip";
import { NovaFare_Response } from "./nova-request-parser";
export declare class NovaRequest {
    requestInfo: RequestInfo;
    constructor();
    fetchResponseForTrips(trips: Trip[]): Promise<NovaFare_Response>;
    private buildServiceRequestNode;
    private addTripToServiceRequestNode;
    private fetchResponse;
}
