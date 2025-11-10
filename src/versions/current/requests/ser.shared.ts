import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";

export abstract class SharedStopEventRequest<S extends ResultSpec> extends BaseRequest<S> {
  protected static DefaultRequestParams(): OJP_Types.SER_RequestParamsSchema {
    const params: OJP_Types.SER_RequestParamsSchema = {
      includeAllRestrictedLines: true,
      numberOfResults: 10,
      stopEventType: 'departure',
      includePreviousCalls: true,
      includeOnwardCalls: true,
      useRealtimeData: 'explanatory',
    };

    return params;
  }
}
