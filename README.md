# OJP Javascript SDK

**Note 2.Apr 2025**: OJP v1.0 will be discontinued and this repo will be cloned into another project. [ojp-sdk-next](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-sdk-next) branch based on OJP v2.0 will replace this branch.

----

The OJP Javascript SDK is a Javascript/Typescript package used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

See [Reference](./docs/reference.md) and [examples](./examples/) for usage.

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application this SDK
- [CHANGELOG](./CHANGELOG.md) for latest changes
- npm `ojp-sdk-v1` package: https://www.npmjs.com/package/ojp-sdk-v1

## Install

Two versions of the OJP APIs can be used:
- [OJP 1.0](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/) - still supported by `ojp-js` SDK but might receive less support in the future
- [OJP 2.0](https://opentransportdata.swiss/de/cookbook/ojp2entwicklung/) - next version, see [VDVde/OJP](https://github.com/VDVde/OJP/blob/changes_for_v1.1/README.md) specs

### OJP 1.0
The  main branch of this repo is using OJP 1.0 APIs. The releases are published to [npmjs.com](https://www.npmjs.com/package/ojp-sdk-v1) as `ojp-sdk-v1` package. 


- include the `ojp-sdk-v1` package in the `./package.json` dependencies of your project 
```
  "dependencies": {
    "ojp-sdk-v1": "0.17.1"
  }
```

### OJP 2.0

see [ojp-sdk-next](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-sdk-next) branch

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
