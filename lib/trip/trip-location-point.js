import { Location } from "../location/location";
export class TripLocationPoint {
    constructor(location) {
        this.location = location;
        this.minDuration = 2;
        this.maxDuration = 30;
        this.minDistance = 100;
        this.maxDistance = 20000;
        this.customTransportMode = null;
    }
    static Empty() {
        const location = new Location();
        const locationPoint = new TripLocationPoint(location);
        return locationPoint;
    }
}
