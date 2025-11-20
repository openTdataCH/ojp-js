import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";
import { OJP_VERSION } from '../../../types/_all';

export abstract class SharedStopEventRequest<S extends ResultSpec> extends BaseRequest<S> {
  protected static DefaultRequestParams(version: OJP_VERSION = '2.0'): OJP_Types.SER_RequestParamsSchema {
    const params: OJP_Types.SER_RequestParamsSchema = {
      includeAllRestrictedLines: undefined, // this works only with OJP v2
      numberOfResults: 10,
      stopEventType: 'departure',
      includePreviousCalls: true,
      includeOnwardCalls: true,
      useRealtimeData: 'explanatory',
    };

    if (version === '2.0') {
      params.includeAllRestrictedLines = true;
    }

    return params;
  }
}
