# CHANGELOG

## 0.18.7 - 05.06.2025
- Unify OJP branches - [PR #174](https://github.com/openTdataCH/ojp-js/pull/177)
  - use new package name `ojp-sdk-legacy` - https://www.npmjs.com/package/ojp-sdk-legacy
  - Remove `OJP_VERSION`, `REQUESTOR_REF` - they will be used in the integrators
  - allow the OJP version `1.0` | `2.0` to be set from the integrators

## 0.18.6 - 03.06.2025
- JourneyService Updates - [PR #174](https://github.com/openTdataCH/ojp-js/pull/174)
  - compute correct `journeyNumber` for OJP v1.0
  - remove `computePlatformAssistance` helper outside of the SDK, will be used by consumers
  - expose `MapFareClassOccupancy`

## 0.18.5 - 13.05.2025
- remove OJP FareRequest, will be replaced with standalone [ojp-fares-js](https://github.com/openTdataCH/ojp-fares-js) SDK - [PR #165](https://github.com/openTdataCH/ojp-js/pull/165)

## 0.18.4 - 09.05.2025
- parse OccupancyLevel - [Occupancy in OJP 2.0 #223](https://github.com/openTdataCH/ojp-demo-app-src/issues/223), [PR #160](https://github.com/openTdataCH/ojp-js/pull/160)
- adds `InfoLink` to `PassengerInformationAction` - [TR / Siri Situations - Display labels / hyperlinks #224](https://github.com/openTdataCH/ojp-demo-app-src/issues/224), [PR #161](https://github.com/openTdataCH/ojp-js/pull/161)
- fix `StopEventRequest` request - [Fix SER Request #162](https://github.com/openTdataCH/ojp-js/issues/162), [PR #163](https://github.com/openTdataCH/ojp-js/pull/163)

## 0.18.2 - 02.05.2025
- extends `TransferType` to parse also `changeWithinVehicle` enum - [Visualisation of "ChangeWithinVehicle" #215](https://github.com/openTdataCH/ojp-demo-app-src/issues/215), [PR #156](https://github.com/openTdataCH/ojp-js/pull/156)

## 0.18.1 - 30.04.2025
- Unify OJP 1.0 and 2.0 SDK code - [PR #155](https://github.com/openTdataCH/ojp-js/pull/155)
  - adds conditional code to handle between OJP v1.0 and OJP v2.0 logic
    - difference between branches will be only in `constants.ts`
  - adds config-based XML builder / parser 
  - fixed `Continous` as `Continuous` typo
  - serialise more Trip/Service XML members - needed for TRR
  - more formatting and code consolidation between SDKs

## 0.17.4 - 3.04.2025
- fix Journey Service attribute codes - [PR #144](https://github.com/openTdataCH/ojp-js/pull/144)
  - [TR: catch attributes that are not standard #210](https://github.com/openTdataCH/ojp-demo-app-src/issues/210)

## 0.17.3 - 2.04.2025
- updates TR, SER requests - [PR #143](https://github.com/openTdataCH/ojp-js/pull/143)
  - let the client handle the service attribute code - [TR: catch attributes that are not standard #210](https://github.com/openTdataCH/ojp-demo-app-src/issues/210)
  - allow the clients to set TR, SER `UseRealtimeData` enum. Only in v2 - [Selection for UseRealtimeData in OJP 2.0 #209](https://github.com/openTdataCH/ojp-demo-app-src/issues/209)

## 0.17.2 - 2.04.2025
- disable `IncludeRealtimeData` for SER requests v1.0 OJP - [Wrong parameter in OJP 1.0 TR & SER #208](https://github.com/openTdataCH/ojp-demo-app-src/issues/208)

## 0.17.1 - 2.04.2025
- changed package name to `ojp-sdk-v1` - [PR #141](https://github.com/openTdataCH/ojp-js/pull/141)
  - prepare to extract the OJP v1.0 SDK code into a separate repo

## 0.16.3 - 24.03.2025
- internal change, refactor params/request implementation - [PR #137](https://github.com/openTdataCH/ojp-js/pull/137)
- adds hack for OJP-SI to allow Trip nodes without Transfer children node - [PR #138](https://github.com/openTdataCH/ojp-js/pull/138)

## 0.16.2 - 3.03.2025
- Changes namespaces - [PR #135](https://github.com/openTdataCH/ojp-js/pull/135)
  - make `siri:` default namespace
  - patch LIR `PointOfInterest` to allow also none categories (support for OJP-SI)

## 0.16.1 - 6.02.2025
- Updates OJP Fare - [PR #134](https://github.com/openTdataCH/ojp-js/pull/134)
  - refactor ApiConfig, removes default stages from SDK

## 0.15.2 - 21.01.2025
- updates package, adds dependencies, disable request logs by default - [PR #132](https://github.com/openTdataCH/ojp-js/pull/132)

## 0.15.1 - 15.12.2024
- updates nova fares - [PR #130](https://github.com/openTdataCH/ojp-js/pull/130)

## 0.14.2 - 09.12.2024
- fix `PtModeFilter` - [PR #129](https://github.com/openTdataCH/ojp-js/pull/129)

## 0.14.1 - 05.12.2024
- remove `@types/mapbox-gl` - [PR #125](https://github.com/openTdataCH/ojp-js/pull/125)
- flexible `TimedLeg` Service init - [PR #126](https://github.com/openTdataCH/ojp-js/pull/126)
- expose OJP backend version (1.0 or 2.0) - [PR #127](https://github.com/openTdataCH/ojp-js/pull/127)

## 0.13.2 - 26.11.2024
- fix multi-modal TR  - [Sharing doesn't work anymore #179](https://github.com/openTdataCH/ojp-demo-app-src/issues/179) - [PR #123](https://github.com/openTdataCH/ojp-js/pull/123)

## 0.13.1 - 19.11.2024
- adds TripRrequest filter for public transport modes - [Adds mean of transport (bus, boat, etc.) option in the TR #170](https://github.com/openTdataCH/ojp-demo-app-src/issues/170) - [PR #119](https://github.com/openTdataCH/ojp-js/pull/119)
  - BREAKING CHANGE - extract client specific code from SDK
- refactor `NumberOfResults` - [PR #121](https://github.com/openTdataCH/ojp-js/pull/121)
  - BREAKING CHANGE - allow also to give NumberOfResultsBefore and NumberOfResultsAfter, all optional, this way no need to send the NumberOfResultsType

## 0.12.7 - 30.10.2024
- Fix Service real-time info parsing - [PR #117](https://github.com/openTdataCH/ojp-js/pull/117)

## 0.12.6 - 29.10.2024
- adds ALTERNATIVE_TRANSPORT VehicleAccessType, [New BehiG Info Icon #169](https://github.com/openTdataCH/ojp-demo-app-src/issues/169) - [PR #114](https://github.com/openTdataCH/ojp-js/pull/114)
- simplify SIRI-SX situations creation - [PR #115](https://github.com/openTdataCH/ojp-js/pull/115)

## 0.12.5 - 07.10.2024
- TripRequest updates - [PR #111](https://github.com/openTdataCH/ojp-js/pull/111)
  - implement custom additional restrictions `min/max` `Duration/Distance`, they can be turned on/off on individual basis 
  - adds via `DwellTime` support - [PR #110](https://github.com/openTdataCH/ojp-js/pull/110)
  - adds `foot` IndividualTransportMode, is used by OJP 2.0
  - fares: expose `FareProductName`

## 0.12.4 - 17.09.2024
- Customize `NumberOfResults` - [PR #108](https://github.com/openTdataCH/ojp-js/pull/108) 

## 0.12.3 - 17.09.2024
- Remove `ModeAndModeOfOperationFilter/siri:WaterSubmode` which is for OJP2 - [PR #106](https://github.com/openTdataCH/ojp-js/pull/106) 

## 0.12.2 - 17.09.2024
- Fix `Via` `TripRequest` params - [PR #104](https://github.com/openTdataCH/ojp-js/pull/104)

## 0.12.1 - 16.09.2024
- Adds support for Via locations - [PR #102](https://github.com/openTdataCH/ojp-js/pull/102)
- Complete the `TripRequest.initWithTripLocationsAndDate` constructor to use all params - [PR #102](https://github.com/openTdataCH/ojp-js/pull/102)
- BREAKING CHANGE - remove JourneyRequest API, no more need for this, was added to support via using multiple `TripRequest` requests - [PR #102](https://github.com/openTdataCH/ojp-js/pull/102)
- Adds Cancelled, Deviation, Unplanned support for Service - [PR #101](https://github.com/openTdataCH/ojp-js/pull/101)
- BREAKING CHANGE - updates situations model - [PR #101](https://github.com/openTdataCH/ojp-js/pull/101)
- Update `StopEvent` situations: use also line/route situations from Service - [PR #100](https://github.com/openTdataCH/ojp-js/pull/100)

## 0.11.1 - 28.08.2024
- OJP localization support - [PR #96](https://github.com/openTdataCH/ojp-js/pull/96)
  - BREAKING CHANGE - adds language param to all request API calls
- log OJP requests for `DEBUG` envs - [PR #98](https://github.com/openTdataCH/ojp-js/pull/98)

## 0.10.2 - 27.08.2024
- Fix situations parser - [PR #94](https://github.com/openTdataCH/ojp-js/pull/94)
  - In v1 there is no `<SituationFullRefs>` container
  - validate situations on DEBUG stages
  - allow situations with empty description / detail
- Fix TripInfoRequest params - [PR #93](https://github.com/openTdataCH/ojp-js/pull/93)

## 0.10.1 - 27.08.2024
- [Updates situations/traffic/real-time info #91](https://github.com/openTdataCH/ojp-js/pull/91)
  - BREAKING CHANGE - SIRI-SX situations model changed
  - BREAKING CHANGE  - `StationBoardModel` is removed from the SDK, should be implemented in the integrator
  - for TR send `UseRealtimeData`=`explanatory` to capture real-time info
  - adds support for trips with `Cancelled`, `Infeasable` Trip status
  - adds support for `NotServicedStop` property for TimedLeg points

## 0.9.36 - 26.08.2024
- updates SDK version to `0.9.36` - [PR #90](https://github.com/openTdataCH/ojp-js/pull/90)
- adds `TripInfoRequest` support - [PR #87](https://github.com/openTdataCH/ojp-js/pull/87)
- adds `NumberOfResultsType` to handle previous / next `TripResult` connections - [PR #86](https://github.com/openTdataCH/ojp-js/pull/86)
- adds `Trip` and `TripRequestResponse` XML serialization support- [PR #89](https://github.com/openTdataCH/ojp-js/pull/89)
- fix circular dependency - [PR #85](https://github.com/openTdataCH/ojp-js/pull/85)

## 0.9.35 - 27.06.2024
- updates SDK version to `0.9.35` - [PR #84](https://github.com/openTdataCH/ojp-js/pull/84)
- adds support for car water-ferry / car-shuttle train - [PR #80](https://github.com/openTdataCH/ojp-js/pull/80), [PR #82](https://github.com/openTdataCH/ojp-js/pull/80)
- remove sorting of trips for special cases, should be done in the integrators - [PR #83](https://github.com/openTdataCH/ojp-js/pull/83)

## 0.9.34 - 21.06.2024
- updates SDK version to `0.9.34` - [PR #79](https://github.com/openTdataCH/ojp-js/pull/79)
- add support for `TransferMode`, improve `LegTransportMode` - [PR #78](https://github.com/openTdataCH/ojp-js/pull/78)

## 0.9.33 - 17.05.2024
- updates SDK version to `0.9.33` - [PR #77](https://github.com/openTdataCH/ojp-js/pull/77)
- **BREAKING CHANGE**: change restriction type in `LocationInformationRequest`: update types and use an array for restriction types (i.e. [`stop`, `address`]) - [PR #73](https://github.com/openTdataCH/ojp-js/pull/73)
- adds `GeoRestriction/Circle` to LIR - [PR #74](https://github.com/openTdataCH/ojp-js/pull/74)
- adds support for car-shuttle-train (Autoverladezug) - [PR #75](https://github.com/openTdataCH/ojp-js/pull/75)
- improve `Location/Address` - [PR #71](https://github.com/openTdataCH/ojp-js/pull/71)
- improve requests: allow LIR requests to use mocked XMLs, adds generic `XMLParser`, adds center min, max long/lat members for GeoPositionBBOX - [PR #72](https://github.com/openTdataCH/ojp-js/pull/72)

## 0.9.32 - 24.03.2024
- updates SDK version to `0.9.32` - [PR #70](https://github.com/openTdataCH/ojp-js/pull/70)
- allow `StageConfig` to be passed to mock requests - [PR #69](https://github.com/openTdataCH/ojp-js/pull/69)

## 0.9.31 - 10.03.2024
- updates SDK version to `0.9.31` - [PR #68](https://github.com/openTdataCH/ojp-js/pull/68)
- add tests  - [Add tests #67](https://github.com/openTdataCH/ojp-js/pull/67) - [PR #66](https://github.com/openTdataCH/ojp-js/pull/66)
- update docs  - [Adds docs SDK, update APIs #63](https://github.com/openTdataCH/ojp-js/pull/63) - [PR #65](https://github.com/openTdataCH/ojp-js/pull/65)

## 0.9.30 - 09.03.2024
- updates SDK version to `0.9.30` - [PR #64](https://github.com/openTdataCH/ojp-js/pull/64)
- updates `TripRequest` API - [PR #62](https://github.com/openTdataCH/ojp-js/pull/62)
- fix `Location.POI` shared mobility attributes - [issue #60](https://github.com/openTdataCH/ojp-js/issues/60) - [PR #61](https://github.com/openTdataCH/ojp-js/pull/61)
- adds OJP Fare Support - [OJP Fare Support #57](https://github.com/openTdataCH/ojp-js/issues/57) - [PR #57](https://github.com/openTdataCH/ojp-js/pull/57)
- adds PoC for TripRequest pagination - [Create PoC exmaple for TripRequest pagination](https://github.com/openTdataCH/ojp-js/issues/59) - [PR #56](https://github.com/openTdataCH/ojp-js/pull/56)

## 0.9.29 - 02.03.2024
- expose `JourneyService` attributes - [PR #53](https://github.com/openTdataCH/ojp-js/pull/53)
- adds `Dep/Arr` option for TripRequest requests - [PR #54](https://github.com/openTdataCH/ojp-js/pull/54)
- updates SDK version to `0.9.29` - [PR #55](https://github.com/openTdataCH/ojp-js/pull/55)

## 0.9.28 - 16.02.2024
- fix `sax` lib import - [PR #49](https://github.com/openTdataCH/ojp-js/pull/49)

## 0.9.25 - 15.02.2024
- improve OJP APIs parser - [PR #43](https://github.com/openTdataCH/ojp-js/pull/43)
- adds platform assistance - [PR #44](https://github.com/openTdataCH/ojp-js/pull/44)
- updates SDK version to `0.9.25` - [PR #45](https://github.com/openTdataCH/ojp-js/pull/45)

## 0.9.24 - 14.01.2024
- migrate to a SAX-based parser for handling OJP API responses - [PR #41](https://github.com/openTdataCH/ojp-js/pull/41)

## 0.9.23 - 09.01.2024
- add support to compute the trip distance from the individual legs - [PR #40](https://github.com/openTdataCH/ojp-js/pull/40)

## 0.9.22 - 11.12.2023
- adds support for node v20 in [examples](./examples/)

## 0.9.21 - 11.12.2023
- cleanup left-overs

## 0.9.20 - 28.10.2023
- improve handling of coordinates in `Location` objects - [PR #34](https://github.com/openTdataCH/ojp-js/pull/34)

## 0.9.19 - 15.10.2023
- adds [SIRI-SX](https://opentransportdata.swiss/en/siri-sx/) to `StopPoint` - [PR #32](https://github.com/openTdataCH/ojp-js/pull/32)

## 0.9.18 - 08.10.2023
- allow better parsing of coordinates / names, support for [Embed OJP Demo in other websites #45](https://github.com/openTdataCH/ojp-demo-app-src/issues/45), [PR #31](https://github.com/openTdataCH/ojp-js/pull/31)
- adds new POI categories `other`, `sbb_services` [adapt POI categories #5](https://github.com/openTdataCH/ojp-demo-app/issues/5)

## 0.9.17 - 10.09.2023
- adds support for [SIRI-SX](https://opentransportdata.swiss/en/siri-sx/) messages - [PR #30](https://github.com/openTdataCH/ojp-js/pull/30)

## 0.9.16 - 16.07.2023
- adds support for `others-drive-car` (limo) IndividualTransportMode - see [#87](https://github.com/openTdataCH/ojp-demo-app-src/issues/87)
- remove `La Beta` stage hack for number of results in `OJP.TripRequest` calls

## 0.9.15 - 02.07.2023
- [PR #27](https://github.com/openTdataCH/ojp-js/pull/27)
- pretty print the XML payload in the OJP APIs calls
- `NumberOfResultsAfter` is now default in the `OJP.TripRequest` calls
- use `PrivateModeFilter` for the OJP APIs calls
- add helpers for reuse of the `OJP.StopEventRequest` calls

## 0.9.14 - 23.05.2023
- `OJP.TripRequest` changes - see [PR #26](https://github.com/openTdataCH/ojp-js/pull/26)
  - restore `ojp:DepArrTime`
  - allow toggling of the `<ojp:IncludeLegProjection>` param
  - allow usage of either `ojp:NumberOfResultsAfter` or `ojp:NumberOfResults` param

## 0.9.13 - 14.05.2023
- use strings for `StageConfig.key`, dont force the consumer to use only predefined OJP stages - see [#24](https://github.com/openTdataCH/ojp-js/pull/24)
- adds support for taxi mode in `OJP.TripRequest` - see [#87](https://github.com/openTdataCH/ojp-demo-app-src/issues/87), see PR [#25](https://github.com/openTdataCH/ojp-js/pull/25)

## 0.9.12 - 23.04.2023
- small changes - see [#23](https://github.com/openTdataCH/ojp-js/pull/23)
  - exports `Duration` for external usage
  - adds support for `taxi` IndividualTransportMode in `TripRequest` calls

## 0.9.11 - 07.04.2023
- fix dependencies inclusion - see [#20](https://github.com/openTdataCH/ojp-js/pull/20)
  - avoid usage of `allowSyntheticDefaultImports` by using `import * as`
  - declare `GeoJSON` types
  - no need to import the heavy mapbox-gl lib, just need the TS `@types`
- adds default stage to be used without registering a new key - see [#21](https://github.com/openTdataCH/ojp-js/pull/21)
- adds [./examples](./examples) projects

## 0.9.10 - 02.04.2023
- fix `xmldom` inclusion - see [#19](https://github.com/openTdataCH/ojp-js/pull/19)

## 0.9.9 - 02.04.2023
- various small fixes - see [#18](https://github.com/openTdataCH/ojp-js/pull/18)

## 0.9.8 - 02.04.2023
- use `cross-fetch` and `xmldom` to enable usage also from command line - see [#17](https://github.com/openTdataCH/ojp-js/pull/17)
  - use `ES6` for both target and module 
- add plus functionality to duration - see [#16](https://github.com/openTdataCH/ojp-js/pull/16)

## 0.9.7 - 12.03.2023
- adds `Location` Probability and OriginSystem - see [#15](https://github.com/openTdataCH/ojp-js/pull/15)

## 0.9.6 - 12.03.2023
- improve TripRequest - see [#14](https://github.com/openTdataCH/ojp-js/pull/14)
  - removed `ojp:NumberOfResults`, keep it only for TEST LA
  - `IndividualTransportOptions` is used only for monomodal, walk | cycle (own bicyicle) modes - with different max duration params
  - use `ItModesToCover` for walk | self drive | cycle modes
  - use OJP `Extension` for bicycle_rental | car_sharing | escooter_rental modes
- other changes - see [#13](https://github.com/openTdataCH/ojp-js/pull/13)
  - use `self-drive-car` type for car sharing response types
  - fix on-demand bus mode that was matching also the normal bus routes
  - add types to `Location` object so we can differentiate between Stop, POI, TopographicPlace and Address
  - LIR name lookup requests can also filter by type, i.e. `Stop`
  - adjust BBOX for the trips to include also the leg polylines

## 0.9.5 - 19.02.2023
- fix for broken taxi / booking data - see [OJP demo app extension #87](https://github.com/openTdataCH/ojp-demo-app-src/issues/87), [#12](https://github.com/openTdataCH/ojp-js/pull/12)

## 0.9.4 - 19.02.2023
- Expose `ojp:LocationExtensionStructure` nodes from `Location` - see [Showing multiple Charging Points of One Charging Station #68](https://github.com/openTdataCH/ojp-demo-app-src/issues/68), [#9](https://github.com/openTdataCH/ojp-js/pull/9)
- Adds support for more values of on-demand bus mode - [#10](https://github.com/openTdataCH/ojp-js/pull/10)
- Adds support for taxi / booking via `ojp:BookingArrangements/ojp:BookingArrangement` - see [OJP demo app extension #87](https://github.com/openTdataCH/ojp-demo-app-src/issues/87), [#11](https://github.com/openTdataCH/ojp-js/pull/11)

## 0.9.3 - 22.01.2023
- Show transfer path guidance on the map - see [#5](https://github.com/openTdataCH/ojp-js/pull/5)
- Updates documentation - see [#6](https://github.com/openTdataCH/ojp-js/pull/6)
- Adds support for Location TopographicPlace - see [#7](https://github.com/openTdataCH/ojp-js/pull/7)

## 0.9.2 - 14.01.2023
- keep app stages in the OJP Demo app, outside of the SDK

## 0.9.1 - 23.11.2022
- updates documentation

## 0.9.0 - 20.11.2022
- initial commit
