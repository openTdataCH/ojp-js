# CHANGELOG

## 0.9.23 - 09.01.2024
- add support to compute the trip distance from the individual legs

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