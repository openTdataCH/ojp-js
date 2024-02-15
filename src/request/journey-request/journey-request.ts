import { StageConfig } from "../../types/stage-config";
import { TripRequest } from "../trips-request/trips-request";
import { TripsRequestParams } from "../trips-request/trips-request-params";
import { JourneyRequestParams } from "./journey-request-params";
import { RequestErrorData } from "../types/request-info.type";
import { TripRequest_ParserMessage, TripRequest_Response } from "../types/trip-request.type";

export type JourneyRequest_Message = 'JourneyRequest.DONE' | TripRequest_ParserMessage | 'ERROR';
export type JourneyRequest_Response = {
  sections: TripRequest_Response[]
  message: JourneyRequest_Message,
  error: RequestErrorData | null,
}
export type JourneyRequest_Callback = (response: JourneyRequest_Response) => void;
export class JourneyRequest {
  private stageConfig: StageConfig
  private requestParams: JourneyRequestParams
  public tripRequests: TripRequest[]
  public sections: TripRequest_Response[]

  constructor(stageConfig: StageConfig, requestParams: JourneyRequestParams) {
    this.stageConfig = stageConfig;
    this.requestParams = requestParams;
    this.tripRequests = [];
    this.sections = [];
  }

  public fetchResponse(callback: JourneyRequest_Callback) {
    const tripDepartureDate = this.requestParams.departureDate;
    this.tripRequests = [];
    this.computeTripResponse(0, tripDepartureDate, callback);
  }

  private computeTripResponse(journeyIDx: number, tripDepartureDate: Date, callback: JourneyRequest_Callback) {
    const isLastJourneySegment = journeyIDx === (this.requestParams.tripModeTypes.length - 1)

    const fromTripLocation = this.requestParams.tripLocations[journeyIDx]
    const toTripLocation = this.requestParams.tripLocations[journeyIDx + 1]

    const tripRequestParams = TripsRequestParams.initWithTripLocationsAndDate(fromTripLocation, toTripLocation, tripDepartureDate)
    if (tripRequestParams === null) {
      console.error('JourneyRequest - TripsRequestParams null for trip idx ' + journeyIDx)
      return
    }

    tripRequestParams.includeLegProjection = this.requestParams.includeLegProjection
    tripRequestParams.useNumberOfResultsAfter = this.requestParams.useNumberOfResultsAfter
    tripRequestParams.modeType = this.requestParams.tripModeTypes[journeyIDx];
    tripRequestParams.transportMode = this.requestParams.transportModes[journeyIDx];

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
        } else {
          const firstTrip = tripRequestResponse.trips[0];
          tripDepartureDate = firstTrip.stats.endDatetime;
  
          this.computeTripResponse(journeyIDx + 1, tripDepartureDate, callback);
        }
      }
    });
  }
}
