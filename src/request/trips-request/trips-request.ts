import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { DEFAULT_STAGE, StageConfig } from '../../types/stage-config';
import { TripRequest_Response, TripRequest_Callback, NumberOfResultsType } from '../types/trip-request.type';
import { TripRequestParser } from './trip-request-parser';
import { TripLocationPoint } from '../../trip';
import { Location } from '../../location/location';
import { Language } from '../../types/language-type';

import { TripModeType } from '../../types/trip-mode-type';
import { IndividualTransportMode } from '../../types/individual-mode.types';

export type TripRequestBoardingType = 'Dep' | 'Arr'

export class TripRequest extends OJPBaseRequest {
  private requestParams: TripsRequestParams
  public response: TripRequest_Response | null

  constructor(stageConfig: StageConfig, requestParams: TripsRequestParams) {
    super(stageConfig);
    this.requestParams = requestParams;
    this.response = null;
    this.requestInfo.requestXML = this.buildRequestXML();
  }

  public static initWithResponseMock(mockText: string) {
    const emptyRequestParams = TripsRequestParams.Empty();
    const request = new TripRequest(DEFAULT_STAGE, emptyRequestParams);
    request.mockResponseXML = mockText;
    
    return request;
  }

  public static initWithRequestMock(mockText: string, stageConfig: StageConfig = DEFAULT_STAGE) {
    const emptyRequestParams = TripsRequestParams.Empty();
    const request = new TripRequest(stageConfig, emptyRequestParams);
    request.mockRequestXML = mockText;
    
    return request;
  }

  public static initWithStopRefs(stageConfig: StageConfig, language: Language, fromStopRef: string, toStopRef: string, departureDate: Date = new Date(), tripRequestBoardingType: TripRequestBoardingType = 'Dep') {
    const fromLocation = Location.initWithStopPlaceRef(fromStopRef);
    const toLocation = Location.initWithStopPlaceRef(toStopRef);
    const requestParams = TripsRequestParams.initWithLocationsAndDate(language, fromLocation, toLocation, departureDate, tripRequestBoardingType);
    if (requestParams === null) {
      return null;
    }

    const request = new TripRequest(stageConfig, requestParams);
    return request;
  }

  public static initWithLocationsAndDate(stageConfig: StageConfig, language: Language, fromLocation: Location, toLocation: Location, departureDate: Date, tripRequestBoardingType: TripRequestBoardingType = 'Dep') {
    const requestParams = TripsRequestParams.initWithLocationsAndDate(language, fromLocation, toLocation, departureDate, tripRequestBoardingType);
    if (requestParams === null) {
      return null;
    }
    const request = new TripRequest(stageConfig, requestParams);
    return request;
  }

  public static initWithTripLocationsAndDate(
    stageConfig: StageConfig, 
    language: Language, 
    fromTripLocation: TripLocationPoint | null, 
    toTripLocation: TripLocationPoint | null, 
    departureDate: Date, 
    tripRequestBoardingType: TripRequestBoardingType = 'Dep', 
    numberOfResultsType: NumberOfResultsType = 'NumberOfResults', 
    includeLegProjection: boolean = false,
    modeType: TripModeType = 'monomodal',
    transportMode: IndividualTransportMode  = 'public_transport',
    viaTripLocations: TripLocationPoint[] = [],
    numberOfResults: number | null = null,
  ) {
    const requestParams = TripsRequestParams.initWithTripLocationsAndDate(
      language, 
      fromTripLocation, 
      toTripLocation, 
      departureDate, 
      tripRequestBoardingType,
      numberOfResultsType,
      includeLegProjection,
      modeType,
      transportMode,
      viaTripLocations,
      numberOfResults,
    );
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
    this.response = null;

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
      if (parserResponse.message === 'TripRequest.Trip' && parserResponse.trips.length === 1) {
        this.requestInfo.parseDateTime = new Date();
      }

      this.response = parserResponse;

      callback(parserResponse);
    };
    parser.parseXML(this.requestInfo.responseXML);
  }
}
