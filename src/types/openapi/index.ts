import { components as sharedComponents } from './generated/shared';

import { components as locationInformationRequestComponents } from './generated/ojp-location-request';
import { components as locationInformationResponseComponents } from './generated/ojp-location-response';
import { components as stopEventRequestComponents } from './generated/ojp-stop-event-request'
import { components as stopEventResponseComponents } from './generated/ojp-stop-event-response'
import { components as tripRequestComponents } from './generated/ojp-trip-request';
import { components as tripReponseComponents } from './generated/ojp-trip-response';

// TODO - this can be generated
export type UseRealtimeDataEnum = sharedComponents["schemas"]["UseRealtimeDataEnum"];
export type VehicleModesOfTransportEnum = sharedComponents["schemas"]["VehicleModesOfTransportEnum"];
export type PlaceTypeEnum = sharedComponents["schemas"]["PlaceTypeEnum"];

export type GeoPositionSchema = sharedComponents["schemas"]["GeoPosition"];
export type PlaceRefSchema = sharedComponents["schemas"]["PlaceRef"];
export type InternationalTextSchema = sharedComponents["schemas"]["InternationalText"];

export type DatedJourneySchema = sharedComponents["schemas"]["DatedJourney"];
export type CallAtStopSchema = sharedComponents["schemas"]["CallAtStop"];

export type PlaceContextSchema = sharedComponents["schemas"]["PlaceContext"];
export type PlaceSchema = sharedComponents['schemas']['Place']
export type StopPointSchema = sharedComponents['schemas']['StopPoint']
export type StopPlaceSchema = sharedComponents['schemas']['StopPlace']
export type TopographicPlaceSchema = sharedComponents['schemas']['TopographicPlace']
export type PointOfInterestSchema = sharedComponents['schemas']['PointOfInterest']
export type AddressSchema = sharedComponents['schemas']['Address']
export type PlaceModeStructureSchema = sharedComponents['schemas']['ModeStructure']

export type TripRequestOJP = tripRequestComponents["schemas"]["OJP"];
export type TripParamsSchema = tripRequestComponents["schemas"]["TripParam"];
export type TripRequestSchema = tripRequestComponents["schemas"]["OJPTripRequest"];

export type ViaPointSchema = tripRequestComponents["schemas"]["ViaPoint"];
export type ModeAndModeOfOperationFilterSchema = tripRequestComponents["schemas"]["ModeAndModeOfOperationFilter"];

export type TripStatusSchema = tripReponseComponents["schemas"]["TripStatus"];
export type TripSchema = tripReponseComponents["schemas"]["Trip"];
export type LegSchema = tripReponseComponents["schemas"]["Leg"];

export type TimedLegSchema = tripReponseComponents["schemas"]["TimedLeg"];
export type TransferLegSchema = tripReponseComponents["schemas"]["TransferLeg"];
export type ContinuousLegSchema = tripReponseComponents["schemas"]["ContinuousLeg"];

export type InitialInputSchema = locationInformationRequestComponents['schemas']['InitialInput']
export type LIR_RequestParamsSchema = locationInformationRequestComponents['schemas']['PlaceParam']
export type LocationInformationRequestOJP = locationInformationRequestComponents['schemas']['OJP']
export type LocationInformationRequestSchema = locationInformationRequestComponents['schemas']['OJPLocationInformationRequest']

export type PlaceResultSchema = locationInformationResponseComponents['schemas']['PlaceResult']

export type StopEventRequestSchema = stopEventRequestComponents['schemas']['OJPStopEventRequest']
export type SER_RequestLocationSchema = stopEventRequestComponents['schemas']['PlaceContext']
export type SER_RequestParamsSchema = stopEventRequestComponents['schemas']['StopEventParam']
export type SER_RequestOJP = stopEventRequestComponents['schemas']['OJP'];

export type StopEventResultSchema = stopEventResponseComponents['schemas']['StopEventResult']
export type StopEventSchema = stopEventResponseComponents['schemas']['StopEvent']
