# OJP Javascript SDK

This branch hosts the Javascript SDK used for [OJP v1.0](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/) APIs. For [OJP v2.0](https://opentransportdata.swiss/de/cookbook/ojp2entwicklung/) usage please check [feature/ojp-sdk-next](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-sdk-next) branch.

See [Reference](./docs/reference.md) and [examples](./examples/) for usage.

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application this SDK
- [CHANGELOG](./CHANGELOG.md) for latest changes
- npm `ojp-sdk` package: https://www.npmjs.com/package/ojp-sdk

## Install

- include the `ojp-sdk-v1` package in the `./package.json` dependencies of your project 
```
  "dependencies": {
    "ojp-sdk-v1": "0.17.1"
  }
```

## Usage

- update project dependencies
```
$ npm install
```

- include OJP SDK in the Typescript / Javascript code
```
import * as OJP from 'ojp-sdk-v1'
```

- for more details check:
  - this repo [reference](./docs/reference.md)
  - this repo [examples](./examples/)
  - [OJP Demo App](https://github.com/openTdataCH/ojp-demo-app-src) source code

## License

The project is released under a [MIT license](./LICENSE).

Copyright (c) 2021 - 2025 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
