import * as OJP from 'ojp-sdk'
import { exit } from 'process';

function computeDepartureRow(stopEventResultSchema) {
  const stopEvent = stopEventResultSchema.stopEvent;
  const journeyService = stopEvent.service;
  const serviceLineNumber = journeyService.publishedServiceName.text;
  
  const serviceLine = (() => {
    const isRail = journeyService.mode.ptMode === 'rail';

    if (isRail) {
      return serviceLineNumber ?? 'n/a'
    } else {
      const serviceLineParts = []
      if (journeyService.ptMode.shortName) {
        serviceLineParts.push(journeyService.ptMode.shortName.text);
      }
      serviceLineParts.push(serviceLineNumber ?? 'n/a');

      return serviceLineParts.join('');
    }
  })();

  const headingText = (() => {
    const lineParts = [];

    if (journeyService.destinationText) {
      lineParts.push(journeyService.destinationText.text);
    }

    return lineParts.join('');
  })();

  const stopData = (() => {
    const lineParts = [];
    stopEvent.onwardCall.forEach(callSchema => {
      const stopPointName = callSchema.callAtStop.stopPointName;
      if (stopPointName === null) {
        return;
      }

      lineParts.push(stopPointName.text);
    });

    return ' - ' + lineParts.join(' - ');
  })();

  const departureData = stopEvent.thisCall.callAtStop.serviceDeparture;
  
  const departureTimeF = (() => {
    if (departureData === null) {
      return 'n/a';
    }

    const departureDataDate = new Date(departureData.timetabledTime);
    return OJP.DateHelpers.formatTimeHHMM(departureDataDate);
  })();

  const delayText = (() => {
    if (departureData === null) {
      return '';
    }

    if (departureData.estimatedTime === undefined) {
      return '';
    }

    const timetableDate = new Date(departureData.timetabledTime);
    const estimatedDate = new Date(departureData.estimatedTime);

    const delayMinutes = OJP.DateHelpers.computeDelayMinutes(timetableDate, estimatedDate);
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
      number: journeyService.trainNumber,
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

async function main() {
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

  const sdkHTTP_Config = {
    url: 'https://api.opentransportdata.swiss/ojp20',
    authToken: null,
  };

  console.log('FETCH departures for ' + stopRef + ' ...');

  const sdk = OJP.SDK.create('CliApp.v1', sdkHTTP_Config, 'en');
  const request = OJP.StopEventRequest.initWithPlaceRefAndDate(stopRef, new Date());
  const response = await request.fetchResponse(sdk);

  console.log('... done FETCH');

  if (!response.ok) {
    console.log('response errror');
    console.log(request);
    console.log(response);
    exit(1);
  }

  console.log('--------------------------------------------------------------------------------------');
  console.log('| Service     | Heading                                     | Departure | Delay      |');
  console.log('--------------------------------------------------------------------------------------');
  
  response.value.stopEventResult.forEach(stopEventResultSchema => {
    const departureRow = computeDepartureRow(stopEventResultSchema);
    const serviceCell = (departureRow.service.line + ' ' + departureRow.journey.number).padEnd(11, ' ');
    const headingCell = departureRow.journey.headingText.padEnd(43, ' ');
    const timeCell = departureRow.departure.timeF.padEnd(9, ' ');
    const delayCell = departureRow.departure.delayText.padEnd(10, ' ');
    console.log('| ' + serviceCell + ' | ' + headingCell + ' | ' + timeCell + ' | ' + delayCell + ' |');
  });

  console.log('--------------------------------------------------------------------------------------');
}

await main()
