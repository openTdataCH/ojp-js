# OJP Javascript SDK

The OJP Javascript SDK is the client used for communication with [OJP APIs](https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/).

## Resources

- OJP Demo App: https://opentdatach.github.io/ojp-demo-app/ - web application which is using the OJP SDK
- npm `ojp-sdk` package: https://www.npmjs.com/package/ojp-sdk
- this repo [CHANGELOG](./CHANGELOG.md) file

## Usage

- include the `ojp-sdk` package in the `./package.json` dependencies of your project 

```
  "dependencies": {
    "ojp-sdk": "0.9.28"
  }
```

- update project dependencies

```
$ npm install
```

- include OJP SDK in the Typescript / Javascript code

```
import * as OJP from 'ojp-sdk'
```

- for more details check:
  - [OJP Demo App](https://github.com/openTdataCH/ojp-demo-app-src) source code
  - this repo [examples](./examples/) folder

## License

The project is released under a [MIT license](./LICENSE).

Copyright (c) 2021 - 2023 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
