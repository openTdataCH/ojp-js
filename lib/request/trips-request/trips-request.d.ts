import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { StageConfig } from '../../types/stage-config';
import { TripRequest_Response, TripRequest_Callback, NumberOfResultsType } from '../types/trip-request.type';
import { TripLocationPoint } from '../../trip';
import { Location } from '../../location/location';
import { Language } from '../../types/language-type';
export type TripRequestBoardingType = 'Dep' | 'Arr';
export declare class TripRequest extends OJPBaseRequest {
    private requestParams;
    response: TripRequest_Response | null;
    constructor(stageConfig: StageConfig, requestParams: TripsRequestParams);
    static initWithResponseMock(mockText: string): TripRequest;
    static initWithRequestMock(mockText: string, stageConfig?: StageConfig): TripRequest;
    static initWithStopRefs(stageConfig: StageConfig, language: Language, fromStopRef: string, toStopRef: string, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType): TripRequest | null;
    static initWithLocationsAndDate(stageConfig: StageConfig, language: Language, fromLocation: Location, toLocation: Location, departureDate: Date, tripRequestBoardingType?: TripRequestBoardingType): TripRequest | null;
    static initWithTripLocationsAndDate(stageConfig: StageConfig, language: Language, fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, departureDate: Date, tripRequestBoardingType?: TripRequestBoardingType, numberOfResultsType?: NumberOfResultsType): TripRequest | null;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<TripRequest_Response>;
    fetchResponseWithCallback(callback: TripRequest_Callback): void;
    private parseTripRequestResponse;
}
