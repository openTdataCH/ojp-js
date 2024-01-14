import { RequestData } from ".."
import { TripsResponse } from "../trips-request/trips-request-response"

export class JourneySection {
  public requestData: RequestData
  public response: TripsResponse

  constructor(requestData: RequestData, response: TripsResponse) {
    this.requestData = requestData
    this.response = response
  }
}
