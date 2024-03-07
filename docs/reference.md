# OJP SDK Reference

## OJP APIs Request

### Define/Choose API Stage

For all requests a `StageConfig` object is needed. 

```
export interface StageConfig {
    key: string
    apiEndpoint: string
    authBearerKey: string
}
```

For convenience the SDK is providing a default stage `DEFAULT_STAGE` otherwise a key will be needed from [opentransportdata.swiss](https://opentransportdata.swiss/en/). For possible endpoints check [app-config.ts](https://github.com/openTdataCH/ojp-demo-app-src/blob/main/src/app/config/app-config.ts#L13-L34) in OJP Demo App.

```
import * as OJP from 'ojp-sdk'

const stage = OJP.DEFAULT_STAGE;
```

### SDK members
- this SDK doesnt implement all members from [VDVde/OJP](https://github.com/VDVde/OJP) schema
- this SDK doesnt implement 1-1 members and properties from the schema

#### OJP API related objects

| Path | Classes |
|-|-|
| [src/location](../src/location/) | [Location](../src/location/location.ts), [GeoPosition](../src/location/geoposition.ts), [StopPlace](../src/location/stopplace.ts), etc |
| [src/request](../src/request/) | [LIR](../src/request/location-information/), [SER](../src/request/stop-event-request/), [TR](../src/request/trips-request/) XML fetch / request parsers |
| [src/situation](../src/situation/) | [SIRI-SX](https://opentransportdata.swiss/en/dataset/siri-sx) elements |
| [src/stop-event](../src/stop-event/) | [StopEvent](../src/stop-event/stop-event.ts)|
| [src/trip](../src/trip/) | [Trip](../src/trip/trip.ts), [TripTimedLeg](../src/trip/leg/trip-timed-leg.ts), [TripContinousLeg](../src/trip/leg/trip-continous-leg.ts), [LegTrack](../src/trip/leg/leg-track.ts) + other trip, trip legs related methods |
| [src/journey](../src/journey/) | [JourneyService](../src/journey/journey-service.ts) `TripTimedLeg` related |

- these objects are instantiated from the XML parser using `initWithTreeNode` static initializers by supplying [TreeNode](../src/xml/tree-node.ts) structs
- some of these objects (i.e. [Location](../src/location/location.ts)) can be instantiated using static initializers for coords, reference stops, etc
```
const locationBern = OJP.Location.initWithStopPlaceRef('8507000');
```

### OJP Requests

- LocationInformationRequest - [reference-lir.md](./reference-lir.md)
- TripRequest - [reference-tr.md](./reference-tr.md)
- StopEventRequest - [reference-ser.md](./reference-ser.md)

### XML fetch / parsing
- plain [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is used for network requests to OJP API backend
- all the requests are using [sax-js](https://github.com/isaacs/sax-js) for XML parsing
- XML parsing is done in an event-based (pull-parsing) manner
- see [src/request/base-parser.ts](../src/request/base-parser.ts) base parser implementation and LIR, TR, SER child classes implementation for the events used

---- 

Back to [Documentation](./README.md)

