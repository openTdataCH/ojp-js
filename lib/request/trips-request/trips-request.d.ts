import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { StageConfig } from '../../types/stage-config';
import { TripRequest_Response, TripRequest_Callback } from '../types/trip-request.type';
import { TripLocationPoint } from '../../trip';
import { Location } from '../../location/location';
export type TripRequestBoardingType = 'Dep' | 'Arr';
export declare class TripRequest extends OJPBaseRequest {
    private requestParams;
    constructor(stageConfig: StageConfig, requestParams: TripsRequestParams);
    static initWithResponseMock(mockText: string): TripRequest;
    static initWithRequestMock(mockText: string): TripRequest;
    static initWithLocationsAndDate(stageConfig: StageConfig, fromLocation: Location, toLocation: Location, departureDate: Date): TripRequest | null;
    static initWithTripLocationsAndDate(stageConfig: StageConfig, fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, departureDate: Date): TripRequest | null;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<TripRequest_Response>;
    fetchResponseWithCallback(callback: TripRequest_Callback): void;
    private parseTripRequestResponse;
    private sortTrips;
}
