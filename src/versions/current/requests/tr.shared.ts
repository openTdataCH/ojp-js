import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";

export abstract class SharedTripRequest<S extends ResultSpec> extends BaseRequest<S> {
  protected static DefaultRequestParams(): OJP_Types.TripParamsSchema {
    const requestParams: OJP_Types.TripParamsSchema = {
      modeAndModeOfOperationFilter: [],
      
      numberOfResults: 5,
      numberOfResultsBefore: undefined,
      numberOfResultsAfter: undefined,

      useRealtimeData: 'explanatory',

      includeAllRestrictedLines: true,
      includeTrackSections: true,
      includeLegProjection: false,
      includeIntermediateStops: true,
    };

    return requestParams;
  }
}
