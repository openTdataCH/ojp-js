import { Location } from "../location/location";
import { IndividualTransportMode } from "../types/individual-mode.types";
export declare class TripLocationPoint {
    location: Location;
    minDuration: number;
    maxDuration: number;
    minDistance: number;
    maxDistance: number;
    customTransportMode?: IndividualTransportMode | null;
    constructor(location: Location);
    static Empty(): TripLocationPoint;
}
