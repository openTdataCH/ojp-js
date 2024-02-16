import { Trip } from "../trip";
import { JourneySection } from "./journey-section";
export declare class JourneyResponse {
    sections: JourneySection[];
    constructor(sections: JourneySection[]);
    computeAggregatedTrips(): Trip[];
    private computeFirstValidTrip;
}
