import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { BaseRequestParams } from "../base-request-params";
import { Location } from "../../location/location";
export declare class TripsRequestParams extends BaseRequestParams {
    fromTripLocation: TripLocationPoint;
    toTripLocation: TripLocationPoint;
    departureDate: Date;
    modeType: TripModeType;
    transportMode: IndividualTransportMode;
    includeLegProjection: boolean;
    useNumberOfResultsAfter: boolean;
    constructor(fromTripLocation: TripLocationPoint, toTripLocation: TripLocationPoint, departureDate: Date);
    static Empty(): TripsRequestParams;
    static initWithLocationsAndDate(fromLocation: Location | null, toLocation: Location | null, departureDate: Date): TripsRequestParams | null;
    static initWithTripLocationsAndDate(fromTripLocationPoint: TripLocationPoint | null, toTripLocationPoint: TripLocationPoint | null, departureDate: Date): TripsRequestParams | null;
    protected buildRequestNode(): void;
}
