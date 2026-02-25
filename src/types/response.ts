import * as OJP_Types from 'ojp-shared-types';

/**
 * Type definitions for OJP API response types.
 * 
 * Each response type is a union of success and error states, following the pattern:
 * - { ok: true; value: T } for successful responses
 * - { ok: false; error: E } for failed responses
 * 
 */
type ResponseOk<T> = { ok: true; value: T };
type ResponseError<E> = { ok: false; error: E };
type OJP_Response<T, E> = ResponseOk<T> | ResponseError<E>;

/**
 * FR Response (OJP 1.0)
 * 
 * @category Response OJP 1.0
 */
export type FareRequestResponse = OJP_Response<OJP_Types.FareDeliverySchema, Error>;

/**
 * LIR Response
 * 
 * @see {@link https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__OJPLocationInformationDeliveryStructure }
 * 
 * @category Response
 */
export type LocationInformationRequestResponse = OJP_Response<OJP_Types.LocationInformationDeliverySchema, Error>;
/**
 * LIR Response (OJP 1.0)
 * 
 * @category Response OJP 1.0
 */
export type OJPv1_LocationInformationRequestResponse = OJP_Response<OJP_Types.OJPv1_LocationInformationDeliverySchema, Error>;

/**
 * SER Response
 * 
 * @see {@link https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__OJPStopEventDeliveryStructure }
 * 
 * @category Response
 */
export type StopEventRequestResponse = OJP_Response<OJP_Types.StopEventDeliverySchema, Error>;
/**
 * SER Response (OJP 1.0)
 * 
 * @category Response OJP 1.0
 */
export type OJPv1_StopEventRequestResponse = OJP_Response<OJP_Types.OJPv1_StopEventDeliverySchema, Error>;

/**
 * TIR Response
 * 
 * @see {@link https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__OJPTripInfoDeliveryStructure }
 * 
 * @category Response
 */
export type TripInfoRequestResponse = OJP_Response<OJP_Types.TripInfoDeliverySchema, Error>;
/**
 * TIR Response (OJP 1.0)
 * 
 * @category Response OJP 1.0
 */
export type OJPv1_TripInfoRequestResponse = OJP_Response<OJP_Types.OJPv1_TripInfoDeliverySchema, Error>;

/**
 * TRR Response
 * 
 * @see {@link https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__OJPTripRefineDeliveryStructure }
 * 
 * @category Response
 */
export type TripRefineRequestResponse = OJP_Response<OJP_Types.TRR_DeliverySchema, Error>;

/**
 * TR Response
 * 
 * @see {@link https://vdvde.github.io/OJP/develop/documentation-tables/ojp.html#type_ojp__OJPTripDeliveryStructure }
 * 
 * @category Response
 */
export type TripRequestResponse = OJP_Response<OJP_Types.TripDeliverySchema, Error>;
/**
 * TR Response (OJP 1.0)
 * 
 * @category Response OJP 1.0
 */
export type OJPv1_TripRequestResponse = OJP_Response<OJP_Types.OJPv1_TripDeliverySchema, Error>;
