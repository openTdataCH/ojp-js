import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
export declare class JourneyRequestParams {
    tripLocations: TripLocationPoint[];
    tripModeTypes: TripModeType[];
    transportModes: IndividualTransportMode[];
    departureDate: Date;
    includeLegProjection: boolean;
    useNumberOfResultsAfter: boolean;
    constructor(tripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date);
    static initWithLocationsAndDate(fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, viaTripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], departureDate: Date): JourneyRequestParams | null;
}
