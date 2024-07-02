import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { TripRequestBoardingType } from '../trips-request/trips-request';
export declare class JourneyRequestParams {
    tripLocations: TripLocationPoint[];
    tripModeTypes: TripModeType[];
    transportModes: IndividualTransportMode[];
    departureDate: Date;
    includeLegProjection: boolean;
    useNumberOfResultsAfter: boolean;
    tripRequestBoardingType: TripRequestBoardingType;
    constructor(tripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date, tripRequestBoardingType: TripRequestBoardingType);
    static initWithLocationsAndDate(fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, viaTripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date, tripRequestBoardingType: TripRequestBoardingType): JourneyRequestParams | null;
}
