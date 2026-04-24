import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";
import { Place } from '../../../models/ojp';
import { OJPv1_TaxiModeEnum } from '../../legacy/v1/requests/tr';

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

  public abstract setOriginDurationDistanceRestrictions(operationMode: OJP_Types.PersonalModesOfOperationEnum, transportMode: OJP_Types.PersonalModesEnum, minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void;
  public abstract setDestinationDurationDistanceRestrictions(operationMode: OJP_Types.PersonalModesOfOperationEnum, transportMode: OJP_Types.PersonalModesEnum, minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void;

  public abstract setViaPlace(place: Place, dwellTime: number | null): void;

  public abstract setWalkRequest(): void;

  public abstract setMonomodalRequest(operationMode: OJP_Types.PersonalModesOfOperationEnum, transportMode: OJP_Types.PersonalModesEnum): void;

  public abstract setTaxiRequest(transportMode: OJPv1_TaxiModeEnum, endpointType: 'origin' | 'destination' | null, minDuration: number | null, maxDuration: number | null, minDistance: number | null, maxDistance: number | null): void;
}
