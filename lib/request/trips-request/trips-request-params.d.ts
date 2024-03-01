import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { BaseRequestParams } from "../base-request-params";
import { Location } from "../../location/location";
export type TripDateType = 'Departure' | 'Arrival';
export declare class TripsRequestParams extends BaseRequestParams {
    fromTripLocation: TripLocationPoint;
    toTripLocation: TripLocationPoint;
    depArrDate: Date;
    dateType: TripDateType;
    modeType: TripModeType;
    transportMode: IndividualTransportMode;
    includeLegProjection: boolean;
    useNumberOfResultsAfter: boolean;
    constructor(fromTripLocation: TripLocationPoint, toTripLocation: TripLocationPoint, depArrTime: Date, dateType?: TripDateType);
    static Empty(): TripsRequestParams;
    static initWithLocationsAndDate(fromLocation: Location | null, toLocation: Location | null, depArrDate: Date, dateType?: TripDateType): TripsRequestParams | null;
    static initWithTripLocationsAndDate(fromTripLocationPoint: TripLocationPoint | null, toTripLocationPoint: TripLocationPoint | null, departureDate: Date, dateType?: TripDateType): TripsRequestParams | null;
    protected buildRequestNode(): void;
}
