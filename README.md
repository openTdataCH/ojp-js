# OJP Javascript SDK

**Note 2.Apr 2025**: The main branch of this repo is freezed for development.

- for [OJP v1.0](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/) - check [feature/ojp-v1](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-v1) branch. Features for this branch will receive less support in the future
- for [OJP v2.0](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/) - check [feature/ojp-sdk-next](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-sdk-next) branch. **OJP v2.0 branch has full support in development and will replace the main branch of this repo**

----

The OJP Javascript SDK is a Javascript/Typescript package used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

See [Reference](./docs/reference.md) and [examples](./examples/) for usage.

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application this SDK
- [CHANGELOG](./CHANGELOG.md) for latest changes
- npm `ojp-sdk` package: https://www.npmjs.com/package/ojp-sdk

## Install

- include the `ojp-sdk` package in the `./package.json` dependencies of your project 
```
  "dependencies": {
    "ojp-sdk-v1": "0.17.4"
  }
```

## Usage

- update project dependencies
```
$ npm install
```

- include OJP SDK in the Typescript / Javascript code
```
import * as OJP from 'ojp-sdk'
```

- for more details check:
  - this repo [reference](./docs/reference.md)
  - this repo [examples](./examples/)
  - [OJP Demo App](https://github.com/openTdataCH/ojp-demo-app-src) source code

## License

The project is released under a [MIT license](./LICENSE).

Copyright (c) 2021 - 2025 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
