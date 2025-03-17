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

    this.ojpSDK = new OJP.SDK(httpConfig, 'de');
  }

  async ngOnInit(): Promise<void> {
    await this.runExamples();
  }

  private async runExamples() {
    await this.runLIR();
    await this.runTR();
    // await this.runSER();
  }

  private async runLIR() {
    console.log('======================');
    console.log('LIR Requests');
    console.log('======================');

    // 1) LIR lookup by name
    const searchTerm = 'Bern';
    const request1 = OJP.LocationInformationRequest.initWithLocationName(searchTerm);

    console.log('1) LIR lookup by name')
    const placeResults1 = await this.ojpSDK.fetchPlaceResults(request1);
    console.log(placeResults1);

    // 2) LIR lookup by BBOX
    
    // these are equivalent
    let bbox: string | number[] = '7.433259,46.937798,7.475252,46.954805';
    bbox = [7.433259, 46.937798, 7.475252, 46.954805];
    
    const request2 = OJP.LocationInformationRequest.initWithBBOX(bbox, ['stop']);
    const placeResults2 = await this.ojpSDK.fetchPlaceResults(request2);
    console.log(placeResults2);

    // 3) LIR lookup by stop reference
    const stopRef = '8507000';
    const request3 = OJP.LocationInformationRequest.initWithPlaceRef(stopRef);

    console.log('3) LIR lookup by StopRef')
    const placeResults3 = await this.ojpSDK.fetchPlaceResults(request3);
    console.log(placeResults3);
  }

  private async runTR() {
    console.log('======================');
    console.log('TR Requests');
    console.log('======================');

    // Building request

    const fromStopRef = '8507000';  // Bern
    const toStopRef = '8503000';    // Zürich

    const request1 = OJP.TripRequest.initWithPlaceRefsAndDate(fromStopRef, toStopRef, new Date());

    // TBA
    // // Request with long/lat coordinates
    // // https://opentdatach.github.io/ojp-demo-app/search?from=46.957522,7.431170&to=46.931849,7.485132
    // const fromLocationCoords = OJP.Location.initWithLngLat(7.431170, 46.957522);
    // const toLocationCoords = OJP.Location.initWithLngLat(7.485132, 46.931849);
    // const request2 = OJP.TripRequest.initWithLocationsAndDate(OJP.DEFAULT_STAGE, fromLocationCoords, toLocationCoords, new Date(), 'Dep');

    // Handling response
    
    // a) using await/async
    const response1 = await this.ojpSDK.fetchTrips(request1);
    console.log('a) TR using await/async')
    console.log(response1);

    // TBA - not sure if needed now
    // // c) using a callback
    // // the XML parsing might some time for processing therefore using a callback can allow the GUI to react quickly when having partial results
    // request1.fetchResponseWithCallback(response => {
    //   if (response.message === 'TripRequest.DONE') {
    //     // all trips were parsed, this is also fired when using Promise.then approach
    //     console.log('c) TR using callback')
    //     console.log(response);
    //   } else {
    //     if (response.message === 'TripRequest.TripsNo') {
    //       // logic how to proceed next, have an idea of how many trips to expect
    //       // console.log(response);
    //     }
        
    //     if (response.message === 'TripRequest.Trip') {
    //       // handle trip by trip, this is faster than expecting for whole TripRequest.DONE event
    //       // console.log(response);
    //     }
    //   }
    // });
  }

  // private async runSER() {
  //   console.log('======================');
  //   console.log('SER Requests');
  //   console.log('======================');

  //   const stopRef = '8507000'; // Bern
  //   const request1 = OJP.StopEventRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef, 'departure', new Date());
    
  //   // a) using await/async
  //   const response1 = await request1.fetchResponse();
  //   console.log('a) SER using await/async')
  //   console.log(response1);

  //   // b) using Promise.then
  //   request1.fetchResponse().then(response => {
  //     console.log('b) SER using Promise.then')
  //     console.log(response);
  //   });
  // }
}
