import { Component, OnInit } from '@angular/core';

import * as OJP from 'ojp-sdk'

@Component({
  selector: 'playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {
  private ojpSDK: OJP.SDK;
  private ojpINT_SDK: OJP.SDK;

  constructor() {
    let httpConfig: OJP.HTTPConfig = {
      url: 'https://api.opentransportdata.swiss/ojp20',
      authToken: null,
    };
    let httpConfigINT: OJP.HTTPConfig = {
      url: 'https://odpch-api.clients.liip.ch/ojp20-beta',
      authToken: null,
    };


    const requestorRef = 'PlaygroundApp.v1';
    this.ojpSDK = new OJP.SDK(requestorRef, httpConfig, 'de');
    this.ojpINT_SDK = new OJP.SDK(requestorRef, httpConfigINT, 'de');
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

    await this.runLR_LookupByName();
    await this.runLR_LookupByBBOX();
    await this.runLR_LookupByStopRef();
    await this.runLR_LookupByNameFilterPtMode();
  }

  private async runLR_LookupByName() {
    // 1) LIR lookup by name
    const searchTerm = 'Bern';
    const request = OJP.LocationInformationRequest.initWithLocationName(searchTerm);

    console.log('1) LIR lookup by name');
    const response = await this.ojpSDK.fetchLocationInformationRequestResponse(request);
    if (!response.ok) {
      console.error('fetchLocationInformationRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log(response.value.placeResult);
  }

  private async runLR_LookupByBBOX() {
    // 2) LIR lookup by BBOX
    
    // these are equivalent
    let bbox: string | number[] = '7.433259,46.937798,7.475252,46.954805';
    bbox = [7.433259, 46.937798, 7.475252, 46.954805];
    
    const request = OJP.LocationInformationRequest.initWithBBOX(bbox, ['stop']);

    console.log('2) LIR lookup by BBOX');
    const response = await this.ojpSDK.fetchLocationInformationRequestResponse(request);
    if (!response.ok) {
      console.error('fetchLocationInformationRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log(response.value.placeResult);
  }

  private async runLR_LookupByStopRef() {
    // 3) LIR lookup by stop reference
    const stopRef = '8507000';
    const request = OJP.LocationInformationRequest.initWithPlaceRef(stopRef);

    console.log('3) LIR lookup by StopRef');
    const response = await this.ojpSDK.fetchLocationInformationRequestResponse(request);
    if (!response.ok) {
      console.error('fetchLocationInformationRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log(response.value.placeResult);
  }

  private async runLR_LookupByNameFilterPtMode() {
    // 4) LIR lookup by name with filter by ptMode type
    const searchTerm = 'Th';
    const request = OJP.LocationInformationRequest.initWithLocationName(searchTerm);
    if (request.restrictions) {
      request.restrictions.type = ['stop'];
      request.restrictions.includePtModes = true;
      request.restrictions.modes = {
        exclude: false,
        ptMode: ['water'],
      };
    }

    console.log('4) LIR lookup by name with filter by ptMode type');
    const response = await this.ojpINT_SDK.fetchLocationInformationRequestResponse(request);
    if (!response.ok) {
      console.error('fetchLocationInformationRequestResponse ERROR');
      console.log(response.error);
      return;
    }

    console.log(request.requestInfo.requestXML);
    console.log(response.value.placeResult);
    response.value.placeResult.forEach((placeResult, idx) => {
      const name = placeResult.place.name.text;
      const score = placeResult.probability ?? 'n/a';
      console.log((idx + 1) + '.' + name + ' - ' + score);
    });
  }

  private async runTR() {
    console.log('======================');
    console.log('TR Requests');
    console.log('======================');

    await this.runTR_StopsPlaceRef();
    await this.runTR_Coords();
    await this.runTR_WalkSpeed();
    await this.runTR_ModeFilter();
    await this.runTR_ItModeFilter();
  }

  private async runTR_StopsPlaceRef() {
    // a) from StopPlaceRef to StopPlaceRef
    const fromStopRef = '8507000';  // Bern
    const toStopRef = '8503000';    // Zürich

    const request = OJP.TripRequest.initWithPlaceRefsOrCoords(fromStopRef, toStopRef);
    const response = await this.ojpSDK.fetchTripRequestResponse(request);
    if (!response.ok) {
      console.error('fetchTripRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log('A) TR with from/to stopRefs');
    console.log(response.value);

    // serialize the object back to XML string
    const trip1Schema = response.value.tripResult[0].trip;
    const serializer = new OJP.XmlSerializer();
    const tripXML = serializer.serialize(trip1Schema, 'Trip');
    console.log('serialized trip XML');
    // console.log(tripXML);
  }

  private async runTR_Coords() {
    // b) from fromCoordsRef to StopPlaceRef
    // coords in strings format, latitude,longitude
    const fromCoordsRef = '46.957522,7.431170';
    const toCoordsRef = '46.931849,7.485132';

    const request = OJP.TripRequest.initWithPlaceRefsOrCoords(fromCoordsRef, toCoordsRef);
    if (request.params) {
      request.params.includeLegProjection = true;
    }

    const response = await this.ojpSDK.fetchTripRequestResponse(request);
    if (!response.ok) {
      console.error('fetchTripRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log('B) TR with from/to coords');
    console.log(response.value);
  }

  private async runTR_WalkSpeed() {
    // C) TR with walkSpeed
    const request = OJP.TripRequest.initWithPlaceRefsOrCoords('8507099', '8511418');
    if (request.params) {
      request.params.walkSpeed = 400;
    }
    const response = await this.ojpSDK.fetchTripRequestResponse(request);
    if (!response.ok) {
      console.error('fetchTripRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log('C) TR with walkSpeed');
    console.log(response.value);
    console.log(request.requestInfo.requestXML);
  }

  private async runTR_ModeFilter() {
    // D) TR with modeFilter - Thun(See) - Spiez(See)
    const request = OJP.TripRequest.initWithPlaceRefsOrCoords('8507150', '8507154');
    if (request.params) {
      request.params.modeAndModeOfOperationFilter = [
        {
          exclude: false,
          ptMode: ['water'],
        }
      ];
    }
    const response = await this.ojpSDK.fetchTripRequestResponse(request);
    if (!response.ok) {
      console.error('fetchTripRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log('D) TR with modeFilter');
    console.log(request.requestInfo.requestXML);
    console.log(response.value);
  }

  private async runTR_ItModeFilter() {
    // E) TR with hiking bern - gantrisch
    const place1 = OJP.Place.initWithCoords(7.43913, 46.94883);
    const place2 = OJP.Place.initWithCoords(7.418625, 46.698708);

    const request = OJP.TripRequest.initWithPlaces(place1, place2);
    request.setMaxDurationWalkingTime(300);

    const response = await this.ojpSDK.fetchTripRequestResponse(request);
    if (!response.ok) {
      console.error('fetchTripRequestResponse ERROR');
      console.log(response.error);
      return;
    }
    console.log('E) TR with IndividualTransportOption - longer walk');
    console.log(request.requestInfo.requestXML);
    console.log(response.value.tripResult);
  }

  private async runSER() {
    console.log('======================');
    console.log('SER Requests');
    console.log('======================');

    await this.runSER_LookupByStopRef();
  }

  private async runSER_LookupByStopRef() {
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
