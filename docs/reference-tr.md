# TripRequest Reference

[src/request/location-information/location-information-request.ts](../src/request/trips-request/trips-request.ts)

- see [cookbook](https://opentransportdata.swiss/en/cookbook/ojptriprequest/) from opentransportdata.swiss
- see [ojp-playground](../examples/ojp-playground) examples

## Building Requests

The constructor takes `StageConfig` and `TripsRequestParams` params but usually one of the static constructors are used

```
const fromLocation = OJP.Location.initWithStopPlaceRef('8507000'); // Bern
const toLocation = OJP.Location.initWithStopPlaceRef('8503000'); // Zürich

const request1 = OJP.TripRequest.initWithLocationsAndDate(OJP.DEFAULT_STAGE, fromLocation, toLocation, new Date());
if (request1 === null) {
    // handle invalid requests
    return;
}
```

## Parsing response

a) using async/await Promise
```
const response1 = await request1.fetchResponse();
console.log('a) TR using await/async')
console.log(response1);
```

b) using Promise.then
```
request1.fetchResponse().then(response => {
    console.log('b) TR using Promise.then')
    console.log(response);
});
```

c) using using a callback. The XML parsing might some time for processing therefore using a callback can allow the GUI to react quickly when having partial results
```
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
```

## Response Structure

[src/request/types/trip-request.type.ts](../src/request/types/trip-request.type.ts)

```
export type TripRequest_ParserMessage = 'TripRequest.TripsNo' | 'TripRequest.Trip' | 'TripRequest.DONE' | 'ERROR';
export type TripRequest_Response = {
    tripsNo: number
    trips: Trip[]
    message: TripRequest_ParserMessage | null
}
```

----

Back to [OJP Reference](./reference.md)