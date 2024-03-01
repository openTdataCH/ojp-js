import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { TripDateType } from "../trips-request/trips-request-params";
export declare class JourneyRequestParams {
    tripLocations: TripLocationPoint[];
    tripModeTypes: TripModeType[];
    transportModes: IndividualTransportMode[];
    depArrDate: Date;
    dateType: TripDateType;
    includeLegProjection: boolean;
    useNumberOfResultsAfter: boolean;
    constructor(tripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], depArrDate: Date, dateType?: TripDateType);
    static initWithLocationsAndDate(fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, viaTripLocations: TripLocationPoint[], tripModeTypes: TripModeType[], transportModes: IndividualTransportMode[], depArrDate: Date, dateType?: TripDateType): JourneyRequestParams | null;
}
