# StopEventRequest Reference

[src/request/stop-event-request/stop-event-request.ts](../src/request/stop-event-request/stop-event-request.ts)

- see [cookbook](https://opentransportdata.swiss/en/cookbook/ojp-stopeventservice/) from opentransportdata.swiss
- see [ojp-playground](../examples/ojp-playground) examples

## Building Requests

The constructor takes `StageConfig` and `StopEventRequestParams` params but usually one of the static constructors are used

```
const stopRef = '8507000'; // Bern
const request1 = OJP.StopEventRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef, 'departure', new Date());

```

## Parsing response

a) using async/await Promise
```
const response1 = await request1.fetchResponse();
console.log(response1);
```

b) using Promise.then
```
request1.fetchResponse().then(response => {
    console.log('b) SER using Promise.then')
    console.log(response);
});
```

## Response Structure

[src/request/types/stop-event-request.type.ts](../src/request/types/stop-event-request.type.ts)

```
type StopEventRequest_ParserMessage = 'StopEvent.DONE' | 'ERROR';
export type StopEventRequest_Response = {
    stopEvents: StopEvent[]
    message: StopEventRequest_ParserMessage | null
}
```

----

Back to [OJP Reference](./reference.md)