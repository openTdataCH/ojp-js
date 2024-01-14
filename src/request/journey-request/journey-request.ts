import { StageConfig } from "../../types/stage-config";
import { JourneySection } from "./journey-section";
import { JourneyResponse } from "./journey-request-response";
import { OJPBaseRequest } from "../base-request";
import { TripRequest, TripRequestEvent } from "../trips-request/trips-request";
import { TripsRequestParams } from "../trips-request/trips-request-params";
import { JourneyRequestParams } from "./journey-request-params";
import { RequestErrorData } from "../request-error";

export type JourneyRequestEvent = 'JourneyRequest.DONE' | TripRequestEvent | 'ERROR';
type JourneyRequestCallback = (response: JourneyResponse, isComplete: boolean, message: JourneyRequestEvent, error: RequestErrorData | null) => void;

export class JourneyRequest extends OJPBaseRequest {
  public requestParams: JourneyRequestParams
  public lastJourneyResponse: JourneyResponse | null

  constructor(stageConfig: StageConfig, requestParams: JourneyRequestParams) {
    super(stageConfig);
    this.requestParams = requestParams;
    this.lastJourneyResponse = null
  }

  public fetchResponse(callback: JourneyRequestCallback) {
    const journeyResponse = new JourneyResponse([])
    const tripDepartureDate = this.requestParams.departureDate
    this.lastJourneyResponse = null
    this.computeTripResponse(0, tripDepartureDate, journeyResponse, callback);
  }

  private computeTripResponse(journeySectionIdx: number, tripDepartureDate: Date, journeyResponse: JourneyResponse, callback: JourneyRequestCallback) {
    const isLastJourneySegment = journeySectionIdx === (this.requestParams.tripModeTypes.length - 1)

    const fromTripLocation = this.requestParams.tripLocations[journeySectionIdx]
    const toTripLocation = this.requestParams.tripLocations[journeySectionIdx + 1]

    const tripRequestParams = TripsRequestParams.initWithLocationsAndDate(fromTripLocation, toTripLocation, tripDepartureDate)
    if (tripRequestParams === null) {
      console.error('JourneyRequest - TripsRequestParams null for trip idx ' + journeySectionIdx)
      return
    }

    tripRequestParams.includeLegProjection = this.requestParams.includeLegProjection
    tripRequestParams.useNumberOfResultsAfter = this.requestParams.useNumberOfResultsAfter
    tripRequestParams.modeType = this.requestParams.tripModeTypes[journeySectionIdx];
    tripRequestParams.transportMode = this.requestParams.transportModes[journeySectionIdx];

    const tripRequest = new TripRequest(this.stageConfig, tripRequestParams);
    tripRequest.fetchResponse((tripsResponse, isComplete, tripsRequestStatus, error) => {
      if (error) {
        callback(journeyResponse, false, 'ERROR', error);
        return;
      }

      const journeySection = new JourneySection(
        tripRequest.lastRequestData,
        tripsResponse
      );
      
      // Reference the current section
      if (journeySectionIdx > (journeyResponse.sections.length - 1)) {
        journeyResponse.sections.push(journeySection);
      }
      journeyResponse.sections[journeySectionIdx] = journeySection;

      if (tripsRequestStatus === 'TripRequest.TripsNo') {
        callback(journeyResponse, false, tripsRequestStatus, error);
      }

      if (tripsRequestStatus === 'TripRequest.Trip') {
        callback(journeyResponse, false, tripsRequestStatus, error);
      }

      if (tripsRequestStatus === 'TripRequest.DONE') {
        const hasTrips = tripsResponse.trips.length > 0;
        if (!hasTrips) {
          console.error('ERROR: no trips found for section ' + journeySectionIdx + ' MODE - ' + tripRequestParams.modeType + ' + ' + tripRequestParams.transportMode);
          console.log(tripsResponse);
          callback(journeyResponse, true, tripsRequestStatus, error);
          return;
        }
  
        if (isLastJourneySegment) {
          this.lastJourneyResponse = journeyResponse;
          callback(journeyResponse, true, tripsRequestStatus, null);
        } else {
          const firstTrip = tripsResponse.trips[0];
          tripDepartureDate = firstTrip.stats.endDatetime;
  
          this.computeTripResponse(journeySectionIdx + 1, tripDepartureDate, journeyResponse, callback);
        }
      }
    });
  }
}
