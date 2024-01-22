import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { DEFAULT_STAGE, StageConfig } from '../../types/stage-config';
import { TripRequest_Response, TripRequest_Callback } from '../types/trip-request.type';
import { TripRequestParser } from './trip-request-parser';
import { Trip, TripContinousLeg, TripLocationPoint } from '../../trip';
import { Location } from '../../location/location';

export class TripRequest extends OJPBaseRequest {
  private requestParams: TripsRequestParams

  constructor(stageConfig: StageConfig, requestParams: TripsRequestParams) {
    super(stageConfig);
    this.requestParams = requestParams;
    this.requestInfo.requestXML = this.buildRequestXML();
  }

  public static initWithResponseMock(mockText: string) {
    const emptyRequestParams = TripsRequestParams.Empty();
    const request = new TripRequest(DEFAULT_STAGE, emptyRequestParams);
    request.mockResponseXML = mockText;
    
    return request;
  }

  public static initWithRequestMock(mockText: string) {
    const emptyRequestParams = TripsRequestParams.Empty();
    const request = new TripRequest(DEFAULT_STAGE, emptyRequestParams);
    request.mockRequestXML = mockText;
    
    return request;
  }

  public static initWithLocationsAndDate(stageConfig: StageConfig, fromLocation: Location, toLocation: Location, departureDate: Date) {
    const requestParams = TripsRequestParams.initWithLocationsAndDate(fromLocation, toLocation, departureDate);
    if (requestParams === null) {
      return null;
    }
    const request = new TripRequest(stageConfig, requestParams);
    return request;
  }

  public static initWithTripLocationsAndDate(stageConfig: StageConfig, fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, departureDate: Date) {
    const requestParams = TripsRequestParams.initWithTripLocationsAndDate(fromTripLocation, toTripLocation, departureDate);
    if (requestParams === null) {
      return null;
    }
    const request = new TripRequest(stageConfig, requestParams);
    return request;
  }

  protected buildRequestXML(): string {
    return this.requestParams.buildRequestXML();
  }

  public async fetchResponse(): Promise<TripRequest_Response> {
    await this.fetchOJPResponse();

    const promise = new Promise<TripRequest_Response>((resolve) => {
      this.parseTripRequestResponse(resolve);
    });

    return promise;
  }

  public fetchResponseWithCallback(callback: TripRequest_Callback) {
    this.fetchOJPResponse().then((requestInfo) => {
      this.requestInfo = requestInfo;
      this.parseTripRequestResponse(callback);
    });
  }

  private parseTripRequestResponse(callback: TripRequest_Callback) {
    if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
      const errorResponse: TripRequest_Response = {
        tripsNo: 0,
        trips: [],
        message: null
      }

      errorResponse.message = 'ERROR';
      callback(errorResponse);
      return;
    }

    const parser = new TripRequestParser();
    parser.callback = (parserResponse) => {
      if (parserResponse.message === 'TripRequest.DONE') {
        this.sortTrips(parserResponse.trips);
      }

      if (parserResponse.message === 'TripRequest.Trip' && parserResponse.trips.length === 1) {
        this.requestInfo.parseDateTime = new Date();
      }

      callback(parserResponse);
    };
    parser.parseXML(this.requestInfo.responseXML);
  }

  private sortTrips(trips: Trip[]) {
    const tripModeType = this.requestParams.modeType;
    const transportMode = this.requestParams.transportMode;

    if (tripModeType !== 'monomodal') {
      return;
    }

    // Push first the monomodal trip with one leg matching the transport mode
    const monomodalTrip = trips.find(trip => {
      if (trip.legs.length !== 1) {
        return false;
      }

      if (trip.legs[0].legType !== 'ContinousLeg') {
        return false;
      }

      const continousLeg = trip.legs[0] as TripContinousLeg;
      return continousLeg.legTransportMode === transportMode;
    }) ?? null;

    if (monomodalTrip) {
      const tripIdx = trips.indexOf(monomodalTrip);
      trips.splice(tripIdx, 1);
      trips.unshift(monomodalTrip);
    }
  }
}
