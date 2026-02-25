# OJP Javascript SDK

The OJP Javascript SDK is a Javascript/Typescript package used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

## Resources

- latest changes: [CHANGELOG](./CHANGELOG.md)
- npm `ojp-sdk` package: https://www.npmjs.com/package/ojp-sdk
- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application using this SDK

## Usage 

- get an API key from [opentransportdata.swiss](https://api-manager.opentransportdata.swiss/) API manager

- include [ojp-sdk](https://www.npmjs.com/package/ojp-sdk), [ojp-shared-types](https://www.npmjs.com/package/ojp-shared-types) packages in the `./package.json` dependencies of the project 
```
  "dependencies": {
    "ojp-shared-types": "0.1.6",
    "ojp-sdk": "0.22.2",
  }
```

- resources to use the SDK
  - this repo's playground app - [playground.component.ts](./examples/ojp-playground/src/app/playground/playground.component.ts)
  - SDK documentation: https://opentdatach.github.io/ojp-js
  - OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application using this SDK

### Create SDK

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

// create the SDK
const language = 'de'; // de, fr, it, en
const ojpSDK = OJP.SDK.create(requestorRef, httpConfig, language);
```

### Location Information Request (LIR)

Find locations by name, stop reference or inside a bounding box rectangle.

```
// case1 - build LIR by Name
const searchTerm = 'Bern';
const request = LocationInformationRequest.initWithLocationName('Bern');

// build LIR by StopRef
const stopRef = '8507000'; // Bern
const request2 = LocationInformationRequest.initWithPlaceRef(stopRef);

// build LIR by BBOX
// these are equivalent
let bbox: string | number[] = '7.433259,46.937798,7.475252,46.954805';
bbox = [7.433259, 46.937798, 7.475252, 46.954805];

const request3 =  ojpSDK.request.initWithBBOX(bbox, ['stop']);

// change XML payload if needed
request.payload.initialInput ...

// Fetch the results
async myMethod() {
  // ...
  const response = await request.fetchResponse(ojpSDK);

  if (!response.ok) {
    // handle error
    console.log(response.error);
    return;
  }

  // do something with the value
  const placeResults = response.value.placeResult ?? [];
  placeResults.forEach(placeResult => {
    console.log(placeResult.place.name);
  });
}
```

TBA
- update [docs](./docs/)

## License

The project is released under a [MIT license](./LICENSE).

Copyright (c) 2021 - 2026 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
