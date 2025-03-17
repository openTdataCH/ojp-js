import { Component, OnInit } from '@angular/core';

import * as OJP from 'ojp-sdk'

type DepartureRow = {
  service: {
    line: string
  },
  journey: {
    number: string
    headingText: string
    stops: string
  },
  departure: {
    timeF: string,
    delayText: string
  }
}

type RenderModel = {
  stop: {
    id: string
    name: string
  },
  departures: DepartureRow[]
}

@Component({
  selector: 'departures-webapp',
  templateUrl: './departures.component.html',
  styleUrls: ['./departures.component.scss']
})
export class DeparturesComponent implements OnInit {
  private ojpSDK: OJP.SDK;

  public renderModel: RenderModel
  private queryParams: URLSearchParams
  
  title = 'departures-webapp';
  
  constructor() {
    this.renderModel = {} as RenderModel;
    this.renderModel.departures = [];
    
    this.queryParams = new URLSearchParams(document.location.search);

    let httpConfig: OJP.HTTPConfig = {
      url: 'https://api.opentransportdata.swiss/ojp20',
      authToken: null,
    };

    this.ojpSDK = new OJP.SDK(httpConfig, 'de');
  }

  async ngOnInit(): Promise<void> {
    const placeResults = await this.fetchLookupLocations();
    if (placeResults.length === 0) {
      console.error('ERROR: empty LIR response')
      return;
    }

    const place = placeResults[0].place;
    console.log(place);
  }

  private async fetchLookupLocations(): Promise<OJP.PlaceResult[]> {
    const mapStopRefs = {
      'BERN': '8507000',
      'BERN_BAHNHOF': '8576646',
      'ZUERICH': '8503000',
      'BASEL': '8500010',
      'BASEL_BAD': '8500090',
    }
    const stopRef = this.queryParams.get('stop_id') ?? mapStopRefs.BERN_BAHNHOF;

    const lir = OJP.LocationInformationRequest.initWithPlaceRef(stopRef);
    const placeResults = await this.ojpSDK.fetchPlaceResults(lir);

    return placeResults;
  }
}
