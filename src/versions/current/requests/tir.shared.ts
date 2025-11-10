import * as OJP_Types from 'ojp-shared-types';

  public payload: OJP_Types.TIR_RequestSchema;

  protected constructor(journeyRef: string, operatingDayRef: string, params?: OJP_Types.TIR_RequestParamsSchema) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      journeyRef: journeyRef,
      operatingDayRef: operatingDayRef,
      params: params,
    };
  }
import { BaseRequest, ResultSpec } from "./base";

export abstract class SharedTripInfoRequest<S extends ResultSpec> extends BaseRequest<S> {
  protected static DefaultRequestParams() {
    const params: OJP_Types.TIR_RequestParamsSchema = {
      includeCalls: true,
      includeService: true,
      includeTrackProjection: false,
      includePlacesContext: true,
      includeSituationsContext: true,
    };

    return params;
  }
}
