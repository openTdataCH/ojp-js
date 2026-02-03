import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";
import { Place } from '../../../models/ojp';

export type EndpointType = 'origin' | 'destination' | 'both';

export abstract class SharedTripRequest<S extends ResultSpec> extends BaseRequest<S> {
  public abstract setArrivalDatetime(newDatetime: Date): void;;
  public abstract setDepartureDatetime(newDatetime: Date): void;;
  
  public abstract setPublicTransportRequest(motFilter: OJP_Types.VehicleModesOfTransportEnum[] | null): void;
  public abstract setCarRequest(): void;
  public abstract setRailSubmodes(railSubmodes: OJP_Types.RailSubmodeEnum | OJP_Types.RailSubmodeEnum[]): void;

  public abstract setMaxDurationWalkingTime(maxDurationMinutes: number | undefined, endpointType: EndpointType): void;

  public abstract enableLinkProkection(): void;
  public abstract disableLinkProkection(): void;

  public abstract setNumberOfResults(resultsNo: number | null): void;
  public abstract setNumberOfResultsAfter(resultsNo: number): void;
  public abstract setNumberOfResultsBefore(resultsNo: number): void;

  // https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__TripParamStructure
  public abstract setWalkSpeedDeviation(walkSpeedPercent: number): void;

  public abstract setOriginDurationDistanceRestrictions(minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void;
  public abstract setDestinationDurationDistanceRestrictions(minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void;

  public abstract setViaPlace(place: Place, dwellTime: number | null): void;
}
