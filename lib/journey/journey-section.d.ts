import { RequestData } from "../request";
import { TripsResponse } from "../trips/trips-response";
export declare class JourneySection {
    requestData: RequestData;
    response: TripsResponse;
    constructor(requestData: RequestData, response: TripsResponse);
}
