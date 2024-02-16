import { Trip } from '../trip/trip';
import { TripRequestEvent, TripsRequestParams } from '../request';
export declare class TripsResponse {
    hasValidResponse: boolean;
    trips: Trip[];
    parserTripsNo: number;
    tripRequestParams: TripsRequestParams | null;
    constructor();
    parseXML(responseXMLText: string, callback: (message: TripRequestEvent, isComplete: boolean) => void): void;
    private static sortTrips;
}
