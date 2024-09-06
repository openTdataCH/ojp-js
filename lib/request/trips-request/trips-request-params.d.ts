import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { BaseRequestParams } from "../base-request-params";
import { Location } from "../../location/location";
import { TripRequestBoardingType } from './trips-request';
import { NumberOfResultsType } from "../types/trip-request.type";
import { Language } from "../../types/language-type";
export declare class TripsRequestParams extends BaseRequestParams {
    fromTripLocation: TripLocationPoint;
    toTripLocation: TripLocationPoint;
    departureDate: Date;
    tripRequestBoardingType: TripRequestBoardingType;
    numberOfResultsType: NumberOfResultsType;
    modeType: TripModeType;
    transportMode: IndividualTransportMode;
    includeLegProjection: boolean;
    constructor(language: Language, fromTripLocation: TripLocationPoint, toTripLocation: TripLocationPoint, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType, numberOfResultsType?: NumberOfResultsType);
    static Empty(): TripsRequestParams;
    static initWithLocationsAndDate(language: Language, fromLocation: Location | null, toLocation: Location | null, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType, numberOfResultsType?: NumberOfResultsType): TripsRequestParams | null;
    static initWithTripLocationsAndDate(language: Language, fromTripLocationPoint: TripLocationPoint | null, toTripLocationPoint: TripLocationPoint | null, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType, numberOfResultsType?: NumberOfResultsType): TripsRequestParams | null;
    protected buildRequestNode(): void;
}