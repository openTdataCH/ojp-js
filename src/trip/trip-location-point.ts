import { Location } from "../location/location"
import { IndividualTransportMode } from "../types/individual-mode.types"

export class TripLocationPoint {
    public location: Location;
    public minDuration: number | null;
    public maxDuration: number | null;
    public minDistance: number | null;
    public maxDistance: number | null;

    public customTransportMode?: IndividualTransportMode | null

    public dwellTimeMinutes: number | null

    constructor(location: Location) {
        this.location = location;
        this.minDuration = null;
        this.maxDuration = null;
        this.minDistance = null;
        this.maxDistance = null;
        this.customTransportMode = null;
        this.dwellTimeMinutes = null;
    }

    public static Empty(): TripLocationPoint {
        const location = new Location();
        const locationPoint = new TripLocationPoint(location);
        return locationPoint;
    }
}