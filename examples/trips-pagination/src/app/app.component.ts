import { Component, OnInit } from '@angular/core';

import * as OJP from 'ojp-sdk'

type TripLegInfo = {
  legType: string,
  legInfo: string,
}

type TripResult = {
  tripHash: string,
  pageIdx: number,
  tripIdx: number,
  isLast: boolean,
  trip: OJP.Trip,
  legs: TripLegInfo[],
  fromDate: Date,
  toDate: Date 
}

type PageModel = {
  nextPageDate: Date | null,
  pageIdx: number,
  tripResults: TripResult[],
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'trips-pagination';

  public fromStopRef: string
  public toStopRef: string

  public isSearching: boolean
  public removeDuplicates: boolean

  public pageModel: PageModel;

  constructor() {
    const queryParams = new URLSearchParams(document.location.search);

    this.fromStopRef = queryParams.get('from') ?? '8507000';
    this.toStopRef = queryParams.get('to') ?? '8503000';

    this.isSearching = false;
    this.removeDuplicates = false;

    this.pageModel = this.defaultModel();
  }

  ngOnInit(): void {
    this.searchTrips()
  }

  private defaultModel(): PageModel {
    const pageModel = {
      nextPageDate: null,
      pageIdx: 1,
      tripResults: [],
    }

    return pageModel;
  }

  public searchNewTrips() {
    this.pageModel = this.defaultModel();

    this.searchTrips();
 }

  private searchTrips(fromDate: Date = new Date()) {
    const fromLocation = OJP.Location.initWithStopPlaceRef(this.fromStopRef);
    const toLocation = OJP.Location.initWithStopPlaceRef(this.toStopRef);

    this.isSearching = true;

    console.log('=======================================');
    console.log(fromDate);
    console.log('=======================================');

    const tripRequest = OJP.TripRequest.initWithLocationsAndDate(OJP.DEFAULT_STAGE, fromLocation, toLocation, fromDate);
    tripRequest?.fetchResponse().then((response) => {
      this.isSearching = false;

      console.log(response.trips);

      let nextPageDate = new Date();

      response.trips.forEach((trip, tripIdx) => {
        const tripId = trip.id;     
        const tripHash = this.computeTripHash(trip);

        const prevTripResult = this.pageModel.tripResults.find((tripResult) => {
          return tripHash === tripResult.tripHash;
        }) ?? null;

        if (prevTripResult && this.removeDuplicates) {
          console.log('... ignore trip, already in results');
          console.log(trip);
          console.log(prevTripResult.trip);
          return;
        }

        const fromDate = trip.computeDepartureTime();
        const toDate = trip.computeArrivalTime();
        if (fromDate === null || toDate === null) {
          console.error('ERROR - cant get from/to date from trip');
          console.log(trip);
          return;
        }

        const legs: TripLegInfo[] = [];
        trip.legs.forEach(tripLeg => {
          const legInfo: string = (() => {
            const fromLocationName = tripLeg.fromLocation.computeLocationName() ?? 'n/a';
            const toLocationName = tripLeg.toLocation.computeLocationName() ?? 'n/a';

            if (tripLeg.legType === 'TransferLeg') {
              const transferTime = tripLeg.legDuration?.formatDuration();
              const textInfo = fromLocationName + ' (' + transferTime + ')';

              return textInfo;
            }

            if (tripLeg.legType === 'TimedLeg') {
              const timedLeg = tripLeg as OJP.TripTimedLeg;
              const fromLocationTime = timedLeg.computeDepartureTime();
              const fromLocationText = fromLocationName + '(' + fromLocationTime?.toLocaleTimeString() ?? 'n/a' + ')';

              const toLocationTime = timedLeg.computeDepartureTime();
              const toLocationText = toLocationName + '(' + toLocationTime?.toLocaleTimeString() ?? 'n/a' + ')';

              const serviceInfo = timedLeg.service.formatServiceName();

              const textInfo = fromLocationText + ' -> ' + toLocationText + ' with ' + serviceInfo;
              return textInfo;
            }

            return fromLocationName + ' -> ' + toLocationName;
          })();
          
          const tripLegInfo: TripLegInfo = {
            legType: tripLeg.legType,
            legInfo: legInfo,
          }
          legs.push(tripLegInfo);
        });

        const tripResult: TripResult = {
          tripHash: tripHash,
          pageIdx: this.pageModel.pageIdx,
          tripIdx: tripIdx + 1,
          isLast: false,
          trip: trip,
          legs: legs,
          fromDate: fromDate,
          toDate: toDate,
        };

        this.pageModel.tripResults.push(tripResult);
        
        nextPageDate = fromDate;
      });

      if (this.pageModel.tripResults.length > 0) {
        this.pageModel.tripResults[this.pageModel.tripResults.length - 1].isLast = true;
      }

      this.pageModel.nextPageDate = nextPageDate;
    });
  }

  public searchTripsNextPage() {
    if (this.pageModel.tripResults.length === 0) {
      return;
    }

    this.pageModel.pageIdx += 1;

    const lastTripResult = this.pageModel.tripResults[this.pageModel.tripResults.length - 1];
    const fromDate = lastTripResult.fromDate;

    this.searchTrips(fromDate);
  }

  private computeTripHash(trip: OJP.Trip) {
    const tripHashParts: string[] = [];
    
    trip.legs.forEach(leg => {
      const keyParts: string[] = [];
      keyParts.push(leg.legType);
      
      if (leg.legType === 'TimedLeg') {
        const timedLeg = leg as OJP.TripTimedLeg;
        keyParts.push(timedLeg.service.formatServiceName());
        keyParts.push((timedLeg.computeDepartureTime() ?? new Date()).toISOString());
        keyParts.push((timedLeg.computeArrivalTime() ?? new Date()).toISOString());
      } else {
        const continousLeg = leg as OJP.TripContinousLeg;
        keyParts.push(continousLeg.formatDistance());
      }

      tripHashParts.push(keyParts.join('_'));
    });

    const tripHash = tripHashParts.join('==');

    return tripHash;
  }
}
