import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";

export type EndpointType = 'origin' | 'destination' | 'both';

export abstract class SharedTripRequest<S extends ResultSpec> extends BaseRequest<S> {
  public abstract setArrivalDatetime(newDatetime: Date): void;;
  public abstract setDepartureDatetime(newDatetime: Date): void;;
  
  public abstract setPublicTransportRequest(motFilter: OJP_Types.VehicleModesOfTransportEnum[] | null): void;
  public abstract setCarRequest(): void;
  public abstract setRailSubmodes(railSubmodes: OJP_Types.RailSubmodeEnum | OJP_Types.RailSubmodeEnum[]): void;

  public abstract enableLinkProkection(): void;
  public abstract disableLinkProkection(): void;
}
