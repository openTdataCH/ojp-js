import axios, { AxiosHeaders, AxiosRequestConfig } from "axios";

import { PlaceResult, StopEventResult, Trip } from "./models/ojp";
import { XML_Config, HTTPConfig, Language } from "./types/_all";
import { LocationInformationRequest, StopEventRequest, TripRefineRequest, TripRequest } from "./models/request";
import { DefaultXML_Config } from "./constants";

type OJP_RequestType = TripRequest | LocationInformationRequest | StopEventRequest | TripRefineRequest;
export class SDK {
  private requestorRef: string;
  private httpConfig: HTTPConfig;
  private language: Language;
  private xmlConfig: XML_Config;

  constructor(requestorRef: string, httpConfig: HTTPConfig, language: Language) {
    this.requestorRef = requestorRef;
    // TODO - do some validation on the format? [0-9a-zA-Z_\.] ?

    this.httpConfig = httpConfig;
    this.language = language;
    
    this.xmlConfig = DefaultXML_Config;
  }

  private async computeResponse(request: OJP_RequestType): Promise<string> {
    const requestXML = (() => {
      if (request.mockRequestXML) {
        // console.log('TR: using mock request XML');
        return request.mockRequestXML;
      }

      const xml = request.buildRequestXML(this.language, this.requestorRef, this.xmlConfig);
      return xml;
    })();

    request.requestInfo.requestDateTime = new Date();
    request.requestInfo.requestXML = requestXML;

    const responseXML: string = await (async () => {
      if (request.mockResponseXML) {
        // console.log('TR: using mock response XML');
        return request.mockResponseXML;
      }

      const xml = await this.fetchResponse(requestXML);
      return xml;
    })();

    request.requestInfo.responseDateTime = new Date();
    request.requestInfo.responseXML = responseXML;

    return responseXML;
  }

  private async fetchResponse(requestXML: string): Promise<string> {
    const headers = new AxiosHeaders();
    headers.set('Accept', 'application/xml');
    headers.set('Content-Type', 'application/xml');

    if (this.httpConfig.authToken !== null) {
      headers.set('Authorization', 'Bearer ' + this.httpConfig.authToken);
    }

    const requestConfig: AxiosRequestConfig = {
      method: 'POST',
      url: this.httpConfig.url,
      headers: headers,
    };

    if (this.httpConfig.url.startsWith('http://localhost')) {
      requestConfig.method = 'GET';
    }

    if (requestConfig.method === 'POST') {
      requestConfig.data = requestXML;
    }

    const response = await axios.request(requestConfig);
    const responseXML = response.data as string;

    return responseXML;
  }

  public async fetchTrips(tripRequest: TripRequest): Promise<Trip[]> {
    const responseXML = await this.computeResponse(tripRequest);

    const tripMatches: string[] = responseXML.match(/<Trip\b[^>]*>.*?<\/Trip>/gs) ?? [];
    
    // console.log('fetchTrips - regexp matches - found ' + tripMatches.length + ' trips');

    const trips: Trip[] = [];
    tripMatches.forEach((tripXML, idx1) => {
      const trip = Trip.initWithTripXML(tripXML);
      trips.push(trip);
    });

    tripRequest.requestInfo.parseDateTime = new Date();

    // console.log('fetchTrips - done init trips');

    return trips;
  }

  public async fetchPlaceResults(lirRequest: LocationInformationRequest): Promise<PlaceResult[]> {
    const responseXML = await this.computeResponse(lirRequest);

    // console.log('fetchLocations ... done fetchResponse');

    const placeResultMatches: string[] = responseXML.match(/<PlaceResult\b[^>]*>.*?<\/PlaceResult>/gs) ?? [];
    
    // console.log('fetchLocations - regexp matches - found ' + placeResultMatches.length + ' places');

    const placeResults: PlaceResult[] = [];
    placeResultMatches.forEach((nodeXML, idx1) => {
      const placeResult = PlaceResult.initWithXML(nodeXML);
      placeResults.push(placeResult);
    });

    lirRequest.requestInfo.parseDateTime = new Date();

    return placeResults;
  }

  public async fetchStopEvents(request: StopEventRequest): Promise<StopEventResult[]> {
    const responseXML = await this.computeResponse(request);

    // console.log('fetchStopEvents ... done fetchResponse');

    const resultMatches: string[] = responseXML.match(/<StopEventResult\b[^>]*>.*?<\/StopEventResult>/gs) ?? []; 
    // console.log('fetchStopEvents - regexp matches - found ' + resultMatches.length + ' stop events');

    const results: StopEventResult[] = [];
    resultMatches.forEach((nodeXML, idx1) => {
      const result = StopEventResult.initWithXML(nodeXML);
      results.push(result);
    });

    request.requestInfo.parseDateTime = new Date();

    return results;
  }

  public async fetchTRR_Trips(request: TripRefineRequest): Promise<Trip[]> {
    const responseXML = await this.computeResponse(request);

    const tripMatches: string[] = responseXML.match(/<Trip\b[^>]*>.*?<\/Trip>/gs) ?? [];

    const trips: Trip[] = [];
    tripMatches.forEach((tripXML, idx1) => {
      const trip = Trip.initWithTripXML(tripXML);
      trips.push(trip);
    });

    request.requestInfo.parseDateTime = new Date();

    return trips;
  }
}
