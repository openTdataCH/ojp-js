import * as OJP_Types from 'ojp-shared-types';

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
