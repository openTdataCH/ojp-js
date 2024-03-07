# LocationInformationRequest Reference

[src/request/location-information/location-information-request.ts](../src/request/location-information/location-information-request.ts)

- see [cookbook](https://opentransportdata.swiss/en/cookbook/location-information-service/) from opentransportdata.swiss
- see [ojp-playground](../examples/ojp-playground) examples

## Building Requests

The constructor takes `StageConfig` and `LocationInformationRequestParams` params but usually one of the static constructors are used

```
// 1) LIR lookup by name
const searchTerm = 'Bern';
const request1 = OJP.LocationInformationRequest.initWithLocationName(OJP.DEFAULT_STAGE, searchTerm);

// 2) LIR lookup by BBOX
// lookup locations by bbox coords (WGS84) 
// and location type: stop | poi_all

// BBOX coords
// SW corner (bottom-left)
const minLongitude = 7.433259;
const minLatitude = 46.937798;
// NE corner (top-right)
const maxLongitude = 7.475252;
const maxLatitude = 46.954805;

const request2 = OJP.LocationInformationRequest.initWithBBOXAndType(OJP.DEFAULT_STAGE, minLongitude, minLatitude, maxLongitude, maxLatitude, 'stop');

// 3) LIR lookup by stop reference
const stopRef = '8507000';
const request3 = OJP.LocationInformationRequest.initWithStopPlaceRef(OJP.DEFAULT_STAGE, stopRef);
```

## Parsing response

using async/await Promise
```
async method_name() {
    const request = OJP.LocationInformationRequest(..)
    
    const response = await request.fetchResponse();
    console.log(response);
}
````

using Promise.then
```
const request = OJP.LocationInformationRequest(..)
request.fetchResponse().then(response => {
    console.log(response);
});
````

## Response Structure

[src/request/types/location-information-request.type.ts](../src/request/types/location-information-request.type.ts)

```
type LIR_ParserMessage = "LocationInformation.DONE" | "ERROR";
export type LIR_Response = {
    locations: Location[]
    message: LIR_ParserMessage | null
}
```

----

Back to [OJP Reference](./reference.md)