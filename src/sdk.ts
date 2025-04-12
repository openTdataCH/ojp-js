import axios, { AxiosHeaders, AxiosRequestConfig } from "axios";

import { PlaceResult, StopEventResult, Trip } from "./models/ojp.js";
import { XML_Config, HTTPConfig, Language } from "./types/_all.js";
import { LocationInformationRequest, StopEventRequest, TripRequest } from "./models/request.js";

export class SDK {
  private requestorRef: string;
  private httpConfig: HTTPConfig;
  private language: Language;

  constructor(requestorRef: string, httpConfig: HTTPConfig, language: Language) {
    this.requestorRef = requestorRef;
    // TODO - do some validation on the format? [0-9a-zA-Z_\.] ?

    this.httpConfig = httpConfig;
    this.language = language;
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
    const requestXML = (() => {
      if (tripRequest.mockRequestXML) {
        // console.log('TR: using mock request XML');
        return tripRequest.mockRequestXML;
      }

      const xml = tripRequest.buildRequestXML(this.language, this.requestorRef);
      return xml;
    })();
    
    // console.log('fetchTrips: requestXML');
    // console.log(requestXML);

    const responseXML: string = await (async () => {
      if (tripRequest.mockResponseXML) {
        // console.log('TR: using mock response XML');
        return tripRequest.mockResponseXML;
      }

      const xml = await this.fetchResponse(requestXML);
      return xml;
    })();

    // console.log('fetchTrips ... done fetchResponse');

    const tripMatches: string[] = responseXML.match(/<Trip\b[^>]*>.*?<\/Trip>/gs) ?? [];
    
    // console.log('fetchTrips - regexp matches - found ' + tripMatches.length + ' trips');

    const trips: Trip[] = [];
    tripMatches.forEach((tripXML, idx1) => {
      const trip = Trip.initWithTripXML(tripXML);
      trips.push(trip);
    });

    // console.log('fetchTrips - done init trips');

    return trips;
  }

  public async fetchPlaceResults(lirRequest: LocationInformationRequest): Promise<PlaceResult[]> {
    const requestXML = lirRequest.buildRequestXML(this.language, this.requestorRef);
    // console.log('fetchLocations: requestXML');
    // console.log(requestXML);

    const responseXML = await this.fetchResponse(requestXML);

    // console.log('fetchLocations ... done fetchResponse');

    const placeResultMatches: string[] = responseXML.match(/<PlaceResult\b[^>]*>.*?<\/PlaceResult>/gs) ?? [];
    
    // console.log('fetchLocations - regexp matches - found ' + placeResultMatches.length + ' places');

    const placeResults: PlaceResult[] = [];
    placeResultMatches.forEach((nodeXML, idx1) => {
      const placeResult = PlaceResult.initWithXML(nodeXML);
      placeResults.push(placeResult);
    });

    return placeResults;
  }

  public async fetchStopEvents(request: StopEventRequest): Promise<StopEventResult[]> {
    const requestXML = request.buildRequestXML(this.language, this.requestorRef);
    // console.log('fetchStopEvents: requestXML');
    // console.log(requestXML);

    const responseXML = await this.fetchResponse(requestXML);

    // console.log('fetchStopEvents ... done fetchResponse');

    const resultMatches: string[] = responseXML.match(/<StopEventResult\b[^>]*>.*?<\/StopEventResult>/gs) ?? []; 
    // console.log('fetchStopEvents - regexp matches - found ' + resultMatches.length + ' stop events');

    const results: StopEventResult[] = [];
    resultMatches.forEach((nodeXML, idx1) => {
      const result = StopEventResult.initWithXML(nodeXML);
      results.push(result);
    });

    return results;
  }
}
