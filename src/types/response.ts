import * as OJP_Types from 'ojp-shared-types';

type ResponseOk<T> = { ok: true; value: T };
type ResponseError<E> = { ok: false; error: E };
type OJP_Response<T, E> = ResponseOk<T> | ResponseError<E>;

export type TripRequestResponse = OJP_Response<OJP_Types.TripDeliverySchema, Error>;

export type LocationInformationRequestResponse = OJP_Response<OJP_Types.LocationInformationDeliverySchema, Error>;
export type OJPv1_LocationInformationRequestResponse = OJP_Response<OJP_Types.OJPv1_LocationInformationDeliverySchema, Error>;

export type StopEventRequestResponse = OJP_Response<OJP_Types.StopEventDeliverySchema, Error>;
export type TripRefineRequestResponse = OJP_Response<OJP_Types.TRR_DeliverySchema, Error>;
export type TripInfoRequestResponse = OJP_Response<OJP_Types.TripInfoDeliverySchema | OJP_Types.OJPv1_TripInfoDeliverySchema, Error>;
export type FareRequestResponse = OJP_Response<OJP_Types.FareDeliverySchema, Error>;
