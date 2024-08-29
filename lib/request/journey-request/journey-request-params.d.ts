import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { Language } from "../../types/language-type";
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
    language: Language;
    constructor(language: Language, tripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date, tripRequestBoardingType: TripRequestBoardingType, numberOfResultsType: NumberOfResultsType);
    static initWithLocationsAndDate(language: Language, fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, viaTripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date, tripRequestBoardingType: TripRequestBoardingType, numberOfResultsType: NumberOfResultsType): JourneyRequestParams | null;
}
