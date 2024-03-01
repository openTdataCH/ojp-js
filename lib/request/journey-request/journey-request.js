import { TripRequest } from "../trips-request/trips-request";
import { TripsRequestParams } from "../trips-request/trips-request-params";
export class JourneyRequest {
    constructor(stageConfig, requestParams) {
        this.stageConfig = stageConfig;
        this.requestParams = requestParams;
        this.tripRequests = [];
        this.sections = [];
    }
    fetchResponse(callback) {
        this.tripRequests = [];
        this.computeTripResponse(0, this.requestParams.depArrDate, this.requestParams.dateType, callback);
    }
    computeTripResponse(journeyIDx, depArrDate, dateType, callback) {
        const isLastJourneySegment = journeyIDx === (this.requestParams.tripModeTypes.length - 1);
        const fromTripLocation = this.requestParams.tripLocations[journeyIDx];
        const toTripLocation = this.requestParams.tripLocations[journeyIDx + 1];
        const tripRequestParams = TripsRequestParams.initWithTripLocationsAndDate(fromTripLocation, toTripLocation, depArrDate, dateType);
        if (tripRequestParams === null) {
            console.error('JourneyRequest - TripsRequestParams null for trip idx ' + journeyIDx);
            return;
        }
        tripRequestParams.includeLegProjection = this.requestParams.includeLegProjection;
        tripRequestParams.useNumberOfResultsAfter = this.requestParams.useNumberOfResultsAfter;
        tripRequestParams.modeType = this.requestParams.tripModeTypes[journeyIDx];
        tripRequestParams.transportMode = this.requestParams.transportModes[journeyIDx];
        tripRequestParams.dateType = this.requestParams.dateType;
        const tripRequest = new TripRequest(this.stageConfig, tripRequestParams);
        this.tripRequests.push(tripRequest);
        tripRequest.fetchResponseWithCallback((tripRequestResponse) => {
            if (tripRequestResponse.message === 'ERROR') {
                callback({
                    sections: this.sections,
                    message: 'ERROR',
                    error: {
                        error: 'ParseTripsXMLError',
                        message: 'TODO - handle this'
                    },
                });
                return;
            }
            // the callback is triggered several times
            // => make sure we push to .sections array only once
            if (journeyIDx > (this.sections.length - 1)) {
                this.sections.push(tripRequestResponse);
            }
            // override current section
            this.sections[journeyIDx] = tripRequestResponse;
            if (tripRequestResponse.message === 'TripRequest.TripsNo' || tripRequestResponse.message === 'TripRequest.Trip') {
                callback({
                    sections: this.sections,
                    message: tripRequestResponse.message,
                    error: null
                });
            }
            if (tripRequestResponse.message === 'TripRequest.DONE') {
                const hasTrips = tripRequestResponse.trips.length > 0;
                if (!hasTrips) {
                    callback({
                        sections: this.sections,
                        message: 'JourneyRequest.DONE',
                        error: null
                    });
                    return;
                }
                if (isLastJourneySegment) {
                    callback({
                        sections: this.sections,
                        message: 'JourneyRequest.DONE',
                        error: null
                    });
                }
                else {
                    const firstTrip = tripRequestResponse.trips[0];
                    depArrDate = firstTrip.stats.endDatetime;
                    this.computeTripResponse(journeyIDx + 1, depArrDate, dateType, callback);
                }
            }
        });
    }
}
