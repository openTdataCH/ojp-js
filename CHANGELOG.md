# CHANGELOG

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