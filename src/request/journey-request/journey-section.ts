import { RequestData } from ".."
import { TripsResponse } from "../../trips/trips-response"

export class JourneySection {
  public requestData: RequestData
  public response: TripsResponse

  constructor(requestData: RequestData, response: TripsResponse) {
    this.requestData = requestData
    this.response = response
  }
}
