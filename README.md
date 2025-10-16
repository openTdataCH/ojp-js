# OJP Javascript SDK

The OJP Javascript SDK is a Javascript/Typescript package used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

## Current Development Status

Javascript SDK branches

| Branch | NPM | Demo App | Description |
|-|-|-|-|
| [ojp-js#ojp-sdk-legacy](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-sdk-legacy) | [ojp-sdk-legacy](https://www.npmjs.com/package/ojp-sdk-legacy) | <ul><li>[PROD - OJP 2.0](https://opentdatach.github.io/ojp-demo-app/search)</li><li>[BETA - OJP 1.0](https://tools.odpch.ch/beta-ojp-demo/search)</li></ul> | original SDK, contains dual code for OJP `1.0`,`2.0` |
| [ojp-js#ojp-sdk-next](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-sdk-next) | [ojp-sdk-next](https://www.npmjs.com/package/ojp-sdk-next) - temporarely, long-term will be published under `ojp-sdk` | under development | new SDK code with models derived from XSD schema, this will be the main development reference for OJP JS SDK |

Code / Demo App Implementation

| Code Place | LIR | SER | TR | TIR | FR | TRR | Comments |
| - | - | - | - | - | - | - | - |
| `ojp-sdk-legacy` (legacy SDK) | :white_check_mark: | :white_check_mark: | :white_check_mark: | - | - | - | TRR is only available for OJP v2.0 |
| `ojp-sdk-next` (new SDK) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |  |
| DemoApp Beta | `legacy` | `legacy` | `legacy` | `ojp-sdk-next` | `ojp-sdk-next` | `ojp-sdk-next` | `legacy` is the old SDK (OJP v1 and v2, see above) |

- LIR - LocationInformationRequest
- SER - StopEventRequest
- TR - TripRequest
- TIR - TripInfoRequest
- FR - FareRequest
- TRR - TripRefineRequest

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application using this SDK
- [CHANGELOG](./CHANGELOG.md) for latest changes
- npm `ojp-sdk` package: https://www.npmjs.com/package/ojp-sdk

## Usage 

**Note:** 26.Mar - a different package name is used for test purpose: `ojp-sdk-next`. This package will replace the current `ojp-sdk` package.

- include [ojp-sdk-next](https://www.npmjs.com/package/ojp-sdk-next), [ojp-shared-types](https://www.npmjs.com/package/ojp-shared-types) packages in the `./package.json` dependencies of the project 
```
  "dependencies": {
    "ojp-shared-types": "0.0.18",
    "ojp-sdk-next": "0.20.29",
  }
```

- get an API key from [opentransportdata.swiss](https://api-manager.opentransportdata.swiss/) API manager

- use the SDK, see also [playground.component.ts](./examples/ojp-playground/src/app/playground/playground.component.ts) in examples

```
import * as OJP from 'ojp-sdk-next';

// ...

// declare the stage config, PROD example below
const httpConfig: OJP.HTTPConfig = {
  url: 'https://api.opentransportdata.swiss/ojp20',
  authToken: 'TOKEN_FROM_opentransportdata.swiss',
};

// define a requestorRef that describes the client
const requestorRef = 'MyExampleTransportApp.v1';

// define the SDK i18n language
const language = 'de'; // de, fr, it, en
const ojpSDK = new OJP.SDK(requestorRef, httpConfig, language);

// build LIR by Name
const searchTerm = 'Bern';
const request1 = OJP.LocationInformationRequest.initWithLocationName(searchTerm);

// build LIR by StopRef
const stopRef = '8507000'; // Bern
const request2 = OJP.LocationInformationRequest.initWithPlaceRef(stopRef);

// build LIR by BBOX
// these are equivalent
let bbox: string | number[] = '7.433259,46.937798,7.475252,46.954805';
bbox = [7.433259, 46.937798, 7.475252, 46.954805];

const request3 =  OJP.LocationInformationRequest.initWithBBOX(bbox, ['stop']);

// fetch the results
async myMethod() {
  // ...
  const response = await this.ojpSDK.fetchLocationInformationRequestResponse(request1);

  if (!response.ok) {
    // handle error
    console.log(response.error);
    return;
  }

  // do something with the value
  comnst placeResults = response.value.placeResult ?? [];
  placeResults.forEach(placeResult => {

  });
}
```

TBA
- update [docs](./docs/)

## License

The project is released under a [MIT license](./LICENSE).

Copyright (c) 2021 - 2025 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
