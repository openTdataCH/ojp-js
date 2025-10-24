# OJP Javascript SDK

**Note 2.Apr 2025**: The main branch of this repo is freezed for development / releases, see below table for reference

## Current Development Status

Javascript SDK branches

| Branch | NPM | Demo App | Description |
|-|-|-|-|
| [ojp-js#ojp-sdk-legacy](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-sdk-legacy) | [ojp-sdk-legacy](https://www.npmjs.com/package/ojp-sdk-legacy) | <ul><li>[PROD](https://opentdatach.github.io/ojp-demo-app/search)</li><li>[BETA v1](https://tools.odpch.ch/beta-ojp-demo/search)</li><li>[BETA v2](https://tools.odpch.ch/ojp-demo-v2/search)</li></ul> | original SDK, contains dual code for OJP `1.0`,`2.0` |
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

----

OJP Javascript SDK is a Javascript/Typescript package used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

See [Reference](./docs/reference.md) and [examples](./examples/) for usage.

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application this SDK
- [CHANGELOG](./CHANGELOG.md) for latest changes
- npm `ojp-sdk-legacy` package: https://www.npmjs.com/package/ojp-sdk-legacy

## Install

- include the `ojp-sdk-legacy` package in the `./package.json` dependencies of your project 
```
  "dependencies": {
    "ojp-sdk-legacy": "0.18.12"
  }
```

## Usage

- update project dependencies
```
$ npm install
```

- include OJP SDK in the Typescript / Javascript code
```
import * as OJP from 'ojp-sdk-legacy'
```

- for more details check:
  - this repo [reference](./docs/reference.md)
  - this repo [examples](./examples/)
  - [OJP Demo App](https://github.com/openTdataCH/ojp-demo-app-src) source code

## License

The project is released under a [MIT license](./LICENSE).

Copyright (c) 2021 - 2025 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
