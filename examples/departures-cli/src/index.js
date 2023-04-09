import * as OJP from 'ojp-sdk'
import { exit } from 'process';

function computeDepartureRow(stopEvent) {
  const journeyService = stopEvent.journeyService;
  const serviceLineNumber = journeyService.serviceLineNumber;
  
  const serviceLine = (() => {
    if (journeyService.ptMode.isRail()) {
      return serviceLineNumber ?? 'n/a'
    } else {
      const serviceLineParts = []
      if (journeyService.ptMode.shortName) {
        serviceLineParts.push(journeyService.ptMode.shortName)
      }
      serviceLineParts.push(serviceLineNumber ?? 'n/a')

      return serviceLineParts.join('');
    }
  })();

  const headingText = (() => {
    const lineParts = [];

    if (journeyService.destinationStopPlace) {
      lineParts.push(journeyService.destinationStopPlace.stopPlaceName);
    }

    return lineParts.join('');
  })();

  const stopData = (() => {
    const lineParts = [];
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
  
  const departureTimeF = (() => {
    if (departureData === null) {
      return 'n/a';
    }

    return OJP.DateHelpers.formatTimeHHMM(departureData.timetableTime);
  })();

  const delayText = (() => {
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

  const departureRow = {
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

function main() {
  const params = process.argv.slice(2);
  if (params.length === 0) {
    console.error('ERROR: expecting at least one parameter');
    exit(1)
  }

  const mapStopRefs = {
    'BERN': '8507000',
    'BERN_BAHNHOF': '8576646',
    'ZUERICH': '8503000',
    'BASEL': '8500010',
    'BASEL_BAD': '8500090',
  }
  const stopRef = params[0] ?? mapStopRefs.BERN_BAHNHOF;

  const request = OJP.StopEventRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef, 'departure', new Date());
  console.log('FETCH departures for ' + stopRef + ' ...');
  request.fetchResponse().then(stopEvents => {
    console.log('--------------------------------------------------------------------------------------');
    console.log('| Service     | Heading                                     | Departure | Delay      |');
    console.log('--------------------------------------------------------------------------------------');
    stopEvents.forEach(stopEvent => {
      const departureRow = computeDepartureRow(stopEvent);
      const serviceCell = (departureRow.service.line + ' ' + departureRow.journey.number).padEnd(11, ' ');
      const headingCell = departureRow.journey.headingText.padEnd(43, ' ');
      const timeCell = departureRow.departure.timeF.padEnd(9, ' ');
      const delayCell = departureRow.departure.delayText.padEnd(10, ' ');
      console.log('| ' + serviceCell + ' | ' + headingCell + ' | ' + timeCell + ' | ' + delayCell + ' |');
    });
    console.log('--------------------------------------------------------------------------------------');
  });
}

main()
