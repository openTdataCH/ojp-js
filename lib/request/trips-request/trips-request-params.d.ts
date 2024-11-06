import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { BaseRequestParams } from "../base-request-params";
import { Location } from "../../location/location";
import { TripRequestBoardingType } from './trips-request';
import { NumberOfResultsType } from "../types/trip-request.type";
import { Language } from "../../types/language-type";
import { ModeOfTransportType } from "../../types/mode-of-transport.type";
export declare class TripsRequestParams extends BaseRequestParams {
    fromTripLocation: TripLocationPoint;
    toTripLocation: TripLocationPoint;
    departureDate: Date;
    tripRequestBoardingType: TripRequestBoardingType;
    numberOfResultsType: NumberOfResultsType;
    numberOfResults: number | null;
    publicTransportModes: ModeOfTransportType[];
    modeType: TripModeType;
    transportMode: IndividualTransportMode;
    includeLegProjection: boolean;
    viaLocations: TripLocationPoint[];
    constructor(language: Language, fromTripLocation: TripLocationPoint, toTripLocation: TripLocationPoint, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType, numberOfResultsType?: NumberOfResultsType, numberOfResults?: number | null, publicTransportModes?: ModeOfTransportType[]);
    static Empty(): TripsRequestParams;
    static initWithLocationsAndDate(language: Language, fromLocation: Location | null, toLocation: Location | null, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType, numberOfResultsType?: NumberOfResultsType, includeLegProjection?: boolean, modeType?: TripModeType, transportMode?: IndividualTransportMode, viaTripLocations?: TripLocationPoint[], numberOfResults?: number | null): TripsRequestParams | null;
    static initWithTripLocationsAndDate(language: Language, fromTripLocationPoint: TripLocationPoint | null, toTripLocationPoint: TripLocationPoint | null, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType, numberOfResultsType?: NumberOfResultsType, includeLegProjection?: boolean, modeType?: TripModeType, transportMode?: IndividualTransportMode, viaTripLocations?: TripLocationPoint[], numberOfResults?: number | null, publicTransportModes?: ModeOfTransportType[]): TripsRequestParams | null;
    protected buildRequestNode(): void;
    private addAdditionalRestrictions;
}
