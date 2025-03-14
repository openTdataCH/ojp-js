import axios, { AxiosHeaders, AxiosRequestConfig } from "axios";

import { LocationInformationRequest, PlaceResult, Trip, TripRequest } from "./models/sdk";
import { HTTPConfig, Language } from "./types/_all";

export class SDK {
  private httpConfig: HTTPConfig;
  private language: Language;

  constructor(httpConfig: HTTPConfig, language: Language) {
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
    const requestXML = tripRequest.buildRequestXML(this.language);
    console.log('fetchTrips: requestXML');
    console.log(requestXML);

    const responseXML = await this.fetchResponse(requestXML);

    console.log('fetchTrips ... done fetchResponse');

    const tripMatches: string[] = responseXML.match(/<Trip\b[^>]*>.*?<\/Trip>/gs) ?? [];
    
    console.log('fetchTrips - regexp matches - found ' + tripMatches.length + ' trips');

    const trips: Trip[] = [];
    tripMatches.forEach((tripXML, idx1) => {
      const trip = Trip.initWithTripXML(tripXML);
      trips.push(trip);
    });

    console.log('fetchTrips - done init trips');

    return trips;
  }

  public async fetchPlaceResults(lirRequest: LocationInformationRequest): Promise<PlaceResult[]> {
    const requestXML = lirRequest.buildRequestXML(this.language);
    console.log('fetchLocations: requestXML');
    console.log(requestXML);

    const responseXML = await this.fetchResponse(requestXML);

    console.log('fetchLocations ... done fetchResponse');

    const placeResultMatches: string[] = responseXML.match(/<PlaceResult\b[^>]*>.*?<\/PlaceResult>/gs) ?? [];
    
    console.log('fetchLocations - regexp matches - found ' + placeResultMatches.length + ' trips');

    const placeResults: PlaceResult[] = [];
    placeResultMatches.forEach((nodeXML, idx1) => {
      const placeResult = PlaceResult.initWithXML(nodeXML);
      placeResults.push(placeResult);
    });

    return placeResults;
  }
}
