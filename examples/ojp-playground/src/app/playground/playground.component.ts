import { Component, OnInit } from '@angular/core';

import * as OJP from 'ojp-sdk'

@Component({
  selector: 'playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {
  private ojpSDK: OJP.SDK;

  constructor() {
    let httpConfig: OJP.HTTPConfig = {
      url: 'https://api.opentransportdata.swiss/ojp20',
      authToken: null,
    };


    const requestorRef = 'PlaygroundApp.v1';
    this.ojpSDK = new OJP.SDK(requestorRef, httpConfig, 'de');
  }

  async ngOnInit(): Promise<void> {
    await this.runExamples();
  }

  private async runExamples() {
    await this.runLIR();
    await this.runTR();
    await this.runSER();
  }

  private async runLIR() {
    console.log('======================');
    console.log('LIR Requests');
    console.log('======================');

    // 1) LIR lookup by name
    const searchTerm = 'Bern';
    const request1 = OJP.LocationInformationRequest.initWithLocationName(searchTerm);

    console.log('1) LIR lookup by name');
    const lirResponse1 = await this.ojpSDK.fetchLocationInformationRequestResponse(request1);
    if (!lirResponse1.ok) {
      console.error('fetchLocationInformationRequestResponse ERROR');
      console.log(lirResponse1.error);
      return;
    }
    console.log(lirResponse1.value.placeResult);

    // 2) LIR lookup by BBOX
    
    // these are equivalent
    let bbox: string | number[] = '7.433259,46.937798,7.475252,46.954805';
    bbox = [7.433259, 46.937798, 7.475252, 46.954805];
    
    const request2 = OJP.LocationInformationRequest.initWithBBOX(bbox, ['stop']);

    console.log('2) LIR lookup by BBOX');
    const lirResponse2 = await this.ojpSDK.fetchLocationInformationRequestResponse(request2);
    if (!lirResponse2.ok) {
      console.error('fetchLocationInformationRequestResponse ERROR');
      console.log(lirResponse2.error);
      return;
    }
    console.log(lirResponse2.value.placeResult);

    // 3) LIR lookup by stop reference
    const stopRef = '8507000';
    const request3 = OJP.LocationInformationRequest.initWithPlaceRef(stopRef);

    console.log('3) LIR lookup by StopRef');
    const lirResponse3 = await this.ojpSDK.fetchLocationInformationRequestResponse(request3);
    if (!lirResponse3.ok) {
      console.error('fetchLocationInformationRequestResponse ERROR');
      console.log(lirResponse3.error);
      return;
    }
    console.log(lirResponse3.value.placeResult);
  }

  private async runTR() {
    console.log('======================');
    console.log('TR Requests');
    console.log('======================');

    // a) from StopPlaceRef to StopPlaceRef
    const fromStopRef = '8507000';  // Bern
    const toStopRef = '8503000';    // Zürich

    const request1 = OJP.TripRequest.initWithPlaceRefsOrCoords(fromStopRef, toStopRef);
    const response1 = await this.ojpSDK.fetchTripRequestResponse(request1);
    if (!response1.ok) {
      console.error('fetchTripRequestResponse ERROR');
      console.log(response1.error);
      return;
    }
    console.log('A) TR with from/to stopRefs');
    console.log(response1.value);

    // b) from fromCoordsRef to StopPlaceRef
    // coords in strings format, latitude,longitude
    const fromCoordsRef = '46.957522,7.431170';
    const toCoordsRef = '46.931849,7.485132';

    const request2 = OJP.TripRequest.initWithPlaceRefsOrCoords(fromCoordsRef, toCoordsRef);
    if (request2.params) {
      request2.params.includeLegProjection = true;
    }

    const response2 = await this.ojpSDK.fetchTripRequestResponse(request2);
    if (!response2.ok) {
      console.error('fetchTripRequestResponse ERROR');
      console.log(response2.error);
      return;
    }
    console.log('B) TR with from/to coords');
    console.log(response2.value);
  }

  private async runSER() {
    console.log('======================');
    console.log('SER Requests');
    console.log('======================');

    const stopRef = '8507000'; // Bern
    const request1 = OJP.StopEventRequest.initWithPlaceRefAndDate(stopRef, new Date());
    
    const response1 = await this.ojpSDK.fetchStopEventRequestResponse(request1);
    if (!response1.ok) {
      console.error('fetchStopEventRequestResponse ERROR');
      console.log(response1.error);
      return;
    }

    console.log('a) SER using await/async')
    console.log(response1.value);
  }
}
