import { Component } from '@angular/core';

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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public renderModel: RenderModel
  private queryParams: URLSearchParams
  
  title = 'departures-webapp';
  
  constructor() {
    this.renderModel = {} as RenderModel;
    this.renderModel.departures = [];
    
    this.queryParams = new URLSearchParams(document.location.search);

    const mapStopRefs = {
      'BERN': '8507000',
      'BERN_BAHNHOF': '8576646',
      'ZUERICH': '8503000',
      'BASEL': '8500010',
      'BASEL_BAD': '8500090',
    }
    const stopRef = this.queryParams.get('stop_id') ?? mapStopRefs.BERN_BAHNHOF;

    const locationRequest = OJP.LocationInformationRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef);
    locationRequest.fetchResponse().then(locations => {
      if (locations.length === 0) {
        console.log('ERROR - fetching locations for ' + stopRef);
        return;
      }
      
      const stopPlace = locations[0].stopPlace;
      if (stopPlace === null) {
        return;
      }

      this.renderModel.stop = {
        id: stopPlace.stopPlaceRef,
        name: stopPlace.stopPlaceName,
      }
    })
    
    setTimeout(() => {
      this.fetchLatestDepartures(stopRef);
    }, 1000 * 60);
    this.fetchLatestDepartures(stopRef);
  }

  private fetchLatestDepartures(stopRef: string) {
    const request = OJP.StopEventRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef, 'departure', new Date());
    console.log('FETCH departures for ' + stopRef + ' ...');
    request.fetchResponse().then(stopEvents => {
      console.log(stopEvents);
      this.renderModel.departures = []
      stopEvents.forEach(stopEvent => {
        const departureRow = this.computeDepartureRow(stopEvent)
        this.renderModel.departures.push(departureRow);
      });
    });
  }

  private computeDepartureRow(stopEvent: OJP.StopEvent): DepartureRow {
    // console.log(stopEvent);

    const journeyService = stopEvent.journeyService;
    const serviceLineNumber = journeyService.serviceLineNumber;
    
    const serviceLine: string = (() => {
      if (journeyService.ptMode.isRail()) {
        return serviceLineNumber ?? 'n/a'
      } else {
        const serviceLineParts: string[] = []
        if (journeyService.ptMode.shortName) {
          // prepend B (for bus)
          serviceLineParts.push(journeyService.ptMode.shortName)
        }
        // then line number
        serviceLineParts.push(serviceLineNumber ?? 'n/a')

        return serviceLineParts.join('');
      }
    })();

    const headingText: string = (() => {
      const lineParts: string[] = [];

      if (journeyService.destinationStopPlace) {
        lineParts.push(journeyService.destinationStopPlace.stopPlaceName);
      }

      return lineParts.join('');
    })();

    const stopData: string = (() => {
      const lineParts: string[] = [];
      stopEvent.nextStopPoints.forEach(stopPoint => {
        const stopPlace = stopPoint.location.stopPlace;
        if (stopPlace === null) {
          return;
        }

        lineParts.push(stopPlace.stopPlaceName);
      });

      return ' - ' + lineParts.join(' - ');
    })();

    const departureData = stopEvent.stopPoint.departureData;
    
    const departureTimeF: string = (() => {
      if (departureData === null) {
        return 'n/a';
      }

      return OJP.DateHelpers.formatTimeHHMM(departureData.timetableTime);
    })();

    const delayText: string = (() => {
      if (departureData === null) {
        return '';
      }

      const delayMinutes = departureData.delayMinutes;
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


    const departureRow = <DepartureRow>{
      service: {
        line: serviceLine
      },
      journey: {
        number: journeyService.journeyNumber,
        headingText: headingText,
        stops: stopData,
      },
      departure: {
        timeF: departureTimeF,
        delayText: delayText,
      }
    }

    return departureRow
  }
}
