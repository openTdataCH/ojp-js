import { Component } from '@angular/core';

import * as OJP from 'ojp-sdk'

@Component({
  selector: 'playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent {
  constructor() {
    this.runExamples();
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
    const request1 = OJP.LocationInformationRequest.initWithLocationName(OJP.DEFAULT_STAGE, searchTerm);

    console.log('1) LIR lookup by name')
    // a) using await/async
    const response = await request1.fetchResponse();
    console.log(response);

    // b) using Promise.then
    request1.fetchResponse().then(response => {
      console.log('LIR response via Promise.then');
      console.log(response);
    });

    // 2) LIR lookup by BBOX
    // lookup locations by bbox coords (WGS84) 
    // and location type: stop | poi_all

    // SW corner (bottom-left)
    const minLongitude = 7.433259;
    const minLatitude = 46.937798;
    // NE corner (top-right)
    const maxLongitude = 7.475252;
    const maxLatitude = 46.954805;
    const request2 = OJP.LocationInformationRequest.initWithBBOXAndType(OJP.DEFAULT_STAGE, minLongitude, minLatitude, maxLongitude, maxLatitude, 'stop');

    console.log('2) LIR lookup by BBOX')
    const response2 = await request2.fetchResponse();
    console.log(response2);

    // 3) LIR lookup by stop reference
    const stopRef = '8507000';
    const request3 = OJP.LocationInformationRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef);

    console.log('3) LIR lookup by StopRef')
    const response3 = await request3.fetchResponse();
    console.log(response3);
  }

  private async runTR() {
    console.log('======================');
    console.log('TR Requests');
    console.log('======================');

    // Building request

    const fromStopRef = '8507000';  // Bern
    const toStopRef = '8503000';    // Zürich

    const fromLocation = OJP.Location.initWithStopPlaceRef(fromStopRef); 
    const toLocation = OJP.Location.initWithStopPlaceRef(toStopRef); 

    const request1 = OJP.TripRequest.initWithLocationsAndDate(OJP.DEFAULT_STAGE, fromLocation, toLocation, new Date(), 'Dep');
    if (request1 === null) {
      // handle invalid requests
      return;
    }

    // This is equivalent with request1
    const request1_B = OJP.TripRequest.initWithStopRefs(OJP.DEFAULT_STAGE, fromStopRef, toStopRef, new Date(), 'Dep');
    
    // a) using await/async
    const response1 = await request1.fetchResponse();
    console.log('a) TR using await/async')
    console.log(response1);

    // b) using Promise.then
    request1.fetchResponse().then(response => {
      console.log('b) TR using Promise.then')
      console.log(response);
    });

    // c) using a callback
    // the XML parsing might some time for processing therefore using a callback can allow the GUI to react quickly when having partial results
    request1.fetchResponseWithCallback(response => {
      if (response.message === 'TripRequest.DONE') {
        // all trips were parsed, this is also fired when using Promise.then approach
        console.log('c) TR using callback')
        console.log(response);
      } else {
        if (response.message === 'TripRequest.TripsNo') {
          // logic how to proceed next, have an idea of how many trips to expect
          // console.log(response);
        }
        
        if (response.message === 'TripRequest.Trip') {
          // handle trip by trip, this is faster than expecting for whole TripRequest.DONE event
          // console.log(response);
        }
      }
    });
  }

  private async runSER() {
    console.log('======================');
    console.log('SER Requests');
    console.log('======================');

    const stopRef = '8507000'; // Bern
    const request1 = OJP.StopEventRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef, 'departure', new Date());
    
    // a) using await/async
    const response1 = await request1.fetchResponse();
    console.log('a) SER using await/async')
    console.log(response1);

    // b) using Promise.then
    request1.fetchResponse().then(response => {
      console.log('b) SER using Promise.then')
      console.log(response);
    });
  }
}
