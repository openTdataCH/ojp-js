# OJP Javascript SDK

The OJP Javascript SDK is a Javascript/Typescript package used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

See [Reference](./docs/reference.md) and [examples](./examples/) for usage.

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application this SDK
- [CHANGELOG](./CHANGELOG.md) for latest changes
- npm `ojp-sdk` package: https://www.npmjs.com/package/ojp-sdk

## Install

Two versions of the OJP APIs can be used:
- [OJP 1.0](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/) - still supported by `ojp-js` SDK but might receive less support in the future
- [OJP 2.0](https://opentransportdata.swiss/de/cookbook/ojp2entwicklung/) - next version, see [VDVde/OJP](https://github.com/VDVde/OJP/blob/changes_for_v1.1/README.md) specs

### OJP 1.0
The  main branch of `ojp-js` repo is using OJP 1.0 APIs. The releases are published to [npmjs.com](https://www.npmjs.com/package/ojp-sdk) as `ojp-sdk` packages. 

- include the `ojp-sdk` package in the `./package.json` dependencies of your project 
```
  "dependencies": {
    "ojp-sdk": "0.9.33"
  }
```

### OJP 2.0
The [ojp-v2](https://github.com/openTdataCH/ojp-js/tree/feature/ojp-v2) branch is used for developing [OJP 2.0](https://opentransportdata.swiss/de/cookbook/ojp2entwicklung/) bindings, 
- include the `#ojp-v2` branch
```
  "dependencies": {
    "ojp-sdk": "git+https://github.com/openTdataCH/ojp-js.git#feature/ojp-v2"
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

Copyright (c) 2021 - 2024 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
