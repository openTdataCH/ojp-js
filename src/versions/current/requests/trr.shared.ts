import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";

export abstract class SharedTripRefineRequest<S extends ResultSpec> extends BaseRequest<S> {
  protected static DefaultRequestParams(): OJP_Types.TRR_RequestParamsSchema {
    const params: OJP_Types.TRR_RequestParamsSchema = {
      numberOfResults: undefined,
      useRealtimeData: 'explanatory',
      includeAllRestrictedLines: true,
      includeIntermediateStops: true,
    };

    return params;
  }
}
