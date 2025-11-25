import { Component, OnInit } from '@angular/core';

import * as OJP from 'ojp-sdk';

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
  private ojpSDK: OJP.SDK<'2.0'>;

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


    const requestorRef = 'PlaygroundApp.v1';
    this.ojpSDK = OJP.SDK.create(requestorRef, httpConfig, 'de');
  }

  async ngOnInit(): Promise<void> {
    const placeResults = await this.fetchLookupLocations();
    if (placeResults.length === 0) {
      console.error('ERROR: empty LIR response')
      return;
    }

    const place = placeResults[0].place;
    
    // TODO - this should go in a helper?
    const placeRef = (() => {
      const stopPlaceRef = place.stopPlace?.stopPlaceRef ?? null;
      if (stopPlaceRef !== null) {
        return stopPlaceRef;
      }

      const stopPointRef = place.stopPoint?.stopPointRef ?? null;
      if (stopPointRef !== null) {
        return stopPointRef;
      }

      return null;
    })();

    if (placeRef === null) {
      console.error('CANT compute placeRef');
      console.log(place);
      return;
    }

    this.renderModel.stop = {
      id: place.stopPlace?.stopPlaceRef ?? 'n/a stopPlaceRef',
      name: place.name.text,
    };

    setTimeout(() => {
      this.fetchLatestDepartures(placeRef);
    }, 1000 * 60);
    this.fetchLatestDepartures(placeRef);
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

    const request = this.ojpSDK.requests.LocationInformationRequest.initWithPlaceRef(stopRef);
    const response = await request.fetchResponse(this.ojpSDK);

    if (!response.ok) {
      return [];
    }

    const placeResults: OJP.PlaceResult[] = response.value.placeResult.map(placeResultSchema => {
      const placeResult = OJP.PlaceResult.initWithXMLSchema(placeResultSchema);
      return placeResult;
    });

    return placeResults;
  }

  private async fetchLatestDepartures(placeRef: string) {
    const request = this.ojpSDK.requests.StopEventRequest.initWithPlaceRefAndDate(placeRef, new Date());

    const response = await request.fetchResponse(this.ojpSDK);
    if (!response.ok) {
      return;
    }

    const results = response.value.stopEventResult ?? [];
    this.renderModel.departures = [];
    results.forEach(result => {
      const departureRow = this.computeDepartureRow(result);
      this.renderModel.departures.push(departureRow);
    });
  }

  private computeDepartureRow(stopEventResult: OJP.StopEventResult): DepartureRow {
    const stopEvent = stopEventResult.stopEvent;
    // console.log(stopEvent);

    const journeyService = stopEvent.service;
    const serviceLineNumber = journeyService.publishedServiceName.text;
    
    const serviceLine: string = (() => {
      const isRail = journeyService.mode.ptMode === 'rail';
      if (isRail) {
        return serviceLineNumber ?? 'n/a'
      } else {
        const serviceLineParts: string[] = []
        
        // prepend B (for bus)
        serviceLineParts.push(journeyService.mode.shortName?.text ?? 'n/a shortName');
        
        // then line number
        serviceLineParts.push(serviceLineNumber)

        return serviceLineParts.join('');
      }
    })();

    const headingText: string = (() => {
      const lineParts: string[] = [];

      if (journeyService.destinationText) {
        lineParts.push(journeyService.destinationText.text);
      }

      return lineParts.join('');
    })();

    const stopData: string = (() => {
      const lineParts: string[] = [];
      stopEvent.onwardCall.forEach(call => {
        const stopPointName = call.callAtStop.stopPointName?.text ?? 'n/a';
        lineParts.push(stopPointName);
      });

      return ' - ' + lineParts.join(' - ');
    })();

    const departureData = stopEvent.thisCall.callAtStop.serviceDeparture ?? null;
    
    const departureTimeF: string = (() => {
      if (departureData === null) {
        return 'n/a';
      }

      const date = new Date(departureData.timetabledTime);
      return OJP.DateHelpers.formatTimeHHMM(date);
    })();

    const delayText: string = (() => {
      if (departureData === null) {
        return '';
      }

      const delayMinutes = OJP.DateHelpers.computeDelayMinutes(departureData.timetabledTime, departureData.estimatedTime ?? null);
      if (delayMinutes === null) {
        return '';
      }

      if (delayMinutes > 0) {
        return '+' + delayMinutes + ' min';
      }
      if (delayMinutes < 0) {
        return '-' + delayMinutes + ' min';
      }
      return 'ON TIME'
    })();


    const departureRow: DepartureRow = {
      service: {
        line: serviceLine
      },
      journey: {
        number: journeyService.trainNumber ?? 'n/a TrainNumber',
        headingText: headingText,
        stops: stopData,
      },
      departure: {
        timeF: departureTimeF,
        delayText: delayText,
      },
    };

    return departureRow;
  }
}
