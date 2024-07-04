import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { TripRequestBoardingType } from '../trips-request/trips-request';
import { NumberOfResultsType } from "../types/trip-request.type";
export declare class JourneyRequestParams {
    tripLocations: TripLocationPoint[];
    tripModeTypes: TripModeType[];
    transportModes: IndividualTransportMode[];
    departureDate: Date;
    includeLegProjection: boolean;
    tripRequestBoardingType: TripRequestBoardingType;
    numberOfResultsType: NumberOfResultsType;
    constructor(tripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date, tripRequestBoardingType: TripRequestBoardingType, numberOfResultsType: NumberOfResultsType);
    static initWithLocationsAndDate(fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, viaTripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date, tripRequestBoardingType: TripRequestBoardingType, numberOfResultsType: NumberOfResultsType): JourneyRequestParams | null;
}
