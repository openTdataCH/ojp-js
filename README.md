# OJP Javascript SDK

The OJP Javascript SDK is a Javascript/Typescript package used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

See [docs](./docs/) and [examples](./examples/) for usage.

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application using this SDK
- [CHANGELOG](./CHANGELOG.md) for latest changes
- npm `ojp-sdk` package: https://www.npmjs.com/package/ojp-sdk

## Usage 

**Note:** 26.Mar - a different package name is used for test purpose: `ojp-sdk-next`

- include the `ojp-sdk` package in the `./package.json` dependencies of the project 
```
  "dependencies": {
    "ojp-sdk": "0.21.3"
  }
```

- get an API key from [opentransportdata.swiss](https://api-manager.opentransportdata.swiss/) API manager

- use the SDK, see also [playground.component.ts](./examples/ojp-playground/src/app/playground/playground.component.ts) in examples

```
import * as OJP from 'ojp-sdk';

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
  const placeResults = await this.ojpSDK.fetchPlaceResults(request1);

  // do something with the placeResult

  placeResults1.forEach(placeResult => {

  });
}
```

TBA
- update [docs](./docs/)

## License

The project is released under a [MIT license](./LICENSE).

Copyright (c) 2021 - 2025 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
